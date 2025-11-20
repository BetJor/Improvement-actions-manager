import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PermissionRule, ResponsibilityRole, ImprovementAction, ImprovementActionStatus, Center } from '@/lib/types';
import { evaluatePattern } from '@/services/pattern-evaluator';
import { getCenters } from './master-data-service';
import { getUserById } from './users-service';


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

    // Pre-fetch creator data once
    const creator = await getUserById(action.creator.id);
    const context = { action: { ...action, creator: creator } };

    for (const roleId of roleIds) {
        const role = allRoles.find(r => r.id === roleId);
        if (!role) continue;

        switch (role.type) {
            case 'Fixed':
                if (role.email) resolvedEmails.push(role.email);
                break;
            case 'Location':
                if (role.locationResponsibleField && role.actionFieldSource) {
                    // Get the ID(s) from the specified field in the action
                    const sourceIds = action[role.actionFieldSource as keyof ImprovementAction];
                    const locationIds = Array.isArray(sourceIds) ? sourceIds : [sourceIds];

                    for (const locationId of locationIds) {
                        if (!locationId) continue;
                        const locationDocRef = doc(db, 'locations', locationId);
                        try {
                            const locationSnap = await getDoc(locationDocRef);
                            if (locationSnap.exists()) {
                                const locationData = locationSnap.data();
                                const responsibleEmail = locationData.responsibles?.[role.locationResponsibleField];
                                if (responsibleEmail) {
                                    resolvedEmails.push(responsibleEmail);
                                }
                            }
                        } catch (error) {
                             console.error(`Error fetching location document for role resolution:`, error);
                        }
                    }
                }
                break;
        }
    }

    return [...new Set(resolvedEmails)]; // Return unique emails
}
