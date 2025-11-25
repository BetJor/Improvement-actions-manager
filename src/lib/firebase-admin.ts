import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This function should only be called in a server environment.
function initializeAdminApp(): App {
  // Check if there are any initialized apps
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // If no app is initialized, check for environment variables
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('[Firebase Admin] Initializing with Application Default Credentials...');
    return initializeApp();
  }
  
  // Fallback for local development if the env var is not set
  try {
    const serviceAccount = require('../../service-account.json');
    console.log('[Firebase Admin] Initializing with service-account.json...');
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('[Firebase Admin] Failed to initialize. Service account key not found and GOOGLE_APPLICATION_CREDENTIALS is not set.');
    throw new Error('Firebase Admin SDK initialization failed.');
  }
}

export function getAdminAuth(): Auth {
  const app = initializeAdminApp();
  return getAuth(app);
}

export function getAdminFirestore(): Firestore {
  const app = initializeAdminApp();
  return getFirestore(app);
}
