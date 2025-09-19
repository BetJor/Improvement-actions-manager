
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, orderBy, limit, arrayUnion, Timestamp, runTransaction, arrayRemove, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import type { ImprovementAction, ImprovementActionStatus } from '@/lib/types';
import { planActionWorkflow } from '@/ai/flows/planActionWorkflow';
import { getUsers } from './users-service';
import { getCategories, getSubcategories, getAffectedAreas, getCenters, getActionTypes, getResponsibilityRoles } from './master-data-service';
import { getPermissionRuleForState, resolveRoles } from './permissions-service';

interface CreateActionData extends Omit<ImprovementAction, 'id' | 'actionId' | 'status' | 'creationDate' | 'category' | 'subcategory' | 'type' | 'affectedAreas' | 'center' | 'analysisDueDate' | 'implementationDueDate' | 'closureDueDate' | 'readers' | 'authors' > {
  status: 'Borrador' | 'Pendiente Análisis';
  category: string; // ID
  subcategory: string; // ID
  typeId: string;
  affectedAreasIds: string[];
  centerId?: string;
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
export async function createAction(data: CreateActionData, masterData: any): Promise<string> {
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

    // Find names from IDs
    const categoryName = masterData.categories.find((c: any) => c.id === data.category)?.name || data.category;
    const subcategoryName = masterData.subcategories.find((s: any) => s.id === data.subcategory)?.name || data.subcategory;
    const affectedAreasNames = data.affectedAreasIds.map(id => masterData.affectedAreas.find((a: any) => a.id === id)?.name || id);
    const centerName = masterData.centers.find((c: any) => c.id === data.centerId)?.name || data.centerId;
    const typeName = masterData.actionTypes.find((t: any) => t.id === data.typeId)?.name || data.typeId;

    const newAction: Omit<ImprovementAction, 'id'> = {
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
      creator: data.creator,
      responsibleGroupId: data.assignedTo,
      creationDate: creationDate,
      analysisDueDate: '', 
      implementationDueDate: '',
      closureDueDate: '',
      followers: [],
      readers: [],
      authors: [],
    };
  
    // Add the new document to Firestore
    const docRef = await addDoc(actionsCol, newAction);

    // Apply initial permissions
    updateActionPermissions(docRef.id, newAction.typeId, newAction.status);

    // Plan the workflow asynchronously in the background.
    // We don't await this so the UI can respond immediately.
    planActionWorkflow({
        actionId: newActionId,
        actionType: typeName,
        category: categoryName,
        affectedAreaName: affectedAreasNames.join(', '),
        responsibleGroupId: data.assignedTo,
        creationDate: creationDate,
    }).then(workflowPlan => {
        // Save the workflow plan back to the action document
        updateDoc(docRef, { 
            workflowPlan: workflowPlan,
            analysisDueDate: workflowPlan.steps.find(s => s.stepName.includes('Análisis'))?.dueDate || '',
            implementationDueDate: workflowPlan.steps.find(s => s.stepName.includes('Implantación'))?.dueDate || '',
            closureDueDate: workflowPlan.steps.find(s => s.stepName.includes('Cierre'))?.dueDate || '',
        });
    }).catch(error => {
        console.error("Error planning workflow in background for action:", newActionId, error);
        // Optionally, you could update the action with an error status or log this error more permanently.
    });
    
    // Return the new document ID immediately
    return docRef.id;
}


// Function to update an existing action
export async function updateAction(actionId: string, data: any, masterData?: any, status?: 'Borrador' | 'Pendiente Análisis'): Promise<ImprovementAction | null> {
    const actionDocRef = doc(db, 'actions', actionId);
    const originalActionSnap = await getDoc(actionDocRef);
    if (!originalActionSnap.exists()) {
        throw new Error(`Action with ID ${actionId} not found.`);
    }
    const originalAction = originalActionSnap.data() as ImprovementAction;
    
    let dataToUpdate: any = {};
    let newStatus = status || data.status || originalAction.status;
    const statusChanged = newStatus !== originalAction.status;

    if (data.updateProposedActionStatus) {
        // Use a transaction to safely update one element of the array
        await runTransaction(db, async (transaction) => {
            const actionDoc = await transaction.get(actionDocRef);
            if (!actionDoc.exists()) {
                throw "Document does not exist!";
            }
            const currentAction = actionDoc.data() as ImprovementAction;
            const proposedActions = currentAction.analysis?.proposedActions || [];
            
            const updatedProposedActions = proposedActions.map(pa => {
                if (pa.id === data.updateProposedActionStatus.proposedActionId) {
                    return { ...pa, status: data.updateProposedActionStatus.status };
                }
                return pa;
            });
            
            transaction.update(actionDocRef, { "analysis.proposedActions": updatedProposedActions });
        });
    } else if (data.newComment) {
        // Handle adding a new comment
        dataToUpdate = {
            comments: arrayUnion(data.newComment)
        };
        await updateDoc(actionDocRef, dataToUpdate);
    } else if (masterData) {
        // Handle editing a draft
        dataToUpdate = {
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
         await updateDoc(actionDocRef, dataToUpdate);
    } else {
        // If no masterData, we are likely updating other fields like analysis, verification or closure
        dataToUpdate = { ...data };

        // Handle closure logic for non-compliant actions
        if (data.closure && !data.closure.isCompliant) {
            const bisActionData: CreateActionData = {
                title: `${originalAction.title} BIS`,
                description: `${originalAction.description}\n\n--- \nObservacions de tancament no conforme:\n${data.closure.notes}`,
                category: originalAction.categoryId,
                subcategory: originalAction.subcategoryId,
                affectedAreasIds: originalAction.affectedAreasIds,
                centerId: originalAction.centerId,
                assignedTo: originalAction.assignedTo,
                typeId: originalAction.typeId,
                creator: data.closure.closureResponsible,
                status: 'Borrador',
                originalActionId: originalAction.id,
                originalActionTitle: `${originalAction.actionId}: ${originalAction.title}`
            };
             const allMasterData = {
                categories: await getCategories(),
                subcategories: await getSubcategories(),
                affectedAreas: await getAffectedAreas(),
                centers: await getCenters(),
                actionTypes: await getActionTypes(),
            };
            await createAction(bisActionData, allMasterData);
        }
         await updateDoc(actionDocRef, dataToUpdate);
    }
    
    // Always update status if provided
    if (status) {
        await updateDoc(actionDocRef, { status: status });
    }
    
    // Update permissions if status has changed
    if (statusChanged) {
        await updateActionPermissions(actionId, dataToUpdate.typeId || originalAction.typeId, newStatus, originalAction);
    }


    const updatedDoc = await getActionById(actionId);
    return updatedDoc;
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
    const actionDocRef = doc(db, 'actions', actionId);
    if (!existingAction) {
        const docSnap = await getDoc(actionDocRef);
        if (docSnap.exists()) {
            existingAction = docSnap.data() as ImprovementAction;
        } else {
            console.error("Cannot update permissions: Action document not found.");
            return;
        }
    }

    const permissionRule = await getPermissionRuleForState(typeId, status);
    if (!permissionRule) {
        console.warn(`No permission rule found for type ${typeId} and status ${status}.`);
        return;
    }

    const allRoles = await getResponsibilityRoles();

    const readers = await resolveRoles(permissionRule.readerRoleIds, allRoles, existingAction);
    const authors = await resolveRoles(permissionRule.authorRoleIds, allRoles, existingAction);
    
    // Authors are implicitly readers
    const allReaders = [...new Set([...readers, ...authors])];

    await updateDoc(actionDocRef, {
        readers: allReaders,
        authors: authors
    });
}
