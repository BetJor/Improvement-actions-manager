'use server';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import type { User } from '@/lib/types';

interface ImportUserRequest {
  email: string;
  name: string;
  avatar: string;
  role: 'Creator' | 'Responsible' | 'Director' | 'Committee' | 'Admin';
}

/**
 * Creates a user document in Firestore if it doesn't already exist.
 * This function is intended to be used only within a secure server environment (like this API route).
 * @param db - The Firestore admin instance.
 * @param userRecord - The user record from Firebase Authentication.
 * @param userData - Additional data for the user profile.
 */
async function findOrCreateUserInFirestore(db: FirebaseFirestore.Firestore, userRecord: import('firebase-admin/auth').UserRecord, userData: Omit<ImportUserRequest, 'email'>) {
    const userDocRef = db.collection("users").doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
        console.log(`[API Route] User ${userRecord.email} does not have a Firestore document. Creating one...`);
        const userProfile: User = {
            id: userRecord.uid,
            name: userData.name,
            email: userRecord.email!,
            role: userData.role,
            avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userRecord.uid}`
        };
        await userDocRef.set(userProfile);
        console.log(`[API Route] Successfully created Firestore document for user: ${userRecord.email}`);
    } else {
        console.log(`[API Route] User ${userRecord.email} already has a Firestore document.`);
    }
}


export async function POST(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const body: ImportUserRequest = await request.json();
    const { email, name, avatar, role } = body;

    if (!email || !name) {
      return NextResponse.json({ success: false, message: 'Email and name are required' }, { status: 400 });
    }

    let userRecord;
    let wasUserCreated = false;

    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`[API Route] User ${email} already exists in Firebase Auth with UID: ${userRecord.uid}.`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`[API Route] User ${email} not found in Firebase Auth. Creating a new user...`);
        try {
          // Generate a secure random password as it's required for creation,
          // but the user will use Google Sign-In or password reset.
          const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

          userRecord = await auth.createUser({
            email: email,
            emailVerified: true,
            password: randomPassword,
            displayName: name,
            photoURL: avatar
          });
          wasUserCreated = true;
          console.log(`[API Route] Successfully created user ${email} in Auth with UID: ${userRecord.uid}`);
        } catch (createUserError: any) {
          console.error(`[API Route] Failed to create user ${email} in Auth:`, createUserError);
          return NextResponse.json({ success: false, message: `Failed to create user in Auth: ${createUserError.message}` }, { status: 500 });
        }
      } else {
        // Handle other auth errors during user fetching
        console.error(`[API Route] Error fetching user ${email} from Auth:`, error);
        return NextResponse.json({ success: false, message: error.message || 'An error occurred while fetching user data from Auth.' }, { status: 500 });
      }
    }
    
    // After creating or finding the user in Auth, ensure they exist in Firestore.
    try {
        await findOrCreateUserInFirestore(db, userRecord, { name, avatar, role });
    } catch(firestoreError: any) {
        console.error(`[API Route] Failed to create Firestore document for ${email}:`, firestoreError);
        // If we just created the auth user, we should consider rolling it back or logging this inconsistency.
        if(wasUserCreated) {
            console.warn(`[API Route] Inconsistency: Auth user ${email} was created, but Firestore doc creation failed.`);
        }
        return NextResponse.json({ success: false, message: `Failed to create user profile in database: ${firestoreError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been successfully processed.`,
    });

  } catch (error: any) {
    console.error('[API Route] Critical error in user processing route:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An unexpected error occurred on the server.' },
      { status: 500 }
    );
  }
}
