
import { collection, getDocs, doc, addDoc, query, orderBy, updateDoc, deleteDoc, writeBatch, where, getDoc, setDoc, limit, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea, MasterDataItem, ResponsibilityRole, Center } from '@/lib/types';
import { seedActionTypes, seedCategories, seedSubcategories } from '@/lib/master-seed-data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


// Variable global per a prevenir la execució múltiple del seeder
let isSeedingMasterData = false;
let hasEnrichedLocations = false;


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

export const enrichLocationsWithResponsibles = async (): Promise<number> => {
    console.log("[enrichLocations] Starting process to enrich locations with responsibles...");
    const locationsCol = collection(db, 'locations');
    const locationsSnapshot = await getDocs(locationsCol);
    const existingLocations = new Map(locationsSnapshot.docs.map(doc => [doc.id, doc.data()]));

    const data = `Código;Nombre;Titular/es;Dependencia;Area;C_Autonoma;Organizacion_Territorial;RRHH_Territorial;Prestaciones_Territorial;Prevencion_Territorial;Area_F_Territorial;Coordinador_Sanitario;Gestion_Calidad;Administracion;Proas_Territorial;Coordinador_Informatico;SPP_Territorial;Coordinador_Instalaciones;Consultor_Prevencion;Gestion_Afiliacion;Gestion_Pago_Delegado
0101;Llodio;Jose Luis Rituerto Martinez;Llodio_CA_Director@asepeyo.es;PAIS_VASCO_DT_Director@asepeyo.es;PAIS_VASCO_DT_Director@asepeyo.es;DT_AREA_NORTE_Director@asepeyo.es;PAIS_VASCO_DT_Coordinador-RRHH@asepeyo.es;PAIS_VASCO_DT_Coordinador-PR@asepeyo.es;PAIS_VASCO_DT_Coordinador-PV@asepeyo.es;;PAIS VASCO DAS_Coordinador-CMCP;ASEPEYO GESTIONES DGCMA;Llodio_CA_Direccion@asepeyo.es;Proas Pais Vasco_Coordinador;MIGUEL ECHEANDIA RENTERIA;ALFREDO MARTIN GONZALEZ;JAVIER GRANDA LOPEZ;Vitoria_PV_Personal@asepeyo.es;;`;
    const batch = writeBatch(db);
    let updatedCount = 0;
    let updatePayloads: { path: string, data: any }[] = [];

    const lines = data.trim().split('\n').slice(1); // Skip header row
    const headers = data.trim().split('\n')[0].split(';').map(h => h.trim());
    const responsibleHeaders = headers.slice(3); // Start from the 4th column

    lines.forEach(line => {
        const values = line.split(';');
        const locationId = values[0].trim();

        if (existingLocations.has(locationId)) {
            const responsibles: { [key: string]: string } = {};
            responsibleHeaders.forEach((header, index) => {
                const responsibleValue = values[index + 3]?.trim();
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

    batch.commit()
      .then(() => {
          console.log(`[enrichLocations] Successfully updated ${updatedCount} existing locations with responsibles.`);
      })
      .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: '/locations (batch update)',
              operation: 'update',
              requestResourceData: updatePayloads, 
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          // We don't re-throw the original error here to let the emitter handle it.
      });

    return updatedCount;
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
  const docRef = await addDoc(collectionRef, item)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `/${collectionName}/<new>`,
            operation: 'create',
            requestResourceData: item,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });
  return docRef.id;
}

// Generic function to update an item
export async function updateMasterDataItem(collectionName: string, itemId: string, item: Partial<Omit<MasterDataItem, 'id'>>): Promise<void> {
  const docRef = doc(db, collectionName, itemId);
  await updateDoc(docRef, item)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: item,
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
