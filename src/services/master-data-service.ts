

import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, ResponsibilityRole, Center } from '@/lib/types';
import { locations as mockLocations } from '@/lib/static-data';

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

    // Seed dynamic roles if they don't exist in the database
    const hasAssignee = roles.some(role => role.type === 'Assignee');
    const hasCreator = roles.some(role => role.type === 'Creator');

    if (!hasAssignee || !hasCreator) {
        const batch = writeBatch(db);
        
        if (!hasAssignee) {
            const assigneeRole: Omit<ResponsibilityRole, 'id'> = {
                name: 'Assignat (Dinàmic)',
                type: 'Assignee'
            };
            const assigneeRef = doc(collection(db, 'responsibilityRoles'));
            batch.set(assigneeRef, assigneeRole);
            roles.push({ ...assigneeRole, id: assigneeRef.id });
        }
        
        if (!hasCreator) {
            const creatorRole: Omit<ResponsibilityRole, 'id'> = {
                name: 'Creador (Dinàmic)',
                type: 'Creator'
            };
            const creatorRef = doc(collection(db, 'responsibilityRoles'));
            batch.set(creatorRef, creatorRole);
            roles.push({ ...creatorRole, id: creatorRef.id });
        }
        
        await batch.commit();
        // Re-sort roles after adding new ones
        roles.sort((a, b) => a.name.localeCompare(b.name));
    }

    return roles;
};

export const getCenters = async (): Promise<Center[]> => {
  const centersCol = collection(db, 'locations');
  const snapshot = await getDocs(query(centersCol, orderBy("descripcion_centro")));
  if (snapshot.empty) {
      console.log("Locations collection is empty. Populating from static data...");
      const batch = writeBatch(db);
      mockLocations.forEach(location => {
          const docRef = doc(centersCol, location.codigo_centro);
          batch.set(docRef, location);
      });
      await batch.commit();
      
      const newSnapshot = await getDocs(query(centersCol, orderBy("descripcion_centro")));
      return newSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().descripcion_centro } as Center));
  }
  
  return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().descripcion_centro } as Center));
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
