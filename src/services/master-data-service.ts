

import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc, writeBatch, where } from 'firebase/firestore';
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
    
    const roles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResponsibilityRole));
    
    return roles;
};

export const getCenters = async (): Promise<Center[]> => {
  const centersCol = collection(db, 'locations');
  let snapshot = await getDocs(centersCol);

  if (snapshot.empty) {
      console.log("Locations collection is empty. Seeding with test data...");
      const batch = writeBatch(db);
      const seedLocations = [
          { id: "center-1", codigo_centro: "08017001", descripcion_centro: "Acció Preventiva", estado: "OPERATIVO" },
          { id: "center-2", codigo_centro: "08018001", descripcion_centro: "Centre Mèdic de Cotxeres", estado: "OPERATIVO" },
          { id: "center-3", codigo_centro: "08073001", descripcion_centro: "Centre Mèdic de Cornellà", estado: "OPERATIVO" },
          { id: "center-4", codigo_centro: "08022001", descripcion_centro: "Centre Mèdic de Balmes", estado: "OPERATIVO" },
          { id: "center-5", codigo_centro: "08001001", descripcion_centro: "Serveis Centrals", estado: "BAJA" },
      ];
      seedLocations.forEach(loc => {
          const docRef = doc(db, 'locations', loc.id);
          batch.set(docRef, {
              codigo_centro: loc.codigo_centro,
              descripcion_centro: loc.descripcion_centro,
              estado: loc.estado
          });
      });
      await batch.commit();
      console.log("Locations collection seeded.");
      snapshot = await getDocs(centersCol);
  }
  
  const allCenters = snapshot.docs.map(doc => ({ 
      id: doc.id,
      code: doc.data().codigo_centro,
      name: doc.data().descripcion_centro,
      estado: doc.data().estado
    }));

  const operativeCenters = allCenters
    .filter(center => center.estado === 'OPERATIVO')
    .map(center => ({
      id: center.id,
      code: center.code,
      name: `${center.code} - ${center.name}`
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
