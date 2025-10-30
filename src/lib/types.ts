

export interface MasterDataItem {
  id?: string;
  name: string;
  order?: number;
  [key: string]: any; // Permet altres propietats
}
    
export interface ImprovementActionType extends MasterDataItem {
  configAdminRoleIds?: string[]; // IDs of ResponsibilityRole who can configure this scope
  possibleCreationRoles?: string[]; // IDs from ResponsibilityRole collection
  possibleAnalysisRoles?: string[]; // IDs from ResponsibilityRole collection
}

export interface ResponsibilityRole extends MasterDataItem {
    type: 'Pattern' | 'Fixed';
    emailPattern?: string; // e.g., "direccion-{{center.id}}@example.com"
    email?: string; // e.g., "calidad.global@example.com"
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
  id: string; // p.ex., l'email del Google Group
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
  dueDate: Date | string; // Acceptem string per a la inicialització des de Firestore
  status?: ProposedActionStatus;
  statusUpdateDate?: string; // ISO String
}

export interface ActionComment {
    id: string;
    author: ActionUserInfo;
    date: string; // ISO string
    text: string;
}

export interface ActionAttachment {
    id: string;
    fileName: string;
    description?: string;
    fileUrl: string;
    uploadedBy: ActionUserInfo;
    uploadedAt: string; // ISO string
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
  affectedAreas: string[]; 
  affectedAreasIds: string[];
  center?: string;
  centerId?: string;
  assignedTo: string;
  
  status: ImprovementActionStatus;

  // Dynamic permissions fields
  readers: string[]; // Array of resolved user/group emails
  authors: string[]; // Array of resolved user/group emails

  // Dates
  analysisDueDate: string;
  verificationDueDate: string;
  implementationDueDate: string;
  closureDueDate: string;

  // BIS Action traceability
  originalActionId?: string; // The Firestore ID of the original action
  originalActionTitle?: string;

  // Followers
  followers?: string[]; // Array of user IDs

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

    
