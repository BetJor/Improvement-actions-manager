
import { collection, getDocs, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, addDays, parseISO } from 'date-fns';
import type { ImprovementAction, WorkflowPlan, WorkflowStep, ImprovementActionType } from '@/lib/types';
import { getActionTypes } from './master-data-service';

/**
 * Generates a traditional, rule-based workflow plan for an improvement action.
 * @param action - The improvement action data.
 * @returns A promise that resolves to the generated WorkflowPlan.
 */
export async function planTraditionalActionWorkflow(action: Omit<ImprovementAction, 'id'>): Promise<WorkflowPlan> {

    // Fetch all action types to find the one that matches our action.
    const actionTypes = await getActionTypes();
    const actionTypeConfig = actionTypes.find(at => at.id === action.typeId);

    const steps: WorkflowStep[] = [];
    const creationDate = parseISO(action.creationDate);

    // These are simplified rules. You can make them as complex as you need
    // by reading more configuration from Firestore.
    // For now, we'll use a standard set of due dates.
    const analysisDueDate = addDays(creationDate, 30);
    const implementationDueDate = addDays(creationDate, 75);
    const closureDueDate = addDays(creationDate, 90);

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
