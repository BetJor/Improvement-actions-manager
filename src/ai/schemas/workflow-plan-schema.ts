
import { z } from 'genkit';

// Define the schema for a single workflow step
const WorkflowStepSchema = z.object({
  stepName: z.string().describe("The name of this workflow step (e.g., 'Análisis de Causas', 'Verificación de Eficacia')."),
  responsibleParty: z.string().describe("The group or role responsible for completing this step (e.g., 'Gestió de Qualitat', 'Comitè de Seguretat')."),
  dueDate: z.string().describe("The calculated due date for this step in dd/MM/yyyy format."),
  status: z.string().default('Pendiente').describe("The initial status of this step."),
});

// Define the input schema for the flow
export const PlanActionWorkflowInputSchema = z.object({
  actionId: z.string(),
  actionType: z.string().describe("The type of the improvement action (e.g., 'No Conformitat', 'Reclamació de Client')."),
  category: z.string().describe("The category of the action (e.g., 'Seguretat i Salut Laboral')."),
  responsibleGroupId: z.string().describe("The primary responsible group ID for the action."),
  creationDate: z.string().describe("The creation date of the action in dd/MM/yyyy format."),
});
export type PlanActionWorkflowInput = z.infer<typeof PlanActionWorkflowInputSchema>;

// Define the output schema for the flow
export const PlanActionWorkflowOutputSchema = z.object({
  workflowId: z.string().describe("A unique identifier for this specific workflow plan."),
  actionId: z.string(),
  steps: z.array(WorkflowStepSchema).describe("An array of all the steps required for this action's workflow."),
});
export type PlanActionWorkflowOutput = z.infer<typeof PlanActionWorkflowOutputSchema>;
