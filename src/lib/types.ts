export type ImprovementActionType = 
  | 'Correctiva' 
  | 'IV DAS-DP' 
  | 'IV' 
  | 'ACM' 
  | 'AMSGP' 
  | 'SAU' 
  | 'AC' 
  | 'ACSGSI' 
  | 'ACPSI' 
  | 'ACRSC';

export type ImprovementActionStatus = 'Borrador' | 'Pendiente Análisis' | 'Pendiente Comprobación' | 'Pendiente de Cierre' | 'Finalizada';

export interface User {
  id: string;
  name: string;
  // El rol es determinarà pels grups de Google, el camp es pot eliminar o mantenir per a info addicional.
  role?: 'Creator' | 'Responsible' | 'Director' | 'Committee' | 'Admin';
  avatar: string;
  email: string;
};

// Nou tipus per a representar els grups
export interface UserGroup {
  id: string; // p.ex., l'email del Google Group
  name: string;
  userIds: string[];
}

// Representa la informació de l'usuari emmagatzemada dins d'una acció.
// És més lleuger que l'objecte User complet.
export interface ActionUserInfo {
  id: string;
  name: string;
  avatar?: string;
}

export interface ImprovementAction {
  id: string; // Firestore document ID
  actionId: string; // User-facing ID like AM-24001
  title: string; // ASUNTO
  category: string; // CATEGORÍA
  subcategory: string; // SUBCATEGORÍA
  type: ImprovementActionType;
  status: ImprovementActionStatus;
  description: string; // OBSERVACIONES
  affectedAreas: string; // AA.FF. IMPLICADAS
  assignedTo: string; // ASIGNADO A
  creator: ActionUserInfo;
  responsibleGroupId: string; // ID del grup responsable
  responsibleUser?: ActionUserInfo; // Opcional, si una persona específica s'assigna dins del grup
  creationDate: string;
  analysisDueDate: string;
  implementationDueDate: string;
  closureDueDate: string;
  analysis?: {
    causes: string;
    proposedAction: string;
    responsible: ActionUserInfo;
    date: string;
  };
  verification?: {
    notes: string;
    isCompliant: boolean;
    date: string;
  };
  closure?: {
    notes: string;
    isCompliant: boolean;
    date: string;
  };
};
