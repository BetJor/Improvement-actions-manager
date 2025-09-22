import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  "projectId": "improvement-actions-manager",
  "appId": "1:920139375274:web:3c4fd3616765e7480566d3",
  "storageBucket": "improvement-actions-manager.appspot.com",
  "apiKey": "AIzaSyDb99QMKUYzyWyajTwZ2plmEB1o35g_9H4",
  "authDomain": "improvement-actions-manager.firebaseapp.com",
  "messagingSenderId": "920139375274"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators if running in development
if (process.env.NODE_ENV === 'development') {
    console.log("Connecting to Firebase Emulators");
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, "localhost", 9199);
}

export { app as firebaseApp, auth, db, storage };
