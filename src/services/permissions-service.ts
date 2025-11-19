import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PermissionRule, ResponsibilityRole, ImprovementAction, ImprovementActionStatus, Center } from '@/lib/types';
import { evaluatePattern } from '@/lib/pattern-evaluator';
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

    // Pre-fetch context data to avoid multiple DB calls inside the loop
    const allCenters = await getCenters();
    const centerDoc = action.centerId ? allCenters.find((c: Center) => c.id === action.centerId) : null;
    
    // Get the full center document from 'locations' to access 'responsibles'
    const locationDoc = action.centerId ? doc(db, 'locations', action.centerId) : null;

    const creator = await getUserById(action.creator.id);
    
    const context = {
        action: {
            ...action,
            center: centerDoc,
            creator: creator
        }
    };

    for (const roleId of roleIds) {
        const role = allRoles.find(r => r.id === roleId);
        if (!role) continue;

        switch (role.type) {
            case 'Fixed':
                if (role.email) resolvedEmails.push(role.email);
                break;
            case 'Pattern':
                if (role.emailPattern) {
                    const resolved = evaluatePattern(role.emailPattern, context);
                    resolvedEmails.push(...resolved.filter(email => !email.includes('{{')));
                }
                break;
            case 'Location':
                if (role.locationResponsibleField && locationDoc) {
                    try {
                        const locationSnap = await getDocs(query(collection(db, 'locations'), where('__name__', '==', locationDoc.id)));
                        if (!locationSnap.empty) {
                            const locationData = locationSnap.docs[0].data();
                            const responsibleEmail = locationData.responsibles?.[role.locationResponsibleField];
                            if (responsibleEmail) {
                                resolvedEmails.push(responsibleEmail);
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching location document for role resolution:`, error);
                    }
                }
                break;
        }
    }

    return [...new Set(resolvedEmails)]; // Return unique emails
}
