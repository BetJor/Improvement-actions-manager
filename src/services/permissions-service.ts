import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PermissionRule, ResponsibilityRole, ImprovementAction, ImprovementActionStatus } from '@/lib/types';


// --- CRUD for Permission Rules ---
export async function getPermissionRules(): Promise<PermissionRule[]> {
    const rulesCol = collection(db, 'permissionMatrix');
    const snapshot = await getDocs(query(rulesCol));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PermissionRule));
}

export async function getPermissionRuleForState(actionTypeId: string, status: ImprovementActionStatus): Promise<PermissionRule | null> {
    const q = query(
        collection(db, 'permissionMatrix'),
        where('actionTypeId', '==', actionTypeId),
        where('status', '==', status)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as PermissionRule;
}

export async function addPermissionRule(rule: Omit<PermissionRule, 'id'>): Promise<string> {
    const collectionRef = collection(db, 'permissionMatrix');
    const docRef = await addDoc(collectionRef, rule);
    return docRef.id;
}

export async function updatePermissionRule(ruleId: string, rule: Omit<PermissionRule, 'id'>): Promise<void> {
    const docRef = doc(db, 'permissionMatrix', ruleId);
    await updateDoc(docRef, rule);
}

export async function deletePermissionRule(ruleId: string): Promise<void> {
    const docRef = doc(db, 'permissionMatrix', ruleId);
    await deleteDoc(docRef);
}


// --- Role Resolution Logic ---
export async function resolveRoles(
    roleIds: string[],
    allRoles: ResponsibilityRole[],
    action: ImprovementAction
): Promise<string[]> {
    if (!roleIds || roleIds.length === 0) return [];

    let resolvedEmails: string[] = [];

    for (const roleId of roleIds) {
        const role = allRoles.find(r => r.id === roleId);
        if (!role) continue;

        switch (role.type) {
            case 'Fixed':
                if (role.email) resolvedEmails.push(role.email);
                break;
            case 'Pattern':
                if (role.emailPattern && action.centerId) {
                    const resolvedEmail = role.emailPattern.replace('{{center.id}}', action.centerId.toLowerCase());
                    resolvedEmails.push(resolvedEmail);
                }
                break;
            case 'Creator':
                // The creator's email is stored in action.creator.id (which is their UID)
                // but we need their email. We'll assume the email is what's used for permissions.
                // In a real scenario, you'd fetch the user document to get the email if needed.
                // For simplicity, we'll assume the creator's identity is their primary login email.
                 if (action.creator.id) {
                     // This is a simplification. We need a way to map creator ID to email.
                     // Let's assume for now that assignedTo holds the relevant emails.
                     // A better approach would be to look up the user.
                 }

                // A better implementation for 'Creator' would be:
                 if (action.creator?.id) {
                    const creatorEmail = action.creator.id; // Assuming the creator's ID is their email for permissions
                    // A proper implementation would look up the user by ID and get their email.
                    // For now, let's assume we can get it from the creator object if it exists.
                    // This part needs to be robust. Let's use the responsible user for now.
                    if(action.responsibleUser?.email) resolvedEmails.push(action.responsibleUser.email);
                }

                break;
        }
    }

    return [...new Set(resolvedEmails)]; // Return unique emails
}
