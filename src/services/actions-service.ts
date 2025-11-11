
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, orderBy, limit, arrayUnion, Timestamp, runTransaction, arrayRemove, where, writeBatch, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, parse, subDays, addDays } from 'date-fns';
import type { ImprovementAction, ImprovementActionStatus, ActionUserInfo, ProposedAction, ActionSubcategory, ActionCategory, ImprovementActionType, ActionComment } from '@/lib/types';
import { planTraditionalActionWorkflow, getWorkflowSettings } from './workflow-service';
import { getUsers, getUserById } from './users-service';
import { getCategories, getSubcategories, getAffectedAreas, getCenters, getActionTypes, getResponsibilityRoles } from './master-data-service';
import { getPermissionRuleForState, resolveRoles } from './permissions-service';
import { sendStateChangeEmail, sendProposedActionUpdateEmail, sendBisCreationNotificationEmail } from './notification-service';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


interface CreateActionData extends Omit<ImprovementAction, 'id' | 'actionId' | 'status' | 'creationDate' | 'category' | 'subcategory' | 'type' | 'affectedAreas' | 'affectedCenters' | 'center' | 'analysisDueDate' | 'implementationDueDate' | 'closureDueDate' | 'readers' | 'authors' | 'verificationDueDate' > {
  status: 'Borrador' | 'Pendiente Análisis';
  categoryId: string; 
  subcategoryId?: string; 
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
        const convertTimestamp = (date: any): string => {
            if (date instanceof Timestamp) {
                return date.toDate().toISOString();
            }
            if(typeof date === 'string') {
                return date;
            }
            return date;
        }

        if (data.analysis && data.analysis.proposedActions) {
            data.analysis.proposedActions = data.analysis.proposedActions.map((pa: any) => ({
                ...pa,
                dueDate: convertTimestamp(pa.dueDate), // Keep as string
                statusUpdateDate: pa.statusUpdateDate ? convertTimestamp(pa.statusUpdateDate) : undefined,
            }));
        }
         if (data.comments && Array.isArray(data.comments)) {
            data.comments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
             data.comments = [];
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

// Function to recursively remove undefined values from an object
function sanitizeDataForFirestore<T extends object>(data: T): T {
    const sanitizedData = JSON.parse(JSON.stringify(data));
    const clean = (obj: any) => {
        if (obj === null || typeof obj !== 'object') return;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] === undefined) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object') {
                    if(Array.isArray(obj[key])) {
                        obj[key].forEach((item: any) => clean(item));
                    } else {
                        clean(obj[key]);
                    }
                }
            }
        }
    };
    clean(sanitizedData);
    return sanitizedData;
}


// Function to create a new action
export async function createAction(data: CreateActionData, masterData: any): Promise<ImprovementAction> {
    if (!data.categoryId) {
        throw new Error("El campo 'categoryId' (Origen) es obligatorio.");
    }
  
    const lastActionQuery = query(collection(db, 'actions'), orderBy("actionId", "desc"), limit(1));
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
  
    const today = new Date();
    const categoryName = masterData.origins.data.find((c: any) => c.id === data.categoryId)?.name || '';
    const subcategoryName = masterData.classifications.data.find((s: any) => s.id === data.subcategoryId)?.name || '';
    const affectedAreasNames = data.affectedAreasIds.map(id => masterData.affectedAreas.find((a: any) => a.id === id)?.name || id);
    const centerName = masterData.centers.data.find((c: any) => c.id === data.centerId)?.name || '';
    const affectedCentersNames = data.affectedCentersIds?.map(id => masterData.centers.data.find((c: any) => c.id === id)?.name || id);
    const typeName = masterData.ambits.data.find((t: any) => t.id === data.typeId)?.name || '';

    const workflowSettings = await getWorkflowSettings();

    const docRef = doc(collection(db, "actions"));
    
    let newActionData: ImprovementAction = {
        id: docRef.id,
        actionId: newActionId,
        title: data.title,
        category: categoryName,
        categoryId: data.categoryId,
        subcategory: subcategoryName,
        subcategoryId: data.subcategoryId || '',
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
            name: data.creator.name,
            avatar: data.creator.avatar || "",
            email: data.creator.email || '',
        },
        responsibleGroupId: data.assignedTo,
        creationDate: today.toISOString(),
        analysisDueDate: addDays(today, workflowSettings.analysisDueDays).toISOString(), 
        verificationDueDate: '',
        implementationDueDate: '', 
        closureDueDate: '',
        followers: [data.creator.id],
        readers: [],
        authors: [],
        comments: [], // Ensure comments array exists
    };
    
    if (data.originalActionId) newActionData.originalActionId = data.originalActionId;
    if (data.originalActionTitle) newActionData.originalActionTitle = data.originalActionTitle;

    // If status is 'Pendiente Análisis', send email and add comment *before* writing to DB
    if (newActionData.status === 'Pendiente Análisis') {
        const notificationResult = await sendStateChangeEmail({
            action: newActionData,
            oldStatus: 'Borrador',
            newStatus: 'Pendiente Análisis'
        });
        if (notificationResult) {
            newActionData.comments = [notificationResult];
        }
    }
    
    // Calculate permissions before the first write
    const { readers, authors } = await getPermissionsForState(newActionData, newActionData.status);
    newActionData.readers = readers;
    newActionData.authors = authors;

    await setDoc(docRef, sanitizeDataForFirestore(newActionData))
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: newActionData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

    return newActionData;
}

async function handleProposedActionStatusUpdate(
    transaction: any,
    actionDocRef: any,
    originalAction: ImprovementAction,
    updateData: { proposedActionId: string, status: ProposedAction['status'] }
): Promise<ActionComment | null> {
    const paIndex = originalAction.analysis?.proposedActions.findIndex(p => p.id === updateData.proposedActionId) ?? -1;
    if (paIndex === -1) {
        throw new Error("Acción propuesta no encontrada para actualizar.");
    }

    const currentPAs = originalAction.analysis?.proposedActions || [];
    const updatedPAs = currentPAs.map(pa => 
        pa.id === updateData.proposedActionId 
            ? { ...pa, status: updateData.status, statusUpdateDate: new Date().toISOString() } 
            : pa
    );

    // Find the verifier's email
    let verifierEmail = originalAction.analysis?.verificationResponsibleUserEmail;
    if (!verifierEmail && originalAction.analysis?.verificationResponsibleUserId) {
        const verifierUser = await getUserById(originalAction.analysis.verificationResponsibleUserId);
        verifierEmail = verifierUser?.email;
    }
    
    if (!verifierEmail) {
        console.warn(`[handleProposedActionStatusUpdate] No se pudo encontrar el email del verificador para la acción ${originalAction.actionId}. No se enviará email.`);
        return null;
    }
    
    const updatedActionForEmail: ImprovementAction = { 
        ...originalAction, 
        analysis: { ...originalAction.analysis!, proposedActions: updatedPAs } 
    };
    
    const notificationResult = await sendProposedActionUpdateEmail(
        updatedActionForEmail,
        updateData.proposedActionId,
        verifierEmail
    );

    const existingComments = Array.isArray(originalAction.comments) ? originalAction.comments : [];
    const newComments = [...existingComments];
    if (notificationResult) {
        newComments.push(notificationResult);
    }
    
    const dataToUpdate = {
        'analysis.proposedActions': updatedPAs,
        comments: newComments,
    };
    
    transaction.update(actionDocRef, sanitizeDataForFirestore(dataToUpdate));

    return notificationResult;
}

export async function updateAction(
    actionId: string, 
    data: Partial<ImprovementAction> & { newComment?: any; adminEdit?: any; updateProposedActionStatus?: { proposedActionId: string, status: ProposedAction['status'] }; updateProposedAction?: ProposedAction }, 
    masterData: any | null = null, 
    statusFromForm?: 'Borrador' | 'Pendiente Análisis'
): Promise<{ 
    updatedAction: ImprovementAction, 
    bisCreationResult?: { createdBisTitle?: string, foundBisTitle?: string },
    notificationResult?: ActionComment | null
}> {
    const actionDocRef = doc(db, 'actions', actionId);
    let bisCreationResult: { createdBisTitle?: string, foundBisTitle?: string } = {};
    let finalNotificationResult: ActionComment | null = null;
    
    if (data.analysis && Array.isArray(data.analysis.proposedActions)) {
        data.analysis.proposedActions = data.analysis.proposedActions.map(pa => ({
            ...pa,
            dueDate: pa.dueDate instanceof Date ? pa.dueDate.toISOString() : pa.dueDate,
        }));
    }

    try {
        await runTransaction(db, async (transaction) => {
            const originalActionSnap = await transaction.get(actionDocRef);
            if (!originalActionSnap.exists()) {
                throw new Error(`Action with ID ${actionId} not found.`);
            }
            const originalAction = { id: originalActionSnap.id, ...originalActionSnap.data() } as ImprovementAction;
            
            // --- ISOLATED LOGIC FOR PROPOSED ACTION STATUS UPDATE ---
            if (data.updateProposedActionStatus) {
                finalNotificationResult = await handleProposedActionStatusUpdate(transaction, actionDocRef, originalAction, data.updateProposedActionStatus!);
            
            // --- GENERAL LOGIC (status changes, admin edits, etc.) ---
            } else {
                let dataToUpdate: any = { ...data };
                const oldStatus = originalAction.status;
                const newStatus = statusFromForm || data.status || oldStatus;
                const isStatusChanging = newStatus !== oldStatus;
                
                if (isStatusChanging) {
                    dataToUpdate.status = newStatus;
                    const workflowSettings = await getWorkflowSettings();
                    const today = new Date();
                    
                    if (newStatus === 'Pendiente de Cierre') {
                        dataToUpdate.closureDueDate = addDays(today, workflowSettings.closureDueDays).toISOString();
                    }
    
                    const actionForPerms = { ...originalAction, ...dataToUpdate };
                    const { readers, authors } = await getPermissionsForState(actionForPerms, newStatus);
                    dataToUpdate.readers = readers;
                    dataToUpdate.authors = authors;
    
                    // We pass the new data directly for the email to be correct
                    finalNotificationResult = await sendStateChangeEmail({ 
                        action: actionForPerms, 
                        oldStatus, 
                        newStatus,
                    });
                }
    
                if (dataToUpdate.analysis && Array.isArray(dataToUpdate.analysis.proposedActions)) {
                    const dueDates = dataToUpdate.analysis.proposedActions
                        .map((pa: ProposedAction) => pa.dueDate ? new Date(pa.dueDate as string) : null)
                        .filter((d: Date | null): d is Date => d !== null && !isNaN(d.getTime()));
                    
                    if (dueDates.length > 0) {
                        const implementationDueDate = new Date(Math.max.apply(null, dueDates.map(d => d.getTime())));
                        dataToUpdate.implementationDueDate = implementationDueDate.toISOString();
                        
                        const workflowSettings = await getWorkflowSettings();
                        dataToUpdate.verificationDueDate = addDays(implementationDueDate, workflowSettings.verificationDueDays).toISOString();
                    }
                }
    
                const existingComments = Array.isArray(originalAction.comments) ? originalAction.comments : [];
                const commentsToAdd: ActionComment[] = [];
                
                if (finalNotificationResult) {
                    commentsToAdd.push(finalNotificationResult);
                }
                if (data.adminEdit) {
                    const { field, label, user, overrideComment, actionIndex } = data.adminEdit;
                    let commentText = overrideComment || (actionIndex !== undefined 
                        ? `El administrador ${user} ha modificado el campo '${label}' de la acción propuesta ${actionIndex + 1}.`
                        : `El administrador ${user} ha modificado el campo '${label}'.`);
                    commentsToAdd.push({ id: crypto.randomUUID(), author: { id: 'system', name: 'Sistema' }, date: new Date().toISOString(), text: commentText });
                    delete dataToUpdate.adminEdit;
                }
                if (data.newComment) {
                    commentsToAdd.push(data.newComment);
                    delete dataToUpdate.newComment;
                }
                
                if (commentsToAdd.length > 0) {
                    dataToUpdate.comments = [...existingComments, ...commentsToAdd];
                }
                
                if (data.updateProposedAction) {
                    const currentPAs = originalAction.analysis?.proposedActions || [];
                    const updatedPAs = currentPAs.map(pa => pa.id === data.updateProposedAction!.id 
                        ? { ...data.updateProposedAction, dueDate: new Date(data.updateProposedAction!.dueDate).toISOString() }
                        : pa
                    );
                    if (updatedPAs) {
                        dataToUpdate['analysis.proposedActions'] = updatedPAs;
                    }
                    delete dataToUpdate.updateProposedAction;
                }
                
                const finalDataToUpdate = sanitizeDataForFirestore(dataToUpdate);
                transaction.update(actionDocRef, finalDataToUpdate);
            }
        });
    } catch (error: any) {
        console.error("Error in updateAction transaction:", error);
        const permissionError = new FirestorePermissionError({
            path: actionDocRef.path,
            operation: 'update',
            requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }

    const finalActionDoc = await getDoc(actionDocRef);
    const finalAction = { id: finalActionDoc.id, ...finalActionDoc.data() } as ImprovementAction;

    // Call BIS creation logic AFTER the transaction is complete
    if (data.closure?.isCompliant === false) {
        bisCreationResult = await handleBisCreation(finalAction);
    }

    return { updatedAction: finalAction, bisCreationResult, notificationResult: finalNotificationResult };
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
            transaction.update(actionDocRef, { followers: arrayRemove(userId) });
        } else {
            transaction.update(actionDocRef, { followers: arrayUnion(userId) });
        }
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: actionDocRef.path,
            operation: 'update',
            requestResourceData: { toggleFollow: userId },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw to inform the caller
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

async function getPermissionsForState(action: ImprovementAction, newStatus: ImprovementActionStatus): Promise<{ readers: string[], authors: string[] }> {
    if (newStatus === 'Borrador') {
        const creatorEmail = action.creator?.email || (await getUserById(action.creator.id))?.email;
        if (creatorEmail) {
            return { readers: [creatorEmail], authors: [creatorEmail] };
        }
        return { readers: [], authors: [] };
    }

    const permissionRule = await getPermissionRuleForState(action.typeId, newStatus);
    
    if (!permissionRule) {
        console.warn(`[ActionService] No permission rule found for type ${action.typeId} and status ${newStatus}. Keeping existing permissions.`);
        return { readers: action.readers || [], authors: action.authors || [] };
    }

    const allRoles = await getResponsibilityRoles();

    const newReaders = await resolveRoles(permissionRule.readerRoleIds, allRoles, action);
    const newAuthors = await resolveRoles(permissionRule.authorRoleIds, allRoles, action);
    
    const creatorEmail = action.creator?.email || (await getUserById(action.creator.id))?.email;
    if (creatorEmail) {
        newReaders.push(creatorEmail);
        if (newStatus === 'Pendiente de Cierre') {
          newAuthors.push(creatorEmail);
        }
    }
    
    const combinedReaders = [...new Set([...newReaders, ...newAuthors])];

    return { readers: combinedReaders, authors: [...new Set(newAuthors)] };
}


/**
 * Handles the creation of a BIS action when an action is closed as non-compliant.
 * This function is designed to be called *after* the original action's transaction is complete.
 */
async function handleBisCreation(originalAction: ImprovementAction): Promise<{ createdBisTitle?: string, foundBisTitle?: string }> {
    // 1. Check for duplicates
    const q = query(collection(db, 'actions'), where('originalActionId', '==', originalAction.id));
    const existingBisSnapshot = await getDocs(q);

    if (!existingBisSnapshot.empty) {
        const foundBis = existingBisSnapshot.docs[0].data();
        console.log(`BIS action already exists: ${foundBis.actionId}`);
        return { foundBisTitle: foundBis.actionId };
    }

    // 2. Prepare data for the new BIS action
    const masterData = {
        origins: { data: await getCategories() },
        classifications: { data: await getSubcategories() },
        affectedAreas: await getAffectedAreas(),
        centers: { data: await getCenters() },
        ambits: { data: await getActionTypes() },
        responsibilityRoles: { data: await getResponsibilityRoles() },
    };

    const bisActionData: CreateActionData = {
        title: `${originalAction.title} (BIS)`,
        description: `Acción creada automáticamente a partir del cierre no conforme de la acción ${originalAction.actionId}.\n\nObservaciones del cierre original:\n${originalAction.closure?.notes || 'N/A'}`,
        status: 'Borrador', // Always start as a draft
        creator: {
            id: originalAction.creator.id,
            name: originalAction.creator.name,
            avatar: originalAction.creator.avatar || "",
            email: originalAction.creator.email || '',
        },
        assignedTo: originalAction.responsibleGroupId,
        typeId: originalAction.typeId,
        categoryId: originalAction.categoryId,
        subcategoryId: originalAction.subcategoryId,
        affectedAreasIds: originalAction.affectedAreasIds,
        affectedCentersIds: originalAction.affectedCentersIds,
        centerId: originalAction.centerId,
        originalActionId: originalAction.id,
        originalActionTitle: `${originalAction.actionId}: ${originalAction.title}`,
    };

    // 3. Create the BIS action
    const newBisAction = await createAction(bisActionData, masterData);

    // 4. Send notification and get the comment text
    const commentText = await sendBisCreationNotificationEmail(newBisAction, originalAction);
    
    // 5. Add the comment to the ORIGINAL action
    if (commentText) {
        await addCommentToAction(originalAction.id, commentText);
    }
    
    return { createdBisTitle: newBisAction.actionId };
}

export async function addCommentToAction(actionId: string, comment: ActionComment): Promise<void> {
    const actionDocRef = doc(db, 'actions', actionId);
    await updateDoc(actionDocRef, {
        comments: arrayUnion(comment)
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: actionDocRef.path,
            operation: 'update',
            requestResourceData: { newComment: comment },
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
