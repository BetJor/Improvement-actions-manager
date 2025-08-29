
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// IMPORTANT: Replace this with your own Firebase configuration
// You can get this from the Firebase console
const firebaseConfig = {
  "projectId": "improvement-actions-manager",
  "appId": "1:920139375274:web:3c4fd3616765e7480566d3",
  "storageBucket": "improvement-actions-manager.appspot.com",
  "apiKey": "AIzaSyDb99QMKUYzyWyajTwZ2plmEB1o35g_9H4",
  "authDomain": "improvement-actions-manager.firebaseapp.com",
  "messagingSenderId": "920139375274"
};

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// Connect to Firebase Emulators if running in development
// The check for window.location.hostname === "localhost" is a simple way to detect a local environment.
// It's important that this code block only runs once.
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    // Check if emulators are already connected to prevent re-initialization errors.
    // The auth object has a `_isInitialized` property we can check, though it's internal.
    // A safer check is to see if the emulator configuration has already been applied.
    if (!(auth as any).emulatorConfig) {
        try {
            console.log("Connecting to Firebase Emulators...");
            connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
            connectFirestoreEmulator(db, "127.0.0.1", 8080);
            console.log("Authentication & Firestore Emulators connected.");
        } catch (error) {
            console.error("Error connecting to Emulators: ", error);
        }
    }
}


export { firebaseApp, auth, db, storage };
