

import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, orderBy, limit, arrayUnion, Timestamp, runTransaction, arrayRemove, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import type { ImprovementAction, ImprovementActionStatus, ActionUserInfo } from '@/lib/types';
import { planTraditionalActionWorkflow } from './workflow-service';
import { getUsers, getUserById } from './users-service';
import { getCategories, getSubcategories, getAffectedAreas, getCenters, getActionTypes, getResponsibilityRoles } from './master-data-service';
import { getPermissionRuleForState, resolveRoles } from './permissions-service';
import { sendStateChangeEmail } from './notification-service';

interface CreateActionData extends Omit<ImprovementAction, 'id' | 'actionId' | 'status' | 'creationDate' | 'category' | 'subcategory' | 'type' | 'affectedAreas' | 'center' | 'analysisDueDate' | 'implementationDueDate' | 'closureDueDate' | 'readers' | 'authors' > {
  status: 'Borrador' | 'Pendiente Análisis';
  category: string; // ID
  subcategory: string; // ID
  typeId: string;
  affectedAreasIds: string[];
  centerId?: string;
  locale?: string;
}


// Funció per obtenir les dades de Firestore
export const getActions = async (): Promise<ImprovementAction[]> => {
    const actionsCol = collection(db, 'actions');
    const actionsSnapshot = await getDocs(query(actionsCol, orderBy("actionId", "desc")));

    const users = await getUsers();

    return actionsSnapshot.docs.map(doc => {
        const data = doc.data();

        // Convert any Timestamps to serializable strings
        if (data.analysis && data.analysis.proposedActions) {
            data.analysis.proposedActions = data.analysis.proposedActions.map((pa: any) => {
                if (pa.dueDate instanceof Timestamp) {
                    return { ...pa, dueDate: pa.dueDate.toDate().toISOString() };
                }
                return pa;
            });
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

        // Convert Timestamps to Date for client-side usage
        if (data.analysis && data.analysis.proposedActions) {
            data.analysis.proposedActions = data.analysis.proposedActions.map((pa: any) => ({
                ...pa,
                // Firestore Timestamps need to be converted to Date objects
                dueDate: pa.dueDate instanceof Timestamp ? pa.dueDate.toDate() : new Date(pa.dueDate),
            }));
        }
        if (data.comments) {
            data.comments = data.comments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        // Populate responsible user info
        if (data.responsibleGroupId) {
            const responsibleUser = users.find(u => u.email === data.responsibleGroupId);
            if(responsibleUser) {
                data.responsibleUser = {
                    id: responsibleUser.id,
                    name: responsibleUser.name,
                    avatar: responsibleUser.avatar
                }
            }
        }
        return { ...data, id: actionDocSnap.id } as ImprovementAction;
    } else {
        console.warn(`Action with Firestore ID ${id} not found.`);
        return null;
    }
}

// Function to create a new action
export async function createAction(data: CreateActionData, masterData: any): Promise<ImprovementAction> {
    const actionsCol = collection(db, 'actions');
  
    // 1. Get the last actionId to generate the new one
    const lastActionQuery = query(actionsCol, orderBy("creationDate", "desc"), limit(1));
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
    const creationDate = format(today, 'dd/MM/yyyy');

    const creatorDetails = await getUserById(data.creator.id);

    // Find names from IDs
    const categoryName = masterData.categories.find((c: any) => c.id === data.category)?.name || data.category;
    const subcategoryName = masterData.subcategories.find((s: any) => s.id === data.subcategory)?.name || data.subcategory;
    const affectedAreasNames = data.affectedAreasIds.map(id => masterData.affectedAreas.find((a: any) => a.id === id)?.name || id);
    const centerName = masterData.centers.find((c: any) => c.id === data.centerId)?.name || data.centerId;
    const typeName = masterData.actionTypes.find((t: any) => t.id === data.typeId)?.name || data.typeId;

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
      center: centerName,
      centerId: data.centerId,
      assignedTo: data.assignedTo,
      creator: {
        id: data.creator.id,
        name: creatorDetails?.name || data.creator.name,
        avatar: creatorDetails?.avatar || data.creator.avatar,
        email: creatorDetails?.email || '',
      },
      responsibleGroupId: data.assignedTo,
      creationDate: creationDate,
      analysisDueDate: '', 
      implementationDueDate: '',
      closureDueDate: '',
      followers: [],
      readers: [],
      authors: [],
    };
  
    // 3. Plan the workflow using the traditional method
    const workflowPlan = await planTraditionalActionWorkflow(newActionData);

    // 4. Add the workflow plan and dates to the action data
    newActionData.workflowPlan = workflowPlan;
    newActionData.analysisDueDate = workflowPlan.steps.find(s => s.stepName.includes('Anàlisi'))?.dueDate || '';
    newActionData.implementationDueDate = workflowPlan.steps.find(s => s.stepName.includes('Implantació'))?.dueDate || '';
    newActionData.closureDueDate = workflowPlan.steps.find(s => s.stepName.includes('Tancament'))?.dueDate || '';
    
    // 5. Apply initial permissions for 'Borrador' state
    if (newActionData.status === 'Borrador' && newActionData.creator.email) {
        newActionData.readers = [newActionData.creator.email];
        newActionData.authors = [newActionData.creator.email];
    }
    
    // 6. Add user as follower if sending for analysis right away
    if (newActionData.status === 'Pendiente Análisis') {
      newActionData.followers = [newActionData.creator.id];
    }

    // 7. Add the new document to Firestore
    const docRef = await addDoc(actionsCol, newActionData);
    const newAction = { id: docRef.id, ...newActionData } as ImprovementAction;

    // 8. Handle status change logic if not a draft
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
    
    console.log(`[ActionService] Updating permissions for action ${action.id}...`);
    await updateActionPermissions(action.id, action.typeId, action.status, action);
        
    console.log(`[ActionService] Sending state change email for action ${action.id}...`);
    const recipient = await sendStateChangeEmail({
        action: action,
        oldStatus: oldStatus,
        newStatus: action.status,
    });
    console.log(`[ActionService] Email process completed. Recipient:`, recipient);
}


// Function to update an existing action
export async function updateAction(actionId: string, data: any, masterData?: any, status?: 'Borrador' | 'Pendiente Análisis'): Promise<ImprovementAction | null> {
    const actionDocRef = doc(db, 'actions', actionId);
    const originalActionSnap = await getDoc(actionDocRef);
    if (!originalActionSnap.exists()) {
        throw new Error(`Action with ID ${actionId} not found.`);
    }
    const originalAction = { id: originalActionSnap.id, ...originalActionSnap.data() } as ImprovementAction;
    
    let dataToUpdate: any = { ...data };
    
    // Handle specific update types first
    if (data.newComment) {
        await updateDoc(actionDocRef, { comments: arrayUnion(data.newComment) });
    } else if (data.updateProposedActionStatus) {
        await runTransaction(db, async (transaction) => {
            const actionDoc = await transaction.get(actionDocRef);
            if (!actionDoc.exists()) throw "Document does not exist!";
            
            const currentAction = actionDoc.data() as ImprovementAction;
            const proposedActions = currentAction.analysis?.proposedActions || [];
            
            const updatedProposedActions = proposedActions.map(pa => 
                pa.id === data.updateProposedActionStatus.proposedActionId 
                    ? { ...pa, status: data.updateProposedActionStatus.status } 
                    : pa
            );
            
            transaction.update(actionDocRef, { "analysis.proposedActions": updatedProposedActions });
        });
    } else {
        // This is a general update, likely from the main form or a status change
        
        // If masterData is present, we're editing the draft details
        if (masterData) {
            dataToUpdate = {
                ...dataToUpdate,
                title: data.title,
                description: data.description,
                assignedTo: data.assignedTo,
                responsibleGroupId: data.assignedTo,
                category: masterData.categories.find((c: any) => c.id === data.category)?.name || data.category,
                categoryId: data.category,
                subcategory: masterData.subcategories.find((s: any) => s.id === data.subcategory)?.name || data.subcategory,
                subcategoryId: data.subcategory,
                affectedAreas: data.affectedAreasIds.map((id: string) => masterData.affectedAreas.find((a: any) => a.id === id)?.name || id),
                affectedAreasIds: data.affectedAreasIds,
                center: masterData.centers.find((c: any) => c.id === data.centerId)?.name || data.centerId,
                centerId: data.centerId,
                type: masterData.actionTypes.find((t: any) => t.id === data.typeId)?.name || data.typeId,
                typeId: data.typeId,
            };
        }

        // If a new status is provided, update it
        if (status) {
            dataToUpdate.status = status;
        }
        
        // Auto-follow if sent to analysis
        if (status === 'Pendiente Análisis' && originalAction.creator?.id) {
            dataToUpdate.followers = arrayUnion(originalAction.creator.id);
        }

        // Handle closure logic for non-compliant actions
        if (data.closure && !data.closure.isCompliant) {
            const allMasterData = {
                categories: await getCategories(),
                subcategories: await getSubcategories(),
                affectedAreas: await getAffectedAreas(),
                centers: await getCenters(),
                actionTypes: await getActionTypes(),
                responsibilityRoles: await getResponsibilityRoles(),
            };
            const bisActionData: CreateActionData = {
                title: `${originalAction.title} BIS`,
                description: `${originalAction.description}\n\n--- \nObservaciones de cierre no conforme:\n${data.closure.notes}`,
                category: originalAction.categoryId,
                subcategory: originalAction.subcategoryId,
                affectedAreasIds: originalAction.affectedAreasIds,
                centerId: originalAction.centerId,
                assignedTo: originalAction.assignedTo,
                typeId: originalAction.typeId,
                creator: data.closure.closureResponsible,
                status: 'Borrador',
                originalActionId: originalAction.id,
                originalActionTitle: `${originalAction.actionId}: ${originalAction.title}`,
            };
            await createAction(bisActionData, allMasterData);
        }
        
        // Apply updates to Firestore
        if (Object.keys(dataToUpdate).length > 0) {
            await updateDoc(actionDocRef, dataToUpdate);
        }
    }
    
    // Get a fresh copy of the action *after* updates
    const updatedActionDoc = await getDoc(actionDocRef);
    const updatedAction = { id: updatedActionDoc.id, ...updatedActionDoc.data() } as ImprovementAction;

    // Handle status change if it occurred
    if (updatedAction.status !== originalAction.status) {
        await handleStatusChange(updatedAction, originalAction.status);
    }

    // Return the latest version of the document
    return await getActionById(actionId);
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
