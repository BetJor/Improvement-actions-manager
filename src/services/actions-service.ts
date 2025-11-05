

import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, orderBy, limit, arrayUnion, Timestamp, runTransaction, arrayRemove, where, writeBatch, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, parse, subDays, addDays } from 'date-fns';
import type { ImprovementAction, ImprovementActionStatus, ActionUserInfo, ProposedAction } from '@/lib/types';
import { planTraditionalActionWorkflow, getWorkflowSettings } from './workflow-service';
import { getUsers, getUserById } from './users-service';
import { getCategories, getSubcategories, getAffectedAreas, getCenters, getActionTypes, getResponsibilityRoles } from './master-data-service';
import { getPermissionRuleForState, resolveRoles } from './permissions-service';
import { sendStateChangeEmail } from './notification-service';

interface CreateActionData extends Omit<ImprovementAction, 'id' | 'actionId' | 'status' | 'creationDate' | 'category' | 'subcategory' | 'type' | 'affectedAreas' | 'affectedCenters' | 'center' | 'analysisDueDate' | 'implementationDueDate' | 'closureDueDate' | 'readers' | 'authors' | 'verificationDueDate' > {
  status: 'Borrador' | 'Pendiente Análisis';
  category: string; // ID
  subcategory: string; // ID
  typeId: string;
  affectedAreasIds: string[];
  affectedCentersIds?: string[];
  centerId?: string;
  locale?: string;
}

// Funció per obtenir les dades de Firestore
export const getActions = async (): Promise<ImprovementAction[]> => {
    const actionsCol = collection(db, 'actions');
    let actionsSnapshot = await getDocs(query(actionsCol, orderBy("actionId", "desc")));

    const users = await getUsers();

    return actionsSnapshot.docs.map(doc => {
        const data = doc.data();

        // Convert any Timestamps to serializable strings
        if (data.analysis && data.analysis.proposedActions) {
            data.analysis.proposedActions = data.analysis.proposedActions.map((pa: any) => {
                if (pa.dueDate instanceof Timestamp) {
                    return { ...pa, dueDate: pa.dueDate.toDate().toISOString() };
                }
                if (pa.statusUpdateDate instanceof Timestamp) {
                    return { ...pa, statusUpdateDate: pa.statusUpdateDate.toDate().toISOString() };
                }
                return pa;
            });
        }
        if (data.creationDate && data.creationDate instanceof Timestamp) {
            data.creationDate = data.creationDate.toDate().toISOString();
        }
        if (data.analysisDueDate && data.analysisDueDate instanceof Timestamp) {
            data.analysisDueDate = data.analysisDueDate.toDate().toISOString();
        }
        if (data.verificationDueDate && data.verificationDueDate instanceof Timestamp) {
            data.verificationDueDate = data.verificationDueDate.toDate().toISOString();
        }
        if (data.implementationDueDate && data.implementationDueDate instanceof Timestamp) {
            data.implementationDueDate = data.implementationDueDate.toDate().toISOString();
        }
        if (data.closureDueDate && data.closureDueDate instanceof Timestamp) {
            data.closureDueDate = data.closureDueDate.toDate().toISOString();
        }
         if (data.analysis?.analysisDate && data.analysis.analysisDate instanceof Timestamp) {
            data.analysis.analysisDate = data.analysis.analysisDate.toDate().toISOString();
        }
        if (data.verification?.verificationDate && data.verification.verificationDate instanceof Timestamp) {
            data.verification.verificationDate = data.verification.verificationDate.toDate().toISOString();
        }
         if (data.closure?.date && data.closure.date instanceof Timestamp) {
            data.closure.date = data.closure.date.toDate().toISOString();
        }


        const responsibleUser = users.find(u => u.id === data.responsibleGroupId);
        
        return { 
          id: doc.id,
          ...data,
          responsibleUser: responsibleUser ? { id: responsibleUser.id, name: responsibleUser.name, avatar: responsibleUser.avatar } : undefined,
        } as ImprovementAction;
    });
}


export const getActionById = async (id: string): Promise<ImprovementAction | null> => {
    const actionDocRef = doc(db, 'actions', id);
    const actionDocSnap = await getDoc(actionDocRef);
    const users = await getUsers();

    if (actionDocSnap.exists()) {
        const data = actionDocSnap.data();

        // Convert any Timestamps to serializable ISO strings
        const convertTimestamp = (date: any) => {
            if (date instanceof Timestamp) {
                return date.toDate().toISOString();
            }
            if(typeof date === 'string') {
                return date;
            }
            // Fallback for dd/MM/yyyy strings - might not be needed anymore
            if (typeof date === 'string' && date.includes('/')) {
                try {
                    return parse(date, 'dd/MM/yyyy', new Date()).toISOString();
                } catch {
                    return date; // Return original if parsing fails
                }
            }
            return date;
        }

        if (data.analysis && data.analysis.proposedActions) {
            data.analysis.proposedActions = data.analysis.proposedActions.map((pa: any) => ({
                ...pa,
                dueDate: convertTimestamp(pa.dueDate),
                statusUpdateDate: convertTimestamp(pa.statusUpdateDate),
            }));
        }
         if (data.comments) {
            data.comments = data.comments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        const serializableData = {
            ...data,
            creationDate: convertTimestamp(data.creationDate),
            analysisDueDate: convertTimestamp(data.analysisDueDate),
            verificationDueDate: convertTimestamp(data.verificationDueDate),
            implementationDueDate: convertTimestamp(data.implementationDueDate),
            closureDueDate: convertTimestamp(data.closureDueDate),
            analysis: data.analysis ? {
                ...data.analysis,
                analysisDate: convertTimestamp(data.analysis.analysisDate),
            } : undefined,
            verification: data.verification ? {
                ...data.verification,
                verificationDate: convertTimestamp(data.verification.verificationDate),
            } : undefined,
            closure: data.closure ? {
                ...data.closure,
                date: convertTimestamp(data.closure.date),
            } : undefined,
        };

        // Populate responsible user info
        if (data.responsibleGroupId) {
            const responsibleUser = users.find(u => u.email === data.responsibleGroupId);
            if(responsibleUser) {
                serializableData.responsibleUser = {
                    id: responsibleUser.id,
                    name: responsibleUser.name,
                    avatar: responsibleUser.avatar || undefined,
                }
            }
        }
        return { ...serializableData, id: actionDocSnap.id } as ImprovementAction;
    } else {
        console.warn(`Action with Firestore ID ${id} not found.`);
        return null;
    }
}

// Function to create a new action
export async function createAction(data: CreateActionData, masterData: any): Promise<ImprovementAction> {
    const actionsCol = collection(db, 'actions');
  
    // 1. Get the last actionId to generate the new one
    const lastActionQuery = query(actionsCol, orderBy("actionId", "desc"), limit(1));
    const lastActionSnapshot = await getDocs(lastActionQuery);
    
    let newActionIdNumber = 1;
    if (!lastActionSnapshot.empty) {
      const lastAction = lastActionSnapshot.docs[0].data();
      const lastId = lastAction.actionId || "AM-24000";
      const lastNumber = parseInt(lastId.split('-')[1].substring(2));
      newActionIdNumber = lastNumber + 1;
    }
  
    const year = new Date().getFullYear().toString().substring(2);
    const newActionId = `AM-${year}${newActionIdNumber.toString().padStart(3, '0')}`;
  
    // 2. Prepare the new action object
    const today = new Date();
    const creationDate = today.toISOString();

    const creatorDetails = await getUserById(data.creator.id);

    // Find names from IDs
    const categoryName = masterData.origins.data.find((c: any) => c.id === data.category)?.name || data.category || '';
    const subcategoryName = masterData.classifications.data.find((s: any) => s.id === data.subcategory)?.name || data.subcategory || '';
    const affectedAreasNames = data.affectedAreasIds.map(id => masterData.affectedAreas.find((a: any) => a.id === id)?.name || id);
    const centerName = masterData.centers.data.find((c: any) => c.id === data.centerId)?.name || data.centerId || '';
    const affectedCentersNames = data.affectedCentersIds?.map(id => masterData.centers.data.find((c: any) => c.id === id)?.name || id);
    const typeName = masterData.ambits.data.find((t: any) => t.id === data.typeId)?.name || data.typeId || '';

    // Get the global workflow settings for due dates
    const workflowSettings = await getWorkflowSettings();

    const newActionData: Omit<ImprovementAction, 'id'> = {
      actionId: newActionId,
      title: data.title,
      category: categoryName,
      categoryId: data.category,
      subcategory: subcategoryName,
      subcategoryId: data.subcategory,
      description: data.description,
      type: typeName,
      typeId: data.typeId,
      status: data.status || 'Borrador',
      affectedAreas: affectedAreasNames,
      affectedAreasIds: data.affectedAreasIds,
      affectedCenters: affectedCentersNames,
      affectedCentersIds: data.affectedCentersIds,
      center: centerName,
      centerId: data.centerId,
      assignedTo: data.assignedTo,
      creator: {
        id: data.creator.id,
        name: creatorDetails?.name || data.creator.name,
        avatar: creatorDetails?.avatar || "",
        email: creatorDetails?.email || '',
      },
      responsibleGroupId: data.assignedTo,
      creationDate: creationDate,
      analysisDueDate: addDays(today, workflowSettings.analysisDueDays).toISOString(), 
      verificationDueDate: '',
      implementationDueDate: '', 
      closureDueDate: '',
      followers: [data.creator.id], // Automatically follow created actions
      readers: [],
      authors: [],
      ...(data.originalActionId && { originalActionId: data.originalActionId }),
      ...(data.originalActionTitle && { originalActionTitle: data.originalActionTitle }),
    };
  
    // 3. Apply initial permissions for 'Borrador' state
    if (newActionData.status === 'Borrador' && newActionData.creator.email) {
        newActionData.readers = [newActionData.creator.email];
        newActionData.authors = [newActionData.creator.email];
    }

    // 5. Add the new document to Firestore
    const docRef = await addDoc(actionsCol, newActionData);
    const newAction = { id: docRef.id, ...newActionData } as ImprovementAction;

    // 6. Handle status change logic if not a draft
    if (newAction.status !== 'Borrador') {
        await handleStatusChange(newAction, 'Borrador');
    }
    
    // Return the full object to update the local state
    return newAction;
}

// Private function to handle status change logic (permissions and notifications)
async function handleStatusChange(action: ImprovementAction, oldStatus: ImprovementActionStatus) {
    console.log(`[ActionService] handleStatusChange called for action ${action.id} from ${oldStatus} to ${action.status}`);
    const actionDocRef = doc(db, 'actions', action.id);
    
    // Step 1: Update due dates based on the new status
    const workflowSettings = await getWorkflowSettings();
    const dataToUpdate: any = {};
    const today = new Date();

    if (action.status === 'Pendiente Comprobación') {
        dataToUpdate.verificationDueDate = addDays(today, workflowSettings.verificationDueDays).toISOString();
    }
    
    if (action.status === 'Pendiente de Cierre') {
        dataToUpdate.closureDueDate = addDays(today, workflowSettings.closureDueDays).toISOString();
    }
    
    if (Object.keys(dataToUpdate).length > 0) {
        console.log(`[ActionService] Updating due dates for action ${action.id}:`, dataToUpdate);
        await updateDoc(actionDocRef, dataToUpdate);
    }
    
    console.log(`[ActionService] Updating permissions for action ${action.id}...`);
    await updateActionPermissions(action.id, action.typeId, action.status, action);
}

export async function updateAction(
    actionId: string, 
    data: Partial<ImprovementAction> & { newComment?: any; adminEdit?: any; updateProposedActionStatus?: any; updateProposedAction?: ProposedAction }, 
    masterData: any | null = null, 
    statusFromForm?: 'Borrador' | 'Pendiente Análisis'
): Promise<{ updatedAction: ImprovementAction, bisCreationResult?: { createdBisTitle?: string, foundBisTitle?: string } }> {
    const actionDocRef = doc(db, 'actions', actionId);
    const originalActionSnap = await getDoc(actionDocRef);
    if (!originalActionSnap.exists()) {
        throw new Error(`Action with ID ${actionId} not found.`);
    }
    const originalAction = { id: originalActionSnap.id, ...originalActionSnap.data() } as ImprovementAction;
    
    let dataToUpdate: any = { ...data };
    let bisCreationResult: { createdBisTitle?: string, foundBisTitle?: string } = {};

    // --- Status Change Logic (for form edits) ---
    if (statusFromForm && statusFromForm !== originalAction.status) {
        dataToUpdate.status = statusFromForm;
    }


    // --- Admin Edit Comment Logic ---
    const adminEditInfo = data.adminEdit;
    if (adminEditInfo) {
        const { field, label, user, overrideComment, actionIndex } = adminEditInfo;
        let commentText;
        if (overrideComment) {
            commentText = overrideComment;
        } else if (actionIndex !== undefined) {
             commentText = `El administrador ${user} ha modificado el campo '${label}' de la acción propuesta ${actionIndex + 1}.`;
        } else {
            commentText = `El administrador ${user} ha modificado el campo '${label}'.`;
        }
        
        dataToUpdate.comments = arrayUnion({
            id: crypto.randomUUID(),
            author: { id: 'system', name: 'Sistema' },
            date: new Date().toISOString(),
            text: commentText
        });
        delete dataToUpdate.adminEdit;
    }
    
    // Determine if it's a full form update or a partial one
    const isFullFormUpdate = !!masterData;

    if (isFullFormUpdate) {
        if(data.affectedCentersIds){
            dataToUpdate.affectedCenters = data.affectedCentersIds.map((id:string) => masterData.centers.data.find((c:any) => c.id === id)?.name || id);
        }
    } else {
        // Handle partial updates (admin edits, status changes, etc.)
        if (data.updateProposedActionStatus) {
            await runTransaction(db, async (transaction) => {
                const actionDoc = await transaction.get(actionDocRef);
                if (!actionDoc.exists()) throw "Document does not exist!";
                
                const currentAction = actionDoc.data() as ImprovementAction;
                const proposedActions = currentAction.analysis?.proposedActions || [];
                
                const updatedProposedActions = proposedActions.map(pa => 
                    pa.id === data.updateProposedActionStatus!.proposedActionId 
                        ? { ...pa, status: data.updateProposedActionStatus!.status, statusUpdateDate: new Date().toISOString() } 
                        : pa
                );
                
                transaction.update(actionDocRef, { "analysis.proposedActions": updatedProposedActions });
            });
            dataToUpdate = {}; // Reset since transaction handles it
        } else if (data.updateProposedAction) {
             await runTransaction(db, async (transaction) => {
                const actionDoc = await transaction.get(actionDocRef);
                if (!actionDoc.exists()) throw "Document does not exist!";

                const currentAction = actionDoc.data() as ImprovementAction;
                const proposedActions = currentAction.analysis?.proposedActions || [];

                const updatedProposedActions = proposedActions.map(pa =>
                    pa.id === data.updateProposedAction!.id
                        ? { ...data.updateProposedAction, dueDate: new Date(data.updateProposedAction!.dueDate).toISOString() }
                        : pa
                );
                
                const updatePayload: any = { "analysis.proposedActions": updatedProposedActions };
                
                const dueDates = updatedProposedActions
                    .map((pa: ProposedAction) => pa.dueDate ? new Date(pa.dueDate as string) : null)
                    .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

                if (dueDates.length > 0) {
                    const maxDueDate = new Date(Math.max.apply(null, dueDates.map(d => d.getTime())));
                    updatePayload.implementationDueDate = maxDueDate.toISOString();
                } else {
                     updatePayload.implementationDueDate = '';
                }

                // If a comment was also generated, add it in the same transaction
                if (dataToUpdate.comments) {
                    updatePayload.comments = dataToUpdate.comments;
                }
                transaction.update(actionDocRef, updatePayload);
            });
            delete dataToUpdate.updateProposedAction;
            delete dataToUpdate.comments; // Handled in transaction
        } else {
            // This is for other updates like analysis, verification, closure, simple admin edits
            // or new comments without other data.
            if (data.newComment) {
                dataToUpdate.comments = arrayUnion(data.newComment);
                delete dataToUpdate.newComment;
            }

            if (data.analysis && Array.isArray(data.analysis.proposedActions)) {
                const dueDates = data.analysis.proposedActions
                    .map((pa: ProposedAction) => pa.dueDate ? new Date(pa.dueDate as string) : null)
                    .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

                if (dueDates.length > 0) {
                    const maxDueDate = new Date(Math.max.apply(null, dueDates.map(d => d.getTime())));
                    dataToUpdate.implementationDueDate = maxDueDate.toISOString();
                } else {
                     dataToUpdate.implementationDueDate = '';
                }
            }

            if (dataToUpdate.status === 'Pendiente Análisis' && originalAction.status === 'Borrador' && originalAction.creator?.id) {
                dataToUpdate.followers = arrayUnion(originalAction.creator.id);
            }
        }
    }
    
    // --- BIS LOGIC (now centralized) ---
    const allMasterData = {
        origins: { data: await getCategories() },
        classifications: { data: await getSubcategories() },
        affectedAreas: await getAffectedAreas(),
        centers: { data: await getCenters() },
        ambits: { data: await getActionTypes() },
        responsibilityRoles: { data: await getResponsibilityRoles() },
    };

    const createBisActionFrom = async (action: ImprovementAction, responsible: ActionUserInfo, notes: string) => {
        const bisActionData: CreateActionData = {
            title: `${action.title} BIS`,
            description: `Acción creada automáticamente por el cierre no conforme de la acción ${action.actionId}.\n\nObservaciones de cierre no conforme:\n${notes}`,
            category: action.categoryId, subcategory: action.subcategoryId,
            affectedAreasIds: action.affectedAreasIds, centerId: action.centerId,
            affectedCentersIds: action.affectedCentersIds,
            assignedTo: action.assignedTo, typeId: action.typeId,
            creator: responsible,
            status: 'Borrador', originalActionId: action.id,
            originalActionTitle: `${action.actionId}: ${action.title}`,
        };
        const createdBisAction = await createAction(bisActionData, allMasterData);
        bisCreationResult.createdBisTitle = `${createdBisAction.actionId}: ${createdBisAction.title}`;
    };

    // Scenario: Normal user closure to 'No Conforme'
    if (data.closure && !data.closure.isCompliant && originalAction.status !== 'Finalizada') {
        await createBisActionFrom(originalAction, data.closure.closureResponsible, data.closure.notes);
    }
    // Scenario: Admin edits to 'No Conforme'
    if (data['closure.isCompliant'] === false && originalAction.closure?.isCompliant === true) {
        await createBisActionFrom(originalAction, originalAction.closure.closureResponsible, originalAction.closure.notes);
    }
    
    // Scenario: Admin edits to 'Conforme'
    if (data['closure.isCompliant'] === true && originalAction.closure?.isCompliant === false) {
         const q = query(collection(db, "actions"), where("originalActionId", "==", originalAction.id));
         const querySnapshot = await getDocs(q);
         if (!querySnapshot.empty) {
             const bisActionDoc = querySnapshot.docs[0];
             bisCreationResult.foundBisTitle = `${bisActionDoc.data().actionId}: ${bisActionDoc.data().title}`;
         }
    }
    
    if (Object.keys(dataToUpdate).length > 0) {
        await updateDoc(actionDocRef, dataToUpdate);
    }
    
    const updatedActionDoc = await getDoc(actionDocRef);
    const updatedAction = { id: updatedActionDoc.id, ...updatedActionDoc.data() } as ImprovementAction;

    if (updatedAction.status !== originalAction.status) {
        await handleStatusChange(updatedAction, originalAction.status);
    }

    const finalAction = await getActionById(actionId);
    return { updatedAction: finalAction!, bisCreationResult };
}

export async function toggleFollowAction(actionId: string, userId: string): Promise<void> {
    const actionDocRef = doc(db, 'actions', actionId);
    
    await runTransaction(db, async (transaction) => {
        const actionDoc = await transaction.get(actionDocRef);
        if (!actionDoc.exists()) {
            throw "Document does not exist!";
        }
        
        const currentFollowers = actionDoc.data().followers || [];
        if (currentFollowers.includes(userId)) {
            // Unfollow
            transaction.update(actionDocRef, { followers: arrayRemove(userId) });
        } else {
            // Follow
            transaction.update(actionDocRef, { followers: arrayUnion(userId) });
        }
    });
}

export async function getFollowedActions(userId: string): Promise<ImprovementAction[]> {
    if (!userId) return [];
    const actionsCol = collection(db, 'actions');
    const q = query(actionsCol, where("followers", "array-contains", userId), orderBy("actionId", "desc"));
    
    const querySnapshot = await getDocs(q);
    
    const actions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ImprovementAction));

    return actions;
}

export async function updateActionPermissions(actionId: string, typeId: string, status: ImprovementActionStatus, existingAction?: ImprovementAction) {
    console.log(`[ActionService] updateActionPermissions for action ${actionId}, status ${status}`);
    const actionDocRef = doc(db, 'actions', actionId);
    let currentAction = existingAction;

    if (!currentAction) {
        const docSnap = await getDoc(actionDocRef);
        if (docSnap.exists()) {
            currentAction = docSnap.data() as ImprovementAction;
        } else {
            console.error("[ActionService] Cannot update permissions: Action document not found.");
            return;
        }
    }
    
    // Special rule for 'Borrador' state
    if (status === 'Borrador') {
        const creatorEmail = currentAction.creator?.email || (await getUserById(currentAction.creator.id))?.email;
        if (creatorEmail) {
            console.log(`[ActionService] Setting 'Borrador' permissions for creator: ${creatorEmail}`);
            await updateDoc(actionDocRef, {
                readers: [creatorEmail],
                authors: [creatorEmail],
            });
        } else {
            console.warn(`[ActionService] Action ${actionId} in 'Borrador' state has no creator email. Permissions not set.`);
             await updateDoc(actionDocRef, {
                readers: [],
                authors: [],
            });
        }
        return;
    }

    const permissionRule = await getPermissionRuleForState(typeId, status);
    if (!permissionRule) {
        console.warn(`[ActionService] No permission rule found for type ${typeId} and status ${status}. Keeping existing permissions.`);
        return;
    }
    console.log(`[ActionService] Found permission rule:`, permissionRule);

    const allRoles = await getResponsibilityRoles();

    const newReaders = await resolveRoles(permissionRule.readerRoleIds, allRoles, currentAction);
    const newAuthors = await resolveRoles(permissionRule.authorRoleIds, allRoles, currentAction);
    console.log(`[ActionService] Resolved roles -> Readers: ${newReaders.join(', ')}, Authors: ${newAuthors.join(', ')}`);
    
    // READERS: Cumulative. Combine existing readers with new ones.
    const combinedReaders = [...new Set([...(currentAction.readers || []), ...newReaders, ...newAuthors])];

    // AUTHORS: Restrictive. Only the ones from the new rule.
    // Authors are implicitly readers, so we ensure they are in the readers list as well.
    const finalAuthors = [...new Set(newAuthors)];
    const finalReaders = [...new Set([...combinedReaders, ...finalAuthors])];

    console.log(`[ActionService] Final permissions -> Readers: ${finalReaders.join(', ')}, Authors: ${finalAuthors.join(', ')}`);

    await updateDoc(actionDocRef, {
        readers: finalReaders,
        authors: finalAuthors
    });
    console.log(`[ActionService] Permissions updated successfully for action ${actionId}.`);
}
