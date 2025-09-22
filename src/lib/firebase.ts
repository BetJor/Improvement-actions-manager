
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

// Initialize Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, auth, db, storage };
