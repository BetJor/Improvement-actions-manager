import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc, writeBatch, where, getDoc, setDoc, limit, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, ResponsibilityRole, Center } from '@/lib/types';
import { seedActionTypes, seedCategories, seedSubcategories } from '@/lib/master-seed-data';

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

  if (snapshot.empty && !isSeedingMasterData) {
    isSeedingMasterData = true;
    console.log("Categories (origins) collection is empty. Populating with seed data...");
    try {
        const allAmbits = await getActionTypes();
        const batch = writeBatch(db);
        
        seedCategories.forEach(categorySeed => {
            const ambitParent = allAmbits.find(a => a.name === categorySeed.ambitName);
            if (ambitParent && ambitParent.id) {
                const docRef = doc(collection(db, 'origins')); // Let Firestore generate ID
                const newCategory: Omit<ActionCategory, 'id' | 'ambitName'> = {
                    name: categorySeed.name,
                    order: categorySeed.order,
                    actionTypeIds: [ambitParent.id],
                };
                batch.set(docRef, newCategory);
            } else {
                console.warn(`Could not find parent ambit named '${categorySeed.ambitName}' for origin '${categorySeed.name}'. Skipping.`);
            }
        });
        
        await batch.commit();
        snapshot = await getDocs(query(categoriesCol, orderBy("order")));
        console.log("Categories (origins) collection seeded successfully.");
    } catch(error) {
        console.error("Error seeding categories:", error);
    } finally {
        isSeedingMasterData = false;
    }
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionCategory));
};

export const getSubcategories = async (): Promise<ActionSubcategory[]> => {
  const subcategoriesCol = collection(db, 'classifications');
  let snapshot = await getDocs(query(subcategoriesCol, orderBy("order")));
  
  if (snapshot.empty && !isSeedingMasterData) {
    isSeedingMasterData = true;
    console.log("Subcategories (classifications) collection is empty. Populating with seed data...");
    try {
        const allAmbits = await getActionTypes();
        const allOrigins = await getCategories();
        const batch = writeBatch(db);

        seedSubcategories.forEach(subcatSeed => {
            const parentAmbit = allAmbits.find(a => a.name === subcatSeed.ambitName);
            if (!parentAmbit) {
                console.warn(`Subcategory seed error: Ambit '${subcatSeed.ambitName}' not found. Skipping '${subcatSeed.name}'.`);
                return;
            }

            const parentOrigin = allOrigins.find(o => o.name === subcatSeed.originName && o.actionTypeIds?.includes(parentAmbit.id!));
            if (parentOrigin && parentOrigin.id) {
                 const docRef = doc(collection(db, 'classifications'));
                 const newSubcategory: Omit<ActionSubcategory, 'id' | 'ambitName' | 'originName'> = {
                     name: subcatSeed.name,
                     order: subcatSeed.order,
                     categoryId: parentOrigin.id,
                 };
                 batch.set(docRef, newSubcategory);
            } else {
                 console.warn(`Subcategory seed error: Origin '${subcatSeed.originName}' within Ambit '${subcatSeed.ambitName}' not found. Skipping '${subcatSeed.name}'.`);
            }
        });
        
        await batch.commit();
        snapshot = await getDocs(query(subcategoriesCol, orderBy("order")));
        console.log("Subcategories (classifications) collection seeded successfully.");
    } catch(error) {
        console.error("Error seeding subcategories:", error);
    } finally {
        isSeedingMasterData = false;
    }
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionSubcategory));
};

export const getAffectedAreas = async (): Promise<AffectedArea[]> => {
    const locationsCol = collection(db, 'locations');
    const q = query(locationsCol, 
        where("organización", "==", "Organización General"),
        where("tipo_centro", "in", ["Direcciones Funcionales", "Dirección de área"]),
        where("estado", "==", "OPERATIVO")
    );

    const snapshot = await getDocs(q);

    const areas = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().descripcion_centro || doc.id
    }));

    areas.sort((a, b) => a.name.localeCompare(b.name));
    return areas;
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
    const docRef = doc(collectionRef);
    await setDoc(docRef, { ...item, id: docRef.id, order: newOrder });
}


export async function updateMasterDataItem(collectionName: string, itemId: string, item: Omit<MasterDataItem, 'id'>): Promise<void> {
    const docRef = doc(db, collectionName, itemId);
    await updateDoc(docRef, item);
}

export async function deleteMasterDataItem(collectionName: string, itemId: string): Promise<void> {
    const docRef = doc(db, collectionName, itemId);
    
    // If we're deleting a responsibility role, we need to clean up references in 'ambits'
    if (collectionName === 'responsibilityRoles') {
        const ambitsColRef = collection(db, 'ambits');
        const ambitsSnapshot = await getDocs(ambitsColRef);
        
        const batch = writeBatch(db);
        
        ambitsSnapshot.forEach(ambitDoc => {
            const ambitData = ambitDoc.data() as ImprovementActionType;
            const fieldsToUpdate: any = {};
            
            ['configAdminRoleIds', 'possibleCreationRoles', 'possibleAnalysisRoles', 'possibleClosureRoles'].forEach(field => {
                const roleIds = (ambitData as any)[field];
                if (Array.isArray(roleIds) && roleIds.includes(itemId)) {
                    fieldsToUpdate[field] = arrayRemove(itemId);
                }
            });

            if (Object.keys(fieldsToUpdate).length > 0) {
                batch.update(ambitDoc.ref, fieldsToUpdate);
            }
        });
        
        await batch.commit();
    }
    
    await deleteDoc(docRef);
}
