

import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc, writeBatch, where, getDoc, setDoc, limit, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, ResponsibilityRole, Center } from '@/lib/types';
import { seedActionTypes, seedCategories, seedSubcategories } from '@/lib/master-seed-data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


// Variable global per a prevenir la execució múltiple del seeder
let isSeedingMasterData = false;
let hasEnrichedLocations = false;

// Function to recursively remove undefined values from an object
function sanitizeDataForFirestore<T extends object>(data: T): T {
    const sanitizedData = JSON.parse(JSON.stringify(data));
    const clean = (obj: any) => {
        if (obj === null || typeof obj !== 'object') return;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] === undefined) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object') {
                    if(Array.isArray(obj[key])) {
                        obj[key].forEach((item: any) => clean(item));
                    } else {
                        clean(obj[key]);
                    }
                }
            }
        }
    };
    clean(sanitizedData);
    return sanitizedData;
}


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
    // First, query for the base conditions.
    const q = query(locationsCol, 
        where("organizacion", "==", "Organización General"),
        where("estado", "==", "OPERATIVO")
    );

    const snapshot = await getDocs(q);

    // Then, filter in-memory for the 'tipo_centro' condition.
    const areas = snapshot.docs
      .filter(doc => {
          const tipoCentro = doc.data().tipo_centro;
          return tipoCentro === "Direcciones Funcionales" || tipoCentro === "Dirección de área";
      })
      .map(doc => ({
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

export async function getLocations(): Promise<any[]> {
    const locationsCol = collection(db, 'locations');
    const snapshot = await getDocs(locationsCol);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


export const enrichLocationsWithResponsibles = async (): Promise<number> => {
    console.log("[enrichLocations] Starting process to enrich locations with responsibles...");
    const locationsCol = collection(db, 'locations');
    let locationsSnapshot;
    try {
        locationsSnapshot = await getDocs(locationsCol);
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: '/locations',
            operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }

    const existingLocations = new Map(locationsSnapshot.docs.map(doc => [doc.id, doc.data()]));

    const data = `Código;Nombre;Titular/es;Dependencia;Area;C_Autonoma;Organizacion_Territorial;RRHH_Territorial;Prestaciones_Territorial;Prevencion_Territorial;Area_F_Territorial;Coordinador_Sanitario;Gestion_Calidad;Administracion;Proas_Territorial;Coordinador_Informatico;SPP_Territorial;Coordinador_Instalaciones;Consultor_Prevencion;Gestion_Afiliacion;Gestion_Pago_Delegado
0101;Llodio;Jose Luis Rituerto Martinez;Llodio_CA_Director@asepeyo.es;PAIS_VASCO_DT_Director@asepeyo.es;PAIS_VASCO_DT_Director@asepeyo.es;DT_AREA_NORTE_Director@asepeyo.es;PAIS_VASCO_DT_Coordinador-RRHH@asepeyo.es;PAIS_VASCO_DT_Coordinador-PR@asepeyo.es;PAIS_VASCO_DT_Coordinador-PV@asepeyo.es;;PAIS VASCO DAS_Coordinador-CMCP;ASEPEYO GESTIONES DGCMA;Llodio_CA_Direccion@asepeyo.es;Proas Pais Vasco_Coordinador;MIGUEL ECHEANDIA RENTERIA;ALFREDO MARTIN GONZALEZ;JAVIER GRANDA LOPEZ;Vitoria_PV_Personal@asepeyo.es;;`;
    const batch = writeBatch(db);
    let updatedCount = 0;
    let updatePayloads: { path: string, data: any }[] = [];

    const lines = data.trim().split('\n').slice(1); // Skip header row
    const headers = data.trim().split('\n')[0].split(';').map(h => h.trim());
    const responsibleHeaders = headers.slice(2); // Start from the 3rd column now

    lines.forEach(line => {
        const values = line.split(';');
        const locationId = values[0].trim();

        if (existingLocations.has(locationId)) {
            const responsibles: { [key: string]: string } = {};
            responsibleHeaders.forEach((header, index) => {
                const responsibleValue = values[index + 2]?.trim();
                if (responsibleValue) {
                    responsibles[header] = responsibleValue;
                }
            });

            const docRef = doc(db, 'locations', locationId);
            const payload = { responsibles };
            batch.update(docRef, payload);
            updatePayloads.push({ path: docRef.path, data: payload });
            updatedCount++;
        }
    });

    try {
        await batch.commit();
        console.log(`[enrichLocations] Successfully updated ${updatedCount} existing locations with responsibles.`);
        return updatedCount;
    } catch (serverError) {
        console.error("[enrichLocations] Error committing batch update:", serverError);
        const permissionError = new FirestorePermissionError({
            path: '/locations (batch update)',
            operation: 'update',
            requestResourceData: updatePayloads,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}

export const getCenters = async (): Promise<Center[]> => {
    // Aquesta funció ara només obté els centres, l'enriquiment es fa apart.
    const locationsCol = collection(db, 'locations');
    const q = query(locationsCol, 
        where("tipo_centro", "in", ["Centro Asistencial", "Hospital", "Oficina", "Centro de Prevención", "Centro Médico Colaborador"])
    );
    const snapshot = await getDocs(q);

    const centers = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().descripcion_centro || doc.id,
        code: doc.data().codigo_centro
    }));

    centers.sort((a, b) => a.name.localeCompare(b.name));
    
    return centers;
};

// Generic function to add a new item
export async function addMasterDataItem(collectionName: string, item: Omit<MasterDataItem, 'id'>): Promise<string> {
  const collectionRef = collection(db, collectionName);
  const dataToSave = sanitizeDataForFirestore(item);
  const docRef = await addDoc(collectionRef, dataToSave)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `/${collectionName}/<new>`,
            operation: 'create',
            requestResourceData: dataToSave,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
  return docRef.id;
}

// Generic function to update an item, replacing it completely.
export async function updateMasterDataItem(collectionName: string, itemId: string, item: Partial<Omit<MasterDataItem, 'id'>>): Promise<void> {
  const docRef = doc(db, collectionName, itemId);
  const dataToSave = sanitizeDataForFirestore(item);
  // Use setDoc without merge to overwrite the document, effectively deleting old fields.
  await setDoc(docRef, dataToSave)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'write', // 'write' covers setDoc
            requestResourceData: dataToSave,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
}

// Generic function to delete an item and its sub-items
export async function deleteMasterDataItem(collectionName: string, itemId: string): Promise<void> {
    const batch = writeBatch(db);

    const itemDocRef = doc(db, collectionName, itemId);
    batch.delete(itemDocRef);

    if (collectionName === 'ambits') {
        const originsQuery = query(collection(db, 'origins'), where('actionTypeIds', 'array-contains', itemId));
        const originsSnapshot = await getDocs(originsQuery);
        for (const originDoc of originsSnapshot.docs) {
             const originRef = doc(db, 'origins', originDoc.id);
             // Remove the ambit ID from the origin's list. If the list becomes empty, it can be left as is or you could implement logic to delete it.
             batch.update(originRef, { actionTypeIds: arrayRemove(itemId) });
        }
    } else if (collectionName === 'origins') {
        const subcategoriesQuery = query(collection(db, 'classifications'), where('categoryId', '==', itemId));
        const subcategoriesSnapshot = await getDocs(subcategoriesQuery);
        subcategoriesSnapshot.forEach(subDoc => {
            batch.delete(doc(db, 'classifications', subDoc.id));
        });
    }

    try {
        await batch.commit();
    } catch(serverError) {
        const permissionError = new FirestorePermissionError({
            path: itemDocRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}
