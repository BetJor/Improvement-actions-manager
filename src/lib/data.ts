
import type { ImprovementAction, User, UserGroup, ImprovementActionType, ActionUserInfo, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, WorkflowPlan } from './types';
import { subDays, format, addDays } from 'date-fns';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, orderBy, limit, writeBatch, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { planActionWorkflow } from '@/ai/flows/planActionWorkflow';

export const users: User[] = [
  { id: 'user-1', name: 'Ana García', role: 'Director', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', email: 'ana.garcia@example.com' },
  { id: 'user-2', name: 'Carlos Rodríguez', role: 'Responsible', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', email: 'carlos.rodriguez@example.com' },
  { id: 'user-3', name: 'Laura Martinez', role: 'Creator', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', email: 'laura.martinez@example.com' },
  { id: 'user-4', name: 'Javier López', role: 'Committee', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708c', email: 'javier.lopez@example.com' },
  { id: 'user-5', name: 'Sofía Hernandez', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=a0425e8ff4e29026704d', email: 'sofia.hernandez@example.com' },
];

export const groups: UserGroup[] = [
  { id: 'finance@example.com', name: 'Departament Financer', userIds: ['user-1', 'user-2'] },
  { id: 'it-security@example.com', name: 'Seguretat Informàtica', userIds: ['user-5'] },
  { id: 'customer-support@example.com', name: 'Atenció al Client', userIds: ['user-1', 'user-3'] },
  { id: 'quality-management@example.com', name: 'Gestió de Qualitat', userIds: ['user-2', 'user-4'] },
  { id: 'risk-management@example.com', name: 'Gestió de Riscos', userIds: ['user-1', 'user-5'] },
  { id: 'it-legacy-systems@example.com', name: 'Sistemes Legacy', userIds: ['user-5'] },
  { id: 'rsc-committee@example.com', name: 'Comitè RSC', userIds: ['user-3', 'user-4'] },
];

// --- Master Data from Firestore ---

async function seedCollection<T extends { id: string, [key: string]: any }>(collectionName: string, data: T[]) {
    const collectionRef = collection(db, collectionName);
    const docRef = doc(collectionRef, data[0].id); // Check only for the first item's existence
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`Seeding '${collectionName}' collection...`);
      const batch = writeBatch(db);
      data.forEach(item => {
        const docRef = doc(collectionRef, item.id);
        const dataToSet = { ...item };
        delete dataToSet.id; // Don't store the id field inside the document
        batch.set(docRef, dataToSet);
      });
      await batch.commit();
      console.log(`'${collectionName}' collection seeded successfully.`);
    }
}


export const getActionTypes = async (): Promise<ImprovementActionType[]> => {
  const mockActionTypes = [
    { id: "T01", name: "No Conformitat" },
    { id: "T02", name: "Observació" },
    { id: "T03", name: "Oportunitat de Millora" },
    { id: "T04", name: "Reclamació de Client" },
    { id: "T05", name: "Auditoria Interna" },
    { id: "T06", name: "Auditoria Externa" },
  ];
  await seedCollection('actionTypes', mockActionTypes);

  const typesCol = collection(db, 'actionTypes');
  const snapshot = await getDocs(query(typesCol, orderBy("name")));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImprovementActionType));
};

export const getCategories = async (): Promise<ActionCategory[]> => {
    const mockCategories = [
        { id: "C01", name: "Gestió de la Qualitat" },
        { id: "C02", name: "Seguretat i Salut Laboral" },
        { id: "C03", name: "Medi Ambient" },
        { id: "C04", name: "Seguretat de la Informació" },
    ];
    await seedCollection('categories', mockCategories);


  const categoriesCol = collection(db, 'categories');
  const snapshot_data = await getDocs(query(categoriesCol, orderBy("name")));
  return snapshot_data.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionCategory));
};

export const getSubcategories = async (): Promise<ActionSubcategory[]> => {
    const mockSubcategories = [
        { id: "SC01", categoryId: "C01", name: "Processos interns" },
        { id: "SC02", categoryId: "C01", name: "Producte no conforme" },
        { id: "SC03", categoryId: "C02", name: "Accidents laborals" },
        { id: "SC04", categoryId: "C02", name: "Equips de protecció" },
        { id: "SC05", categoryId: "C03", name: "Gestió de residus" },
        { id: "SC06", categoryId: "C03", name: "Consum energètic" },
        { id: "SC07", categoryId: "C04", name: "Control d'accés" },
        { id: "SC08", categoryId: "C04", name: "Incidents de seguretat" },
      ];
    await seedCollection('subcategories', mockSubcategories);

  const subcategoriesCol = collection(db, 'subcategories');
  const snapshot = await getDocs(query(subcategoriesCol, orderBy("name")));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionSubcategory));
};

export const getAffectedAreas = async (): Promise<AffectedArea[]> => {
    const mockAffectedAreas = [
        { id: "A01", name: "Departament de Producció" },
        { id: "A02", name: "Departament de Logística" },
        { id: "A03", name: "Departament Financer" },
        { id: "A04", name: "Recursos Humans" },
        { id: "A05", name: "IT" },
      ];
    await seedCollection('affectedAreas', mockAffectedAreas);

  const affectedAreasCol = collection(db, 'affectedAreas');
  const snapshot = await getDocs(query(affectedAreasCol, orderBy("name")));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AffectedArea));
};


// Funció per obtenir les dades de Firestore
export const getActions = async (): Promise<ImprovementAction[]> => {
    
    const actionsCol = collection(db, 'actions');
    // Order by actionId descending to easily get the latest one if needed
    const actionsSnapshot = await getDocs(query(actionsCol, orderBy("actionId", "desc")));

    return actionsSnapshot.docs.map(doc => {
        const data = doc.data();
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
            // The user-facing ID is now in actionId, the firestore ID is id
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


interface CreateActionData {
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
export async function updateAction(actionId: string, data: any, masterData: any): Promise<void> {
    const actionDocRef = doc(db, 'actions', actionId);
    
    // Find names from IDs
    const categoryName = masterData.categories.find((c: any) => c.id === data.category)?.name || data.category;
    const subcategoryName = masterData.subcategories.find((s: any) => s.id === data.subcategory)?.name || data.subcategory;
    const affectedAreaName = masterData.affectedAreas.find((a: any) => a.id === data.affectedAreas)?.name || data.affectedAreas;
    const typeName = masterData.actionTypes.find((t: any) => t.id === data.type)?.name || data.type;

    const dataToUpdate = {
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        responsibleGroupId: data.responsibleGroupId,
        category: categoryName,
        categoryId: data.category,
        subcategory: subcategoryName,
        subcategoryId: data.subcategory,
        affectedAreas: affectedAreaName,
        affectedAreasId: data.affectedAreas,
        type: typeName,
        typeId: data.type,
    };

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
type PromptId = "improveWriting" | "analysis" | "correctiveActions";

export async function getPrompt(promptId: PromptId): Promise<string> {
    const docRef = doc(db, 'app_settings', 'prompts');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data()?.[promptId]) {
        return docSnap.data()?.[promptId] || '';
    }
    
    return '';
}

export async function updatePrompt(promptId: PromptId, newPrompt: string): Promise<void> {
    const docRef = doc(db, 'app_settings', 'prompts');
    await setDoc(docRef, { [promptId]: newPrompt }, { merge: true });
}
