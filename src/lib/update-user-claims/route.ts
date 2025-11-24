'use server';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { isUserMemberOfGroup } from '@/services/google-workspace';

interface UpdateClaimsRequest {
  email: string;
}

/**
 * POST /api/update-user-claims
 * This route acts as a secure backend endpoint (like a Cloud Function)
 * to update a user's custom claims based on their Google Workspace group memberships.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const body: UpdateClaimsRequest = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`[API Route] Processing claims update for user: ${email}`);

    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`[API Route] User ${email} found in Firebase Auth with UID: ${user.uid}.`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`[API Route] User ${email} not found in Firebase Auth. Creating a new user...`);
        try {
          user = await auth.createUser({
            email: email,
            emailVerified: true, // Assume verified as it comes from a trusted source
          });
          console.log(`[API Route] Successfully created user ${email} with UID: ${user.uid}`);
        } catch (createUserError: any) {
          console.error(`[API Route] Failed to create user ${email}:`, createUserError);
          throw new Error(`Failed to create user: ${createUserError.message}`);
        }
      } else {
        console.error(`[API Route] Error fetching user ${email}:`, error);
        throw new Error(error.message || 'An error occurred while fetching user data.');
      }
    }

    const groupsSnapshot = await db.collection('grups').get();
    const firestoreGroups = groupsSnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
    }));

    console.log(`[API Route] Found ${firestoreGroups.length} groups in Firestore to check against.`);

    // Run all membership checks in parallel for performance
    const membershipChecks = firestoreGroups.map(group =>
      isUserMemberOfGroup(email, group.email)
        .then(isMember => ({ groupEmail: group.email, isMember }))
        .catch(error => {
          console.warn(`[API Route] Failed to check membership for group ${group.email}:`, error);
          return { groupEmail: group.email, isMember: false };
        })
    );

    const results = await Promise.all(membershipChecks);

    const userGroups = results
      .filter(result => result.isMember)
      .map(result => result.groupEmail);

    console.log(`[API Route] User ${email} belongs to ${userGroups.length} groups: [${userGroups.join(', ')}]`);

    await auth.setCustomUserClaims(user.uid, {
      groups: userGroups,
      updatedAt: Date.now(),
    });

    console.log(`[API Route] Successfully updated custom claims for user: ${email}`);

    return NextResponse.json({
      success: true,
      email,
      groups: userGroups,
      message: `Updated custom claims with ${userGroups.length} groups`,
    });

  } catch (error: any) {
    console.error('[API Route] Critical error in update-user-claims:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update custom claims' },
      { status: 500 }
    );
  }
}
