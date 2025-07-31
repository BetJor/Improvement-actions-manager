

export interface MasterDataItem {
  id?: string;
  name: string;
  [key: string]: any; // Permet altres propietats
}
    
export interface ImprovementActionType extends MasterDataItem {}

export type ImprovementActionStatus = 'Borrador' | 'Pendiente Análisis' | 'Pendiente Comprobación' | 'Pendiente de Cierre' | 'Finalizada';

export interface User {
  id: string;
  name: string;
  role?: 'Creator' | 'Responsible' | 'Director' | 'Committee' | 'Admin';
  avatar: string;
  email: string;
};

export interface UserGroup {
  id: string; // p.ex., l'email del Google Group
  name: string;
  userIds: string[];
}

export interface ActionCategory extends MasterDataItem {}

export interface ActionSubcategory extends MasterDataItem {
  categoryId: string;
}

export interface AffectedArea extends MasterDataItem {}

export interface ActionUserInfo {
  id: string;
  name: string;
  avatar?: string;
}

export interface WorkflowStep {
  stepName: string;
  responsibleParty: string;
  dueDate: string;
  status: 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido';
  completedDate?: string;
  notes?: string;
}

export interface WorkflowPlan {
  workflowId: string;
  actionId: string;
  steps: WorkflowStep[];
}

export type ProposedActionStatus = 'Implementada' | 'Implementada Parcialment' | 'No Implementada';

export interface ProposedAction {
  id: string;
  description: string;
  responsibleUserId: string;
  dueDate: Date | string; // Acceptem string per a la inicialització des de Firestore
  status?: ProposedActionStatus;
}

export interface ImprovementAction {
  id: string; // Firestore document ID
  actionId: string; // User-facing ID like AM-24001
  title: string; 
  description: string;
  creator: ActionUserInfo;
  responsibleGroupId: string; 
  responsibleUser?: ActionUserInfo;
  creationDate: string;

  // Fields with names and IDs
  category: string;
  categoryId: string;
  subcategory: string;
  subcategoryId: string;
  type: string;
  typeId: string;
  affectedAreas: string; 
  affectedAreasId: string;
  assignedTo: string;
  
  status: ImprovementActionStatus;

  // Dates
  analysisDueDate: string;
  implementationDueDate: string;
  closureDueDate: string;

  // Optional detailed sections
  analysis?: {
    causes: string;
    proposedActions: ProposedAction[];
    verificationResponsibleUserId: string;
    analysisResponsible: ActionUserInfo;
    analysisDate: string;
  };
  verification?: {
    notes: string;
    isEffective: boolean;
    verificationDate: string;
    verificationResponsible: ActionUserInfo;
    proposedActionsStatus: Record<string, ProposedActionStatus>;
  };
  closure?: {
    notes: string;
    isCompliant: boolean;
    date: string;
    closureResponsible: ActionUserInfo;
  };
  workflowPlan?: WorkflowPlan;
};


