

import { collection, getDocs, doc, getDoc, addDoc, query, orderBy, writeBatch, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { users as mockUsers } from '@/lib/static-data';
import type { User } from '@/lib/types';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export async function getUsers(): Promise<User[]> {
    const usersCol = collection(db, 'users');
    let snapshot = await getDocs(query(usersCol, orderBy("name")));

    if (snapshot.empty) {
        console.log("Users collection is empty. Populating from static data...");
        const batch = writeBatch(db);
        mockUsers.forEach(user => {
            const docRef = doc(usersCol, user.id);
            batch.set(docRef, user);
        });
        await batch.commit();
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
    
    try {
        const authUser = auth.currentUser;
        if (authUser && authUser.uid === userId) {
            console.log(`User ${userId} not in Firestore, creating from Auth details.`);
            const newUser: User = {
                id: authUser.uid,
                name: authUser.displayName || authUser.email || 'Usuari Nou',
                email: authUser.email || '',
                role: 'Creator',
                avatar: authUser.photoURL || ""
            };
            
            setDoc(userDocRef, newUser)
              .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: newUser,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
              });
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

        const docRef = doc(db, "users", newUserId);

        setDoc(docRef, userProfile)
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'create',
                    requestResourceData: userProfile,
                } satisfies SecurityRuleContext);

                errorEmitter.emit('permission-error', permissionError);
                throw serverError;
            });
        
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
    updateDoc(docRef, user)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: user,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}

export async function deleteUser(userId: string): Promise<void> {
    const docRef = doc(db, 'users', userId);
    deleteDoc(docRef)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}

    