
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    try {
        console.log("Connecting to Firebase Auth Emulator...");
        connectAuthEmulator(auth, "http://127.0.0.1:9099");
        console.log("Authentication Emulator connected to http://127.0.0.1:9099");
    } catch (error) {
        console.error("Error connecting to Auth Emulator: ", error);
    }
}


export { firebaseApp, auth, db, storage };
