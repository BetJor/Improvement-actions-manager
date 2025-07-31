

import type { ImprovementAction, User, UserGroup, ImprovementActionType, ActionUserInfo, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, WorkflowPlan, GalleryPrompt, ActionAttachment } from './types';
import { subDays, format, addDays } from 'date-fns';
import { db, storage } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, orderBy, limit, writeBatch, updateDoc, deleteDoc, setDoc, Timestamp, arrayUnion, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { planActionWorkflow } from '@/ai/flows/planActionWorkflow';
import { users } from './static-data';
import { a } from 'next-intl/dist/config-a681d451';

export const getActionTypes = async (): Promise<ImprovementActionType[]> => {
  const typesCol = collection(db, 'actionTypes');
  const snapshot = await getDocs(query(typesCol, orderBy("name")));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImprovementActionType));
};

export const getCategories = async (): Promise<ActionCategory[]> => {
  const categoriesCol = collection(db, 'categories');
  const snapshot_data = await getDocs(query(categoriesCol, orderBy("name")));
  return snapshot_data.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionCategory));
};

export const getSubcategories = async (): Promise<ActionSubcategory[]> => {
  const subcategoriesCol = collection(db, 'subcategories');
  const snapshot = await getDocs(query(subcategoriesCol, orderBy("name")));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionSubcategory));
};

export const getAffectedAreas = async (): Promise<AffectedArea[]> => {
  const affectedAreasCol = collection(db, 'affectedAreas');
  const snapshot = await getDocs(query(affectedAreasCol, orderBy("name")));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AffectedArea));
};


// Funció per obtenir les dades de Firestore
export const getActions = async (): Promise<ImprovementAction[]> => {
    const actionsCol = collection(db, 'actions');
    const actionsSnapshot = await getDocs(query(actionsCol, orderBy("actionId", "desc")));

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
        
        return { 
          id: doc.id,
          ...data,
        } as ImprovementAction;
    });
}

export const getActionById = async (id: string): Promise<ImprovementAction | null> => {
    try {
        const actionDocRef = doc(db, 'actions', id);
        const actionDocSnap = await getDoc(actionDocRef);
    
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
                const responsibleUser = users.find(u => u.id === data.responsibleGroupId);
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
    } catch(error) {
        console.error("Error fetching document by ID:", error);
        return null;
    }
}


export interface CreateActionData {
    title: string;
    category: string;
    subcategory: string;
    affectedAreas: string;
    assignedTo: string;
    description: string;
    type: string;
    responsibleGroupId: string;
    creator: ActionUserInfo;
    status: 'Borrador' | 'Pendiente Análisis';
    originalActionId?: string; // The Firestore ID
    originalActionTitle?: string;
}

// Function to create a new action
export async function createAction(data: CreateActionData, masterData: any): Promise<string> {
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
    const creationDate = format(today, 'dd/MM/yyyy');

    // Find names from IDs
    const categoryName = masterData.categories.find((c: any) => c.id === data.category)?.name || data.category;
    const subcategoryName = masterData.subcategories.find((s: any) => s.id === data.subcategory)?.name || data.subcategory;
    const affectedAreaName = masterData.affectedAreas.find((a: any) => a.id === data.affectedAreas)?.name || data.affectedAreas;
    const typeName = masterData.actionTypes.find((t: any) => t.id === data.type)?.name || data.type;

    const newAction: Omit<ImprovementAction, 'id'> = {
      actionId: newActionId,
      title: data.title,
      category: categoryName,
      categoryId: data.category,
      subcategory: subcategoryName,
      subcategoryId: data.subcategory,
      description: data.description,
      type: typeName,
      typeId: data.type,
      status: data.status || 'Borrador',
      affectedAreas: affectedAreaName,
      affectedAreasId: data.affectedAreas,
      assignedTo: data.assignedTo,
      creator: data.creator,
      responsibleGroupId: data.responsibleGroupId,
      creationDate: creationDate,
      analysisDueDate: '', 
      implementationDueDate: '',
      closureDueDate: '',
      originalActionId: data.originalActionId,
      originalActionTitle: data.originalActionTitle,
    };
  
    // 3. Add the new document to Firestore
    const docRef = await addDoc(actionsCol, newAction);

    // 4. Plan the workflow using the new Genkit flow
    try {
        const workflowPlan = await planActionWorkflow({
            actionId: newActionId,
            actionType: typeName,
            category: categoryName,
            responsibleGroupId: data.responsibleGroupId,
            creationDate: creationDate,
        });

        // 5. Save the workflow plan back to the action document
        await updateDoc(docRef, { 
            workflowPlan: workflowPlan,
            analysisDueDate: workflowPlan.steps.find(s => s.stepName.includes('Análisis'))?.dueDate || '',
            implementationDueDate: workflowPlan.steps.find(s => s.stepName.includes('Implantación'))?.dueDate || '',
            closureDueDate: workflowPlan.steps.find(s => s.stepName.includes('Cierre'))?.dueDate || '',
        });
        
    } catch (error) {
        console.error("Error planning workflow for action:", newActionId, error);
    }

    return docRef.id;
}


// Function to update an existing action
export async function updateAction(actionId: string, data: any, masterData?: any, status?: 'Borrador' | 'Pendiente Análisis'): Promise<void> {
    const actionDocRef = doc(db, 'actions', actionId);
    
    let dataToUpdate: any = {};

    if (data.newComment) {
        // Handle adding a new comment
        dataToUpdate = {
            comments: arrayUnion(data.newComment)
        };
    } else if (masterData) {
        // Handle editing a draft
        dataToUpdate = {
            title: data.title,
            description: data.description,
            assignedTo: data.assignedTo,
            responsibleGroupId: data.responsibleGroupId,
            category: masterData.categories.find((c: any) => c.id === data.category)?.name || data.category,
            categoryId: data.category,
            subcategory: masterData.subcategories.find((s: any) => s.id === data.subcategory)?.name || data.subcategory,
            subcategoryId: data.subcategory,
            affectedAreas: masterData.affectedAreas.find((a: any) => a.id === data.affectedAreas)?.name || data.affectedAreas,
            affectedAreasId: data.affectedAreas,
            type: masterData.actionTypes.find((t: any) => t.id === data.type)?.name || data.type,
            typeId: data.type,
        };
    } else {
        // If no masterData, we are likely updating other fields like analysis, verification or closure
        dataToUpdate = { ...data };

        // Handle closure logic for non-compliant actions
        if (data.closure && !data.closure.isCompliant) {
            const originalActionSnap = await getDoc(actionDocRef);
            if(originalActionSnap.exists()) {
                const originalAction = originalActionSnap.data() as ImprovementAction;
                const allMasterData = {
                    categories: await getCategories(),
                    subcategories: await getSubcategories(),
                    affectedAreas: await getAffectedAreas(),
                    actionTypes: await getActionTypes(),
                }
                const bisActionData: CreateActionData = {
                    title: `${originalAction.title} BIS`,
                    description: `${originalAction.description}\n\n--- \nObservacions de tancament no conforme:\n${data.closure.notes}`,
                    category: originalAction.categoryId,
                    subcategory: originalAction.subcategoryId,
                    affectedAreas: originalAction.affectedAreasId,
                    assignedTo: originalAction.assignedTo,
                    type: originalAction.typeId,
                    responsibleGroupId: originalAction.responsibleGroupId,
                    creator: data.closure.closureResponsible, // The closer is the creator of the new action
                    status: 'Borrador', // New BIS action starts as a draft
                    originalActionId: originalAction.id,
                    originalActionTitle: `${originalAction.actionId}: ${originalAction.title}`
                };
                await createAction(bisActionData, allMasterData);
            }
        }
    }

    if (status) {
        dataToUpdate.status = status;
    }

    await updateDoc(actionDocRef, dataToUpdate);
}


// --- CRUD for Master Data ---
export async function addMasterDataItem(collectionName: string, item: Omit<MasterDataItem, 'id'>): Promise<string> {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, item);
    return docRef.id;
}

export async function updateMasterDataItem(collectionName: string, itemId: string, item: Omit<MasterDataItem, 'id'>): Promise<void> {
    const docRef = doc(db, collectionName, itemId);
    await updateDoc(docRef, item);
}

export async function deleteMasterDataItem(collectionName: string, itemId: string): Promise<void> {
    const docRef = doc(db, collectionName, itemId);
    await deleteDoc(docRef);
}


// --- CRUD for AI Prompts ---
type PromptId = "improveWriting" | "analysisSuggestion" | "correctiveActions";

export async function getPrompt(promptId: PromptId): Promise<string> {
    const docRef = doc(db, 'app_settings', 'prompts');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data()?.[promptId] || '';
    }
    
    return '';
}

export async function updatePrompt(promptId: PromptId, newPrompt: string): Promise<void> {
    const docRef = doc(db, 'app_settings', 'prompts');
    await setDoc(docRef, { [promptId]: newPrompt }, { merge: true });
}

// --- CRUD for Prompt Gallery ---
export async function getGalleryPrompts(): Promise<GalleryPrompt[]> {
    const promptsCol = collection(db, 'prompt_gallery');
    const snapshot = await getDocs(query(promptsCol, orderBy("title")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryPrompt));
}

export async function addGalleryPrompt(prompt: Omit<GalleryPrompt, 'id'>): Promise<string> {
    const collectionRef = collection(db, 'prompt_gallery');
    const docRef = await addDoc(collectionRef, prompt);
    return docRef.id;
}

export async function updateGalleryPrompt(promptId: string, prompt: Omit<GalleryPrompt, 'id'>): Promise<void> {
    const docRef = doc(db, 'prompt_gallery', promptId);
    await updateDoc(docRef, prompt);
}

export async function deleteGalleryPrompt(promptId: string): Promise<void> {
    const docRef = doc(db, 'prompt_gallery', promptId);
    await deleteDoc(docRef);
}


// --- File Uploads ---

export async function uploadFileAndUpdateAction(actionId: string, file: File, user: ActionUserInfo): Promise<void> {
  if (!file) throw new Error("No file provided");

  // 1. Create a storage reference
  const filePath = `actions/${actionId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);

  // 2. Upload the file
  await uploadBytes(storageRef, file);

  // 3. Get the download URL
  const downloadURL = await getDownloadURL(storageRef);

  // 4. Create the attachment object
  const newAttachment: ActionAttachment = {
    id: crypto.randomUUID(),
    fileName: file.name,
    fileUrl: downloadURL,
    uploadedBy: user,
    uploadedAt: new Date().toISOString(),
  };

  // 5. Update the action document in Firestore
  const actionDocRef = doc(db, 'actions', actionId);
  await updateDoc(actionDocRef, {
    attachments: arrayUnion(newAttachment),
  });
}
