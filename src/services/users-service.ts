import { collection, getDocs, doc, getDoc, addDoc, query, orderBy, writeBatch, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { users as mockUsers } from '@/lib/static-data';
import type { User } from '@/lib/types';

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
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.email) {
            return { id: userDocSnap.id, ...userData } as User;
        }
        const authUser = auth.currentUser;
        if (authUser && authUser.uid === userId && authUser.email) {
            await updateDoc(userDocRef, { email: authUser.email });
            return { id: userDocSnap.id, ...userData, email: authUser.email } as User;
        }
        return { id: userDocSnap.id, ...userData } as User;
    }
    
    // If user is not in 'users' collection, they probably just signed up.
    // We create a basic user profile for them.
    const authUser = auth.currentUser;
    if (authUser && authUser.uid === userId) {
        const newUser: User = {
            id: authUser.uid,
            name: authUser.displayName || authUser.email || 'Usuari Nou',
            email: authUser.email || '',
            role: 'Creator', // Default role for new sign-ups
            avatar: authUser.photoURL || `https://i.pravatar.cc/150?u=${authUser.uid}`
        };
        await setDoc(userDocRef, newUser);
        return newUser;
    }

    console.warn(`User with ID ${userId} not found in Firestore.`);
    return null;
}


export async function addUser(user: Omit<User, 'id'>): Promise<string> {
    // In a real app, you'd create the user in Firebase Auth first,
    // and use the resulting UID as the document ID here.
    // This function is mainly for manual additions via the user management page.
    const collectionRef = collection(db, 'users');
    const docRef = await addDoc(collectionRef, user);
    return docRef.id;
}

export async function updateUser(userId: string, user: Partial<Omit<User, 'id'>>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, user);
}

export async function deleteUser(userId: string): Promise<void> {
    // In a real app, you should also handle deleting the user from Firebase Auth.
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
}
