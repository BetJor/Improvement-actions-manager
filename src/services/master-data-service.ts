

import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc, writeBatch, where, getDoc, setDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, ResponsibilityRole, Center } from '@/lib/types';
import { seedAffectedAreas, seedActionTypes } from '@/lib/master-seed-data';

// Variable global per a prevenir la execució múltiple del seeder
let isSeedingMasterData = false;


export const getActionTypes = async (): Promise<ImprovementActionType[]> => {
  const typesCol = collection(db, 'ambits');
  let snapshot = await getDocs(query(typesCol, orderBy("order", "asc"), orderBy("name", "asc")));

  if (snapshot.empty && !isSeedingMasterData) {
    isSeedingMasterData = true;
    console.log("ActionTypes (ambits) collection is empty. Populating with seed data...");
    try {
        const batch = writeBatch(db);
        seedActionTypes.forEach(item => {
            const docRef = doc(collection(db, 'ambits')); // Let Firestore generate ID
            batch.set(docRef, item);
        });
        await batch.commit();
        snapshot = await getDocs(query(typesCol, orderBy("order", "asc"), orderBy("name", "asc")));
        console.log("ActionTypes (ambits) collection seeded successfully.");
    } catch(error) {
        console.error("Error seeding actionTypes:", error);
    } finally {
        isSeedingMasterData = false;
    }
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImprovementActionType));
};

export const getCategories = async (): Promise<ActionCategory[]> => {
  const categoriesCol = collection(db, 'origins');
  let snapshot = await getDocs(query(categoriesCol, orderBy("order")));

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionCategory));
};

export const getSubcategories = async (): Promise<ActionSubcategory[]> => {
  const subcategoriesCol = collection(db, 'classifications');
  let snapshot = await getDocs(query(subcategoriesCol, orderBy("order")));
  
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
            const docRef = doc(collection(db, 'affectedAreas')); // Let Firestore generate ID
            batch.set(docRef, item);
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
    
    // Get the current max order value
    const q = query(collectionRef, orderBy("order", "desc"), limit(1));
    const snapshot = await getDocs(q);
    let newOrder = 0;
    if (!snapshot.empty) {
        const lastItem = snapshot.docs[0].data();
        if (typeof lastItem.order === 'number') {
            newOrder = lastItem.order + 1;
        }
    }
    
    // Add the new item with the calculated order
    await addDoc(collectionRef, { ...item, order: newOrder });
}


export async function updateMasterDataItem(collectionName: string, itemId: string, item: Omit<MasterDataItem, 'id'>): Promise<void> {
    const docRef = doc(db, collectionName, itemId);
    await updateDoc(docRef, item);
}

export async function deleteMasterDataItem(collectionName: string, itemId: string): Promise<void> {
    const docRef = doc(db, collectionName, itemId);
    await deleteDoc(docRef);
}

