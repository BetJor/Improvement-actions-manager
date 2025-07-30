import type { ImprovementAction, User, UserGroup } from './types';
import { subDays, format } from 'date-fns';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

// Funció per obtenir les dades de Firestore
export const getActions = async (): Promise<ImprovementAction[]> => {
    const actionsCol = collection(db, 'actions');
    const actionsSnapshot = await getDocs(actionsCol);
    const actionsList = actionsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Important: Firestore no emmagatzema objectes complexos com 'creator' o 'responsibleUser' directament.
      // Aquí estem simplificant i assumint que les dades recuperades coincideixen amb la nostra interfície.
      // En un cas real, hauríem de fer cerques addicionals per a poblar aquests camps.
      return { id: doc.id, ...data } as ImprovementAction;
    });
    return actionsList;
}

export const getActionById = async (id: string): Promise<ImprovementAction | null> => {
    const actionDocRef = doc(db, 'actions', id);
    const actionDocSnap = await getDoc(actionDocRef);

    if (actionDocSnap.exists()) {
        const data = actionDocSnap.data();
        // Mateixa simplificació que a getActions
        return { id: actionDocSnap.id, ...data } as ImprovementAction;
    } else {
        return null;
    }
}
