
import type { ImprovementAction, User, UserGroup, ImprovementActionType, ActionUserInfo, ActionCategory, ActionSubcategory, AffectedArea } from './types';
import { subDays, format, addDays } from 'date-fns';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, orderBy, limit, writeBatch } from 'firebase/firestore';

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

async function seedCollection<T extends { [key: string]: any }>(collectionName: string, data: T[]) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(query(collectionRef, limit(1)));
    
    if (snapshot.empty) {
      console.log(`Seeding '${collectionName}' collection...`);
      const batch = writeBatch(db);
      data.forEach(item => {
        const docRef = doc(collectionRef); 
        batch.set(docRef, item);
      });
      await batch.commit();
      console.log(`'${collectionName}' collection seeded successfully.`);
    }
}

export const getActionTypes = async (): Promise<ImprovementActionType[]> => {
  const mockActionTypes = [
    { name: "No Conformitat" },
    { name: "Observació" },
    { name: "Oportunitat de Millora" },
    { name: "Reclamació de Client" },
    { name: "Auditoria Interna" },
    { name: "Auditoria Externa" },
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
    // For categories, we need to add them with specific IDs, so we can't use the generic seed function
    const collectionRef = collection(db, 'categories');
    const snapshot = await getDocs(query(collectionRef, limit(1)));
    if(snapshot.empty) {
        console.log("Seeding 'categories' collection...");
        const batch = writeBatch(db);
        mockCategories.forEach(cat => {
            const docRef = doc(db, "categories", cat.id);
            batch.set(docRef, { name: cat.name });
        });
        await batch.commit();
        console.log("'categories' collection seeded successfully.");
    }

  const categoriesCol = collection(db, 'categories');
  const snapshot_data = await getDocs(query(categoriesCol, orderBy("name")));
  return snapshot_data.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionCategory));
};

export const getSubcategories = async (): Promise<ActionSubcategory[]> => {
    const mockSubcategories = [
        { categoryId: "C01", name: "Processos interns" },
        { categoryId: "C01", name: "Producte no conforme" },
        { categoryId: "C02", name: "Accidents laborals" },
        { categoryId: "C02", name: "Equips de protecció" },
        { categoryId: "C03", name: "Gestió de residus" },
        { categoryId: "C03", name: "Consum energètic" },
        { categoryId: "C04", name: "Control d'accés" },
        { categoryId: "C04", name: "Incidents de seguretat" },
      ];
    await seedCollection('subcategories', mockSubcategories);

  const subcategoriesCol = collection(db, 'subcategories');
  const snapshot = await getDocs(query(subcategoriesCol, orderBy("name")));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionSubcategory));
};

export const getAffectedAreas = async (): Promise<AffectedArea[]> => {
    const mockAffectedAreas = [
        { name: "Departament de Producció" },
        { name: "Departament de Logística" },
        { name: "Departament Financer" },
        { name: "Recursos Humans" },
        { name: "IT" },
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
}

// Function to create a new action
export async function createAction(data: CreateActionData): Promise<string> {
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
    const newAction: Omit<ImprovementAction, 'id'> = {
      actionId: newActionId,
      title: data.title,
      category: data.category,
      subcategory: data.subcategory,
      description: data.description,
      type: data.type,
      status: 'Borrador',
      affectedAreas: data.affectedAreas,
      assignedTo: data.assignedTo,
      creator: data.creator,
      responsibleGroupId: data.responsibleGroupId,
      creationDate: format(today, 'dd/MM/yyyy'),
      analysisDueDate: format(addDays(today, 30), 'dd/MM/yyyy'),
      implementationDueDate: format(addDays(today, 60), 'dd/MM/yyyy'),
      closureDueDate: format(addDays(today, 90), 'dd/MM/yyyy'),
    };
  
    // 3. Add the new document to Firestore
    const docRef = await addDoc(actionsCol, newAction);
    return docRef.id;
}
