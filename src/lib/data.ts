import type { ImprovementAction, User, UserGroup } from './types';
import { subDays, format } from 'date-fns';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, where } from 'firebase/firestore';

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

const today = new Date();

const mockActions: Omit<ImprovementAction, 'id'>[] = [
    {
      actionId: "AM-24001",
      title: "Optimització del procés de facturació",
      type: "Correctiva",
      status: "Pendiente Análisis",
      description: "S'ha detectat un retard significatiu en el cicle de facturació que afecta el flux de caixa. Cal analitzar les causes i proposar una solució.",
      creator: users[2],
      responsibleGroupId: groups[0].id,
      responsibleUser: users[1],
      creationDate: format(subDays(today, 15), 'dd/MM/yyyy'),
      analysisDueDate: format(subDays(today, -15), 'dd/MM/yyyy'),
      implementationDueDate: format(subDays(today, -45), 'dd/MM/yyyy'),
      closureDueDate: format(subDays(today, -60), 'dd/MM/yyyy'),
      analysis: {
        causes: "La introducció manual de dades i la manca d'un sistema centralitzat generen colls d'ampolla i errors humans.",
        proposedAction: "Implementar un programari de facturació automatitzat i integrar-lo amb el CRM actual. Formar el personal sobre el nou sistema.",
        responsible: users[1],
        date: format(subDays(today, 10), 'dd/MM/yyyy')
      }
    },
    {
      actionId: "AM-24002",
      title: "Actualització de la política de seguretat",
      type: "ACSGSI",
      status: "Pendiente Comprobación",
      description: "Revisar i actualitzar la política de seguretat de la informació per a complir amb la nova normativa ISO 27001.",
      creator: users[4],
      responsibleGroupId: groups[1].id,
      creationDate: format(subDays(today, 40), 'dd/MM/yyyy'),
      analysisDueDate: format(subDays(today, 25), 'dd/MM/yyyy'),
      implementationDueDate: format(subDays(today, -20), 'dd/MM/yyyy'),
      closureDueDate: format(subDays(today, -35), 'dd/MM/yyyy')
    },
    {
        actionId: "AM-24003",
        title: "Millora del temps de resposta a tiquets de suport",
        type: "SAU",
        status: "Finalizada",
        description: "El temps mitjà de primera resposta a les consultes dels clients excedeix l'objectiu de 4 hores.",
        creator: users[2],
        responsibleGroupId: groups[2].id,
        creationDate: format(subDays(today, 60), 'dd/MM/yyyy'),
        analysisDueDate: format(subDays(today, 45), 'dd/MM/yyyy'),
        implementationDueDate: format(subDays(today, 15), 'dd/MM/yyyy'),
        closureDueDate: format(subDays(today, 0), 'dd/MM/yyyy'),
        analysis: {
          causes: "Distribució de càrrega de treball desigual entre els agents i manca de respostes predefinides per a consultes comunes.",
          proposedAction: "Implementar un sistema d'assignació automàtica de tiquets i crear una base de coneixement amb plantilles de resposta.",
          responsible: users[0],
          date: format(subDays(today, 55), 'dd/MM/yyyy')
        },
        verification: {
          notes: "El temps de resposta mitjà s'ha reduït a 2.5 hores.",
          isCompliant: true,
          date: format(subDays(today, 10), 'dd/MM/yyyy')
        },
        closure: {
          notes: "L'acció es considera eficaç i es tanca.",
          isCompliant: true,
          date: format(subDays(today, 1), 'dd/MM/yyyy')
        }
      },
      {
        actionId: "AM-24004",
        title: "No conformitat en l'auditoria interna",
        type: "IV",
        status: "Pendiente de Cierre",
        description: "S'ha detectat una no conformitat menor en el procediment de control de documents durant l'última auditoria interna.",
        creator: users[3],
        responsibleGroupId: groups[3].id,
        creationDate: format(subDays(today, 35), 'dd/MM/yyyy'),
        analysisDueDate: format(subDays(today, 20), 'dd/MM/yyyy'),
        implementationDueDate: format(subDays(today, 5), 'dd/MM/yyyy'),
        closureDueDate: format(subDays(today, -10), 'dd/MM/yyyy')
      },
      {
        actionId: "AM-24005",
        title: "Pla de formació en gestió de riscos",
        type: "ACRSC",
        status: "Borrador",
        description: "Esborrany per a definir un nou pla de formació anual per a tot el personal sobre la identificació i gestió de riscos operatius.",
        creator: users[0],
        responsibleGroupId: groups[4].id,
        creationDate: format(subDays(today, 2), 'dd/MM/yyyy'),
        analysisDueDate: format(subDays(today, -28), 'dd/MM/yyyy'),
        implementationDueDate: format(subDays(today, -58), 'dd/MM/yyyy'),
        closureDueDate: format(subDays(today, -73), 'dd/MM/yyyy')
      }
];

// Funció per obtenir les dades de Firestore
export const getActions = async (): Promise<ImprovementAction[]> => {
    
    const actionsCol = collection(db, 'actions');
    const actionsSnapshot = await getDocs(actionsCol);
    
    // Si no hi ha documents, carreguem les dades de mostra a Firestore
    if (actionsSnapshot.empty) {
      console.log('No actions found in Firestore. Loading mock data...');
      const batch: Promise<any>[] = [];
      for (const action of mockActions) {
        // Firestore no pot emmagatzemar 'undefined', així que ens assegurem que no hi hagi camps undefined
        const cleanAction = JSON.parse(JSON.stringify(action));
        batch.push(addDoc(actionsCol, cleanAction));
      }
      await Promise.all(batch);
      const newSnapshot = await getDocs(actionsCol);
      return newSnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id } as ImprovementAction;
      });
    }

    return actionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id } as ImprovementAction;
    });
}

export const getActionById = async (id: string): Promise<ImprovementAction | null> => {
    try {
        const actionDocRef = doc(db, 'actions', id);
        const actionDocSnap = await getDoc(actionDocRef);
    
        if (actionDocSnap.exists()) {
            const data = actionDocSnap.data();
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
