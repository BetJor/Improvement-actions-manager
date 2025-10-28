
import { collection, getDocs, doc, getDoc, addDoc, query, orderBy, writeBatch, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { users as mockUsers } from '@/lib/static-data';
import type { User } from '@/lib/types';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export async function getUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    let snapshot = await getDocs(query(usersCol, orderBy("name")));

    // If the collection is empty, populate it from static data
    if (snapshot.empty) {
        console.log("Users collection is empty. Populating from static data...");
        const batch = writeBatch(db);
        mockUsers.forEach(user => {
            const docRef = doc(usersCol, user.id); // Use the static ID
            batch.set(docRef, user);
        });
        await batch.commit();
        // Re-fetch the data after populating
        snapshot = await getDocs(query(usersCol, orderBy("name")));
        console.log("Users collection populated.");
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getUserById(userId: string): Promise<User | null> {
    if (!userId) {
        console.warn("getUserById called with null or undefined userId.");
        return null;
    }
    
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        return { id: userDocSnap.id, ...userDocSnap.data() } as User;
    }
    
    // If user is not in 'users' collection, they probably just signed up with Firebase Auth.
    // We create a basic user profile for them based on their auth details.
    try {
        // This part relies on Firebase Auth being up-to-date.
        // It's better to get the user from the client and pass it, but this is a server-side fallback.
        const authUser = auth.currentUser;
        if (authUser && authUser.uid === userId) {
            console.log(`User ${userId} not in Firestore, creating from Auth details.`);
            const newUser: User = {
                id: authUser.uid,
                name: authUser.displayName || authUser.email || 'Usuari Nou',
                email: authUser.email || '',
                role: 'Creator', // Default role for new sign-ups
                avatar: authUser.photoURL || ""
            };
            await setDoc(userDocRef, newUser);
            return newUser;
        }
    } catch (error) {
        console.error("Error trying to create user profile from Auth:", error);
    }

    console.warn(`User with ID ${userId} not found in Firestore and could not be created from Auth.`);
    return null;
}


export async function addUser(userData: Omit<User, 'id'> & { password?: string }): Promise<string> {
    
    if (!userData.password) {
        throw new Error("La contraseña es obligatoria para crear un nuevo usuario.");
    }

    // WARNING: This is a simplified example. In a real app, this should be a secure backend operation (e.g., Cloud Function).
    // The currently signed-in user must have permissions to create other users.
    // For this demo, we assume this is run by an admin on the client. This is NOT secure for production.
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const newUserId = userCredential.user.uid;
        
        const userProfile: User = {
            id: newUserId,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${newUserId}`
        };

        await setDoc(doc(db, "users", newUserId), userProfile);
        
        return newUserId;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("Este correo electrónico ya está en uso por otro usuario.");
        }
        console.error("Error creating user in Firebase Auth:", error);
        throw new Error("No se pudo crear el usuario en el sistema de autenticación.");
    }
}

export async function updateUser(userId: string, user: Partial<Omit<User, 'id'>>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, user);
}

export async function deleteUser(userId: string): Promise<void> {
    // In a real app, you should also handle deleting the user from Firebase Auth.
    // This requires an Admin SDK on a backend.
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
}
