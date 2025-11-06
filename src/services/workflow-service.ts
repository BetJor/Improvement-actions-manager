

import { collection, getDocs, doc, query, where, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, addDays, parseISO } from 'date-fns';
import type { ImprovementAction, WorkflowPlan, WorkflowStep, ImprovementActionType } from '@/lib/types';
import { getActionTypes } from './master-data-service';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


interface WorkflowSettings {
    analysisDueDays: number;
    verificationDueDays: number;
    closureDueDays: number;
}

export async function getWorkflowSettings(): Promise<WorkflowSettings> {
    const docRef = doc(db, 'app_settings', 'workflow');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as WorkflowSettings;
    }
    // Return default values if the document doesn't exist
    return {
        analysisDueDays: 30,
        verificationDueDays: 15,
        closureDueDays: 90,
    };
}

export async function updateWorkflowSettings(settings: Omit<WorkflowSettings, 'implementationDueDays'>): Promise<void> {
    const docRef = doc(db, 'app_settings', 'workflow');
    setDoc(docRef, settings, { merge: true })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: settings,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
}


/**
 * Generates a traditional, rule-based workflow plan for an improvement action.
 * @param action - The improvement action data.
 * @returns A promise that resolves to the generated WorkflowPlan.
 */
export async function planTraditionalActionWorkflow(action: Omit<ImprovementAction, 'id'>): Promise<WorkflowPlan> {

    // Fetch the global workflow settings
    const workflowSettings = await getWorkflowSettings();

    const steps: WorkflowStep[] = [];
    const creationDate = parseISO(action.creationDate);

    // Get due days from global config
    const analysisDays = workflowSettings.analysisDueDays;
    // NOTE: implementationDueDays is now calculated based on proposed actions, not from global config.
    const closureDays = workflowSettings.closureDueDays;

    const analysisDueDate = addDays(creationDate, analysisDays);
    // The implementation and closure due dates will be calculated later.
    // We set them to the analysis due date as a temporary placeholder.
    const implementationDueDate = analysisDueDate;
    const closureDueDate = addDays(implementationDueDate, closureDays);


    steps.push({
        stepName: 'Anàlisi de Causes',
        responsibleParty: action.responsibleGroupId, // The main responsible group
        dueDate: analysisDueDate.toISOString(),
        status: 'Pendiente',
    });
    
    // You could add logic here to check `actionTypeConfig` for special steps
    // For example:
    // if (actionTypeConfig?.requiresImpactAnalysis) { ... }

    steps.push({
        stepName: 'Verificació d\'Implantació',
        // The responsible party for verification might be different. 
        // This could be configured in the actionType as well.
        responsibleParty: action.responsibleGroupId, 
        dueDate: implementationDueDate.toISOString(),
        status: 'Pendiente',
    });

    steps.push({
        stepName: 'Tancament de l\'Acció',
        responsibleParty: action.creator.email || action.creator.id, // Often the creator closes the action
        dueDate: closureDueDate.toISOString(),
        status: 'Pendiente',
    });


    return {
        workflowId: `WF-${action.actionId}-${Date.now()}`,
        actionId: action.actionId,
        steps: steps,
    };
}

    
