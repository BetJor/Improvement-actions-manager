'use server';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { isUserMemberOfGroup } from '@/services/google-workspace';

interface DebugClaimsRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminFirestore();
    const body: DebugClaimsRequest = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`[API Debug] Processing claims debug for user: ${email}`);

    // --- Logic copied from update-user-claims route ---
    const rolesSnapshot = await db.collection('responsibilityRoles').get();
    
    // Extract all potential group emails directly from the responsibilityRoles collection
    const allPotentialGroupEmails = rolesSnapshot.docs
      .map(doc => doc.data().email) // Get the email field
      .filter(email => typeof email === 'string' && email.includes('@')); // Filter for valid emails

    console.log(`[API Debug] Found ${allPotentialGroupEmails.length} unique potential group emails in Firestore to check against.`);

    // Run all membership checks in parallel for performance
    const membershipChecks = allPotentialGroupEmails.map(groupEmail =>
      isUserMemberOfGroup(email, groupEmail)
        .then(isMember => ({ groupEmail, isMember }))
        .catch(error => {
          console.warn(`[API Debug] Failed to check membership for group ${groupEmail}:`, error);
          return { groupEmail, isMember: false };
        })
    );

    const results = await Promise.all(membershipChecks);

    const userGroups = results
      .filter(result => result.isMember)
      .map(result => result.groupEmail);

    console.log(`[API Debug] User ${email} belongs to ${userGroups.length} groups: [${userGroups.join(', ')}]`);

    // --- End of copied logic ---

    return NextResponse.json({
      success: true,
      allPotentialGroups: allPotentialGroupEmails,
      foundGroups: userGroups,
    });

  } catch (error: any) {
    console.error('[API Debug] Critical error in debug-user-claims:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to debug custom claims' },
      { status: 500 }
    );
  }
}
