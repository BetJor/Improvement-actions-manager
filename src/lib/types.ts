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

export interface ImprovementAction {
  id: string;
  title: string;
  type: ImprovementActionType;
  status: ImprovementActionStatus;
  description: string;
  creator: User;
  responsibleGroupId: string; // ID del grup responsable
  responsibleUser?: User; // Opcional, si una persona específica s'assigna dins del grup
  creationDate: string;
  analysisDueDate: string;
  implementationDueDate: string;
  closureDueDate: string;
  analysis?: {
    causes: string;
    proposedAction: string;
    responsible: User;
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
