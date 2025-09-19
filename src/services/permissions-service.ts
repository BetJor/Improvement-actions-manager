import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PermissionRule, ResponsibilityRole, ImprovementAction, ImprovementActionStatus } from '@/lib/types';
import { evaluatePattern } from '@/lib/pattern-evaluator';


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
                if (role.emailPattern) {
                    // This is where the pattern is resolved using the generic evaluator.
                    const resolvedEmail = evaluatePattern(role.emailPattern, { action });
                    // Check if the pattern was fully resolved
                    if (resolvedEmail && !resolvedEmail.includes('{{')) {
                        resolvedEmails.push(resolvedEmail);
                    }
                }
                break;
        }
    }

    return [...new Set(resolvedEmails)]; // Return unique emails
}
