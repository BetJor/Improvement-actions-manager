
'use server';
/**
 * @fileOverview A flow to determine the specific workflow plan for an improvement action.
 * 
 * This flow uses an AI prompt to decide the necessary steps, responsible parties, and deadlines
 * for a given improvement action based on its type, category, and other details.
 * 
 * - planActionWorkflow - The main function to call to get the workflow plan.
 */

import { ai } from '@/ai/genkit';
import { 
    PlanActionWorkflowInputSchema, 
    PlanActionWorkflowOutputSchema, 
    type PlanActionWorkflowInput, 
    type PlanActionWorkflowOutput 
} from '@/ai/schemas/workflow-plan-schema';


// This is the main function the application will call.
export async function planActionWorkflow(input: PlanActionWorkflowInput): Promise<PlanActionWorkflowOutput> {
  return planActionWorkflowFlow(input);
}


const plannerPrompt = ai.definePrompt({
    name: 'actionWorkflowPlannerPrompt',
    input: { schema: PlanActionWorkflowInputSchema },
    output: { schema: PlanActionWorkflowOutputSchema },
    prompt: `
        You are an expert workflow planner for a quality management system. 
        Your task is to create a specific, step-by-step workflow plan for an improvement action based on the provided data.

        **Workflow Rules:**

        1.  **Standard Workflow:** All actions, by default, have the following steps:
            - Análisis de Causas: Due 30 days after creation.
            - Plan de Acción: Due 45 days after creation.
            - Verificación de Implantación: Due 75 days after creation.
            - Cierre de la Acción: Due 90 days after creation.
            The responsible party for all these steps is the 'responsibleGroupId' from the input.

        2.  **Regulatory/Client Complaint Workflow:** 
            - If the action Type is 'No Conformitat', 'Reclamació de Client', or 'Auditoria Externa', an additional initial step is required.
            - **Step Name:** 'Análisis de Impacto Regulatorio'.
            - **Responsible Party:** 'comite-riscos@example.com'.
            - **Due Date:** 7 days after the creation date.
            - All other standard steps are pushed back by 15 days from their original due dates.

        3.  **Safety Workflow:**
            - If the action Category is 'Seguretat i Salut Laboral', an additional verification step is required at the end.
            - **Step Name:** 'Verificación de Seguridad por Comité'.
            - **Responsible Party:** 'comite-seguretat@example.com'.
            - **Due Date:** 30 days after the 'Cierre de la Acción' step.
        
        **Instructions:**

        - Today's date is {{currentDate}}. The action was created on {{creationDate}}.
        - The ID for the action is {{actionId}}.
        - The primary responsible group is {{responsibleGroupId}}. The affected area is {{affectedAreaName}}.
        - Based on the rules above, generate a complete, ordered list of all required workflow steps.
        - Calculate all due dates accurately based on the creation date.
        - Generate a unique ID for this workflow plan, maybe combining the actionId and a timestamp.
        - Return the result in the specified JSON format.

        **Action Details:**
        - Type: {{actionType}}
        - Category: {{category}}
    `,
});


const planActionWorkflowFlow = ai.defineFlow(
    {
      name: 'planActionWorkflowFlow',
      inputSchema: PlanActionWorkflowInputSchema,
      outputSchema: PlanActionWorkflowOutputSchema,
    },
    async (input) => {

      // Pass the current date to the prompt context for accurate calculations
      const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      const { output } = await plannerPrompt({
        ...input,
        currentDate: currentDate,
      });

      return output!;
    }
);
