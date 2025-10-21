

import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc, writeBatch, where, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, ResponsibilityRole, Center } from '@/lib/types';
import { seedActionTypes, seedCategories, seedSubcategories, seedAffectedAreas } from '@/lib/master-seed-data';

// Variable global per a prevenir la execució múltiple del seeder
let isSeedingMasterData = false;


export const getActionTypes = async (): Promise<ImprovementActionType[]> => {
  const typesCol = collection(db, 'ambits');
  let snapshot = await getDocs(query(typesCol, orderBy("name")));

  if (snapshot.empty && !isSeedingMasterData) {
      isSeedingMasterData = true; 
      console.log("Ambits collection is empty. Populating with seed data...");
      try {
          const batch = writeBatch(db);
          seedActionTypes.forEach(item => {
              const { id, ...data } = item; // Exclude the temporary seed ID
              const docRef = doc(db, 'ambits', id); // Use the hardcoded ID
              batch.set(docRef, data);
          });
          await batch.commit();
          snapshot = await getDocs(query(typesCol, orderBy("name"))); // Re-fetch
          console.log("Ambits collection seeded successfully.");
      } catch(error) {
          console.error("Error seeding ambits:", error);
      } finally {
          isSeedingMasterData = false;
      }
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImprovementActionType));
};

export const getCategories = async (): Promise<ActionCategory[]> => {
  const categoriesCol = collection(db, 'origins');
  let snapshot = await getDocs(query(categoriesCol, orderBy("name")));

  if (snapshot.empty && !isSeedingMasterData) {
    isSeedingMasterData = true;
    console.log("Origins collection is empty. Populating with seed data...");
    try {
        const batch = writeBatch(db);
        seedCategories.forEach(item => {
            const { id, ...data } = item; // Exclude the temporary seed ID
            const docRef = doc(db, 'origins', id); // Use the hardcoded ID
            batch.set(docRef, data);
        });
        await batch.commit();
        snapshot = await getDocs(query(categoriesCol, orderBy("name")));
        console.log("Origins collection seeded successfully.");
    } catch(error) {
        console.error("Error seeding origins:", error);
    } finally {
        isSeedingMasterData = false;
    }
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionCategory));
};

export const getSubcategories = async (): Promise<ActionSubcategory[]> => {
  const subcategoriesCol = collection(db, 'classifications');
  let snapshot = await getDocs(query(subcategoriesCol, orderBy("name")));
  
  if (snapshot.empty && !isSeedingMasterData) {
    isSeedingMasterData = true;
    console.log("Classifications collection is empty. Populating with seed data...");
    try {
        const batch = writeBatch(db);
        seedSubcategories.forEach(item => {
            const { id, ...data } = item; // Exclude the temporary seed ID
            const docRef = doc(db, 'classifications', id); // Use the hardcoded ID
            batch.set(docRef, data);
        });
        await batch.commit();
        snapshot = await getDocs(query(subcategoriesCol, orderBy("name")));
        console.log("Classifications collection seeded successfully.");
    } catch(error) {
        console.error("Error seeding classifications:", error);
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
            const { id, ...data } = item; // Exclude the temporary seed ID
            const docRef = doc(db, 'affectedAreas', id); // Use the hardcoded ID
            batch.set(docRef, data);
        });
        await batch.commit();
        snapshot = await getDocs(query(affectedAreasCol, orderBy("name")));
        console.log("AffectedAreas collection seeded successfully.");
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
export async function addMasterDataItem(collectionName: string, item: Omit<MasterDataItem, 'id'>): Promise<void> {
    if (!item.name) {
        throw new Error("Item name cannot be empty.");
    }
    const collectionRef = collection(db, collectionName);
    // Use addDoc to let Firestore generate a unique ID
    await addDoc(collectionRef, item);
}

export async function updateMasterDataItem(collectionName: string, itemId: string, item: Omit<MasterDataItem, 'id'>): Promise<void> {
    const docRef = doc(db, collectionName, itemId);
    await updateDoc(docRef, item);
}

export async function deleteMasterDataItem(collectionName: string, itemId: string): Promise<void> {
    const docRef = doc(db, collectionName, itemId);
    await deleteDoc(docRef);
}
