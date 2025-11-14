"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.addUser = addUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("@/lib/firebase");
const static_data_1 = require("@/lib/static-data");
const auth_1 = require("firebase/auth");
const error_emitter_1 = require("@/firebase/error-emitter");
const errors_1 = require("@/firebase/errors");
async function getUsers() {
    const usersCol = (0, firestore_1.collection)(firebase_1.db, 'users');
    let snapshot = await (0, firestore_1.getDocs)((0, firestore_1.query)(usersCol, (0, firestore_1.orderBy)("name")));
    if (snapshot.empty) {
        console.log("Users collection is empty. Populating from static data...");
        const batch = (0, firestore_1.writeBatch)(firebase_1.db);
        static_data_1.users.forEach(user => {
            const docRef = (0, firestore_1.doc)(usersCol, user.id);
            batch.set(docRef, user);
        });
        await batch.commit();
        snapshot = await (0, firestore_1.getDocs)((0, firestore_1.query)(usersCol, (0, firestore_1.orderBy)("name")));
        console.log("Users collection populated.");
    }
    return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
}
async function getUserById(userId) {
    if (!userId) {
        console.warn("getUserById called with null or undefined userId.");
        return null;
    }
    const userDocRef = (0, firestore_1.doc)(firebase_1.db, 'users', userId);
    try {
        const userDocSnap = await (0, firestore_1.getDoc)(userDocRef);
        if (userDocSnap.exists()) {
            return Object.assign({ id: userDocSnap.id }, userDocSnap.data());
        }
        else {
            console.warn(`[User Service] User with ID '${userId}' not found in Firestore. This might be expected if the user was deleted or the ID is incorrect.`);
            return null;
        }
    }
    catch (serverError) {
        // Create and emit a contextual error for permission issues.
        const permissionError = new errors_1.FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
        });
        error_emitter_1.errorEmitter.emit('permission-error', permissionError);
        // Also re-throw the original error to stop execution.
        throw serverError;
    }
}
async function addUser(userData) {
    if (!userData.password) {
        throw new Error("La contraseña es obligatoria para crear un nuevo usuario.");
    }
    try {
        const userCredential = await (0, auth_1.createUserWithEmailAndPassword)(firebase_1.auth, userData.email, userData.password);
        const newUserId = userCredential.user.uid;
        const userProfile = {
            id: newUserId,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${newUserId}`
        };
        const docRef = (0, firestore_1.doc)(firebase_1.db, "users", newUserId);
        (0, firestore_1.setDoc)(docRef, userProfile)
            .catch(async (serverError) => {
            const permissionError = new errors_1.FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: userProfile,
            });
            error_emitter_1.errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
        return newUserId;
    }
    catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("Este correo electrónico ya está en uso por otro usuario.");
        }
        console.error("Error creating user in Firebase Auth:", error);
        throw new Error("No se pudo crear el usuario en el sistema de autenticación.");
    }
}
async function updateUser(userId, user) {
    const docRef = (0, firestore_1.doc)(firebase_1.db, 'users', userId);
    (0, firestore_1.updateDoc)(docRef, user)
        .catch(async (serverError) => {
        const permissionError = new errors_1.FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: user,
        });
        error_emitter_1.errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
async function deleteUser(userId) {
    const docRef = (0, firestore_1.doc)(firebase_1.db, 'users', userId);
    (0, firestore_1.deleteDoc)(docRef)
        .catch(async (serverError) => {
        const permissionError = new errors_1.FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        error_emitter_1.errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
//# sourceMappingURL=users-service.js.map