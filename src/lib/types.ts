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
  role: 'Creator' | 'Responsible' | 'Director' | 'Committee' | 'Admin';
  avatar: string;
};

export interface ImprovementAction {
  id: string;
  title: string;
  type: ImprovementActionType;
  status: ImprovementActionStatus;
  description: string;
  creator: User;
  responsible: User;
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
