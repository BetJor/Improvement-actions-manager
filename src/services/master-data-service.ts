

import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc, writeBatch, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, ResponsibilityRole, Center } from '@/lib/types';
import { seedActionTypes, seedCategories, seedSubcategories, seedAffectedAreas } from '@/lib/master-seed-data';

// Variable global para prevenir la ejecución múltiple del seeder
let isSeedingMasterData = false;


export const getActionTypes = async (): Promise<ImprovementActionType[]> => {
  const typesCol = collection(db, 'actionTypes');
  let snapshot = await getDocs(query(typesCol, orderBy("name")));

  if (snapshot.empty && !isSeedingMasterData) {
      isSeedingMasterData = true; // Prevenir ejecuciones concurrentes
      console.log("ActionTypes collection is empty. Populating with seed data...");
      try {
          const batch = writeBatch(db);
          seedActionTypes.forEach(item => {
              const docRef = doc(db, 'actionTypes', item.id);
              batch.set(docRef, item);
          });
          await batch.commit();
          snapshot = await getDocs(query(typesCol, orderBy("name"))); // Re-fetch
      } catch(error) {
          console.error("Error seeding actionTypes:", error);
      } finally {
          isSeedingMasterData = false;
      }
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImprovementActionType));
};

export const getCategories = async (): Promise<ActionCategory[]> => {
  const categoriesCol = collection(db, 'categories');
  let snapshot = await getDocs(query(categoriesCol, orderBy("name")));

  if (snapshot.empty && !isSeedingMasterData) {
    isSeedingMasterData = true;
    console.log("Categories collection is empty. Populating with seed data...");
    try {
        const batch = writeBatch(db);
        seedCategories.forEach(item => {
            const docRef = doc(db, 'categories', item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
        snapshot = await getDocs(query(categoriesCol, orderBy("name")));
    } catch(error) {
        console.error("Error seeding categories:", error);
    } finally {
        isSeedingMasterData = false;
    }
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionCategory));
};

export const getSubcategories = async (): Promise<ActionSubcategory[]> => {
  const subcategoriesCol = collection(db, 'subcategories');
  let snapshot = await getDocs(query(subcategoriesCol, orderBy("name")));

  if (snapshot.empty && !isSeedingMasterData) {
    isSeedingMasterData = true;
    console.log("Subcategories collection is empty. Populating with seed data...");
    try {
        const batch = writeBatch(db);
        seedSubcategories.forEach(item => {
            const docRef = doc(db, 'subcategories', item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
        snapshot = await getDocs(query(subcategoriesCol, orderBy("name")));
    } catch(error) {
        console.error("Error seeding subcategories:", error);
    } finally {
        isSeedingMasterData = false;
    }
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionSubcategory));
};

export const getAffectedAreas = async (): Promise<AffectedArea[]> => {
  const affectedAreasCol = collection(db, 'affectedAreas');
  let snapshot = await getDocs(query(affectedAreasCol, orderBy("name")));

  if (snapshot.empty && !isSeedingMasterData) {
    isSeedingMasterData = true;
    console.log("AffectedAreas collection is empty. Populating with seed data...");
    try {
        const batch = writeBatch(db);
        seedAffectedAreas.forEach(item => {
            const docRef = doc(db, 'affectedAreas', item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
        snapshot = await getDocs(query(affectedAreasCol, orderBy("name")));
    } catch(error) {
        console.error("Error seeding affectedAreas:", error);
    } finally {
        isSeedingMasterData = false;
    }
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AffectedArea));
};

export const getResponsibilityRoles = async (): Promise<ResponsibilityRole[]> => {
    const rolesCol = collection(db, 'responsibilityRoles');
    const snapshot = await getDocs(query(rolesCol, orderBy("name")));
    
    const roles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResponsibilityRole));
    
    return roles;
};

export const getCenters = async (): Promise<Center[]> => {
  const centersCol = collection(db, 'locations');
  const snapshot = await getDocs(query(centersCol, where("estado", "==", "OPERATIVO")));

  const operativeCenters = snapshot.docs.map(doc => ({ 
      id: doc.id,
      code: doc.data().codigo_centro,
      name: `${doc.data().codigo_centro} - ${doc.data().descripcion_centro}`
    }));

  operativeCenters.sort((a, b) => a.name.localeCompare(b.name));

  return operativeCenters;
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
