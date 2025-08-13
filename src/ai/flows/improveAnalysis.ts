
'use server';
/**
 * @fileOverview A flow to suggest a cause analysis and corrective actions
 * based on the initial observations of an improvement action.
 * 
 * - suggestAnalysisAndActions - The main function to call to get the suggestion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getPrompt } from '@/services/ai-service';

const SuggestAnalysisInputSchema = z.object({
  observations: z.string().describe("The initial observations of the improvement action."),
});
export type SuggestAnalysisInput = z.infer<typeof SuggestAnalysisInputSchema>;

const SuggestAnalysisOutputSchema = z.object({
  causesAnalysis: z.string().describe("The detailed analysis of the root causes of the problem."),
  proposedActions: z.array(
    z.object({
      description: z.string().describe("A specific, actionable training or corrective action to address the causes."),
    })
  ).describe("A list of proposed corrective actions."),
});
export type SuggestAnalysisOutput = z.infer<typeof SuggestAnalysisOutputSchema>;


export async function suggestAnalysisAndActions(input: SuggestAnalysisInput): Promise<SuggestAnalysisOutput> {
  const suggestion = await suggestAnalysisAndActionsFlow(input);
  return suggestion;
}

const suggestAnalysisAndActionsFlow = ai.defineFlow(
  {
    name: 'suggestAnalysisAndActionsFlow',
    inputSchema: SuggestAnalysisInputSchema,
    outputSchema: SuggestAnalysisOutputSchema,
  },
  async (input) => {
    const promptText = await getPrompt('analysisSuggestion');

    if (!promptText) {
      throw new Error("The 'analysisSuggestion' prompt is not configured in the settings.");
    }

    const analysisPrompt = ai.definePrompt({
        name: 'analysisSuggestionPrompt',
        input: { schema: SuggestAnalysisInputSchema },
        output: { schema: SuggestAnalysisOutputSchema },
        prompt: `${promptText}\n\nObservacions del problema a analitzar:\n{{{observations}}}`,
    });
    
    const { output } = await analysisPrompt(input);
    return output!;
  }
);
