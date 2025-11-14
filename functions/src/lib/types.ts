
// This file is a copy from the main app's types.ts
// It's used by the Cloud Function to understand the data structures.

export interface MasterDataItem {
  id?: string;
  name: string;
  order?: number;
  [key: string]: any; 
}
    
export interface ImprovementActionType extends MasterDataItem {
  configAdminRoleIds?: string[]; 
  possibleCreationRoles?: string[]; 
  possibleAnalysisRoles?: string[]; 
}

export interface ResponsibilityRole extends MasterDataItem {
    type: 'Pattern' | 'Fixed';
    emailPattern?: string; 
    email?: string; 
}

export interface Center extends MasterDataItem {
  code?: string;
}


export type ImprovementActionStatus = 'Borrador' | 'Pendiente Análisis' | 'Pendiente Comprobación' | 'Pendiente de Cierre' | 'Finalizada' | 'Anulada';

export interface User {
  id: string;
  name: string;
  role?: 'Creator' | 'Responsible' | 'Director' | 'Committee' | 'Admin';
  avatar: string;
  email: string;
  dashboardLayout?: string[];
};

export interface UserGroup {
  id: string; 
  name: string;
  userIds: string[];
}

export interface ActionCategory extends MasterDataItem {
  actionTypeIds?: string[];
}

export interface ActionSubcategory extends MasterDataItem {
  categoryId: string;
}

export interface AffectedArea extends MasterDataItem {}

export interface GalleryPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

export interface ActionUserInfo {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
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

export type ProposedActionStatus = 'Pendiente' | 'Implementada' | 'Implementada Parcialmente' | 'No Implementada';
export type ProposedActionVerificationStatus = 'Verificada' | 'No Verificada';


export interface ProposedAction {
  id: string;
  description: string;
  responsibleUserId: string;
  responsibleUserEmail: string; 
  dueDate: Date | string; 
  status?: ProposedActionStatus;
  statusUpdateDate?: string; 
}

export interface ActionComment {
    id: string;
    author: ActionUserInfo;
    date: string; 
    text: string;
}

export interface ActionAttachment {
    id: string;
    fileName: string;
    description?: string;
    fileUrl: string;
    uploadedBy: ActionUserInfo;
    uploadedAt: string; 
}

export interface Tab {
  id: string;
  title: string;
  href: string;
  isClosable: boolean;
}

export interface PermissionRule {
  id?: string;
  actionTypeId: string;
  status: ImprovementActionStatus;
  readerRoleIds: string[];
  authorRoleIds: string[];
}

export interface SentEmailInfo {
  actionId: string;
  taskDescription: string;
  recipient: string;
  previewUrl: string | null;
}


export interface ImprovementAction {
  id: string; 
  actionId: string; 
  title: string; 
  description: string;
  creator: ActionUserInfo;
  responsibleGroupId: string; 
  responsibleUser?: ActionUserInfo;
  creationDate: string;

  category: string;
  categoryId: string;
  subcategory: string;
  subcategoryId: string;
  type: string;
  typeId: string;
  affectedAreas: string[]; 
  affectedAreasIds: string[];
  affectedCenters?: string[];
  affectedCentersIds?: string[];
  center?: string;
  centerId?: string;
  assignedTo: string;
  
  status: ImprovementActionStatus;

  readers: string[]; 
  authors: string[]; 

  analysisDueDate: string;
  verificationDueDate: string;
  implementationDueDate: string;
  closureDueDate: string;

  originalActionId?: string; 
  originalActionTitle?: string;

  followers?: string[]; 

  remindersSent?: {
    analysis?: boolean;
    verification?: boolean;
    closure?: boolean;
    proposedActions?: { [key: string]: boolean };
  }

  analysis?: {
    causes: string;
    proposedActions: ProposedAction[];
    verificationResponsibleUserId: string;
    verificationResponsibleUserEmail: string; 
    analysisResponsible: ActionUserInfo;
    analysisDate: string;
  };
  verification?: {
    notes: string;
    isEffective: boolean;
    verificationDate: string;
    verificationResponsible: ActionUserInfo;
    proposedActionsVerificationStatus: Record<string, ProposedActionVerificationStatus>;
  };
  closure?: {
    notes: string;
    isCompliant: boolean;
    date: string;
    closureResponsible: ActionUserInfo;
  };
  workflowPlan?: WorkflowPlan;
  comments?: ActionComment[];
  attachments?: ActionAttachment[];
};
