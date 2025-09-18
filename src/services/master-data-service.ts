import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, ResponsibilityRole, Center } from '@/lib/types';

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

export const getResponsibilityRoles = async (): Promise<ResponsibilityRole[]> => {
    const rolesCol = collection(db, 'responsibilityRoles');
    const snapshot = await getDocs(query(rolesCol, orderBy("name")));
    
    let roles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResponsibilityRole));

    // Ensure the dynamic "Assignee" role exists for selection in the permission matrix
    if (!roles.some(role => role.type === 'Assignee')) {
      const assigneeRole: ResponsibilityRole = {
        id: 'dynamic_assignee', // Use a fixed, known ID
        name: 'Assignat (Dinàmic)',
        type: 'Assignee'
      };
      // We don't save this to Firestore, it's a virtual role for the UI
      roles.push(assigneeRole);
    }
    
     if (!roles.some(role => role.type === 'Creator')) {
      const creatorRole: ResponsibilityRole = {
        id: 'dynamic_creator', // Use a fixed, known ID
        name: 'Creador (Dinàmic)',
        type: 'Creator'
      };
      roles.push(creatorRole);
    }

    return roles;
};

export const getCenters = async (): Promise<Center[]> => {
  const centersCol = collection(db, 'centers');
  const snapshot = await getDocs(query(centersCol, orderBy("name")));
  if (snapshot.empty) {
    const mockCenters: Center[] = [
      { id: 'bcn', name: 'Barcelona' },
      { id: 'mad', name: 'Madrid' },
      { id: 'val', name: 'València' },
      { id: 'sev', name: 'Sevilla' },
    ];
    return Promise.resolve(mockCenters);
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Center));
};

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
