
'use server';
/**
 * @fileOverview A flow to improve the writing of the causes analysis.
 * 
 * - improveAnalysis - The main function to call to get the improved text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getPrompt } from '@/lib/data';

const ImproveAnalysisInputSchema = z.object({
  text: z.string().describe("The analysis text to be improved."),
});
export type ImproveAnalysisInput = z.infer<typeof ImproveAnalysisInputSchema>;

const ImproveAnalysisOutputSchema = z.string().describe("The improved and detailed analysis text.");
export type ImproveAnalysisOutput = z.infer<typeof ImproveAnalysisOutputSchema>;

export async function improveAnalysis(input: ImproveAnalysisInput): Promise<ImproveAnalysisOutput> {
  const improvedText = await improveAnalysisFlow(input);
  return improvedText;
}

const improveAnalysisFlow = ai.defineFlow(
  {
    name: 'improveAnalysisFlow',
    inputSchema: ImproveAnalysisInputSchema,
    outputSchema: ImproveAnalysisOutputSchema,
  },
  async (input) => {
    // Get the dynamic prompt from Firestore
    const promptText = await getPrompt('analysis');

    if (!promptText) {
      throw new Error("The 'analysis' prompt is not configured in the settings.");
    }

    // Define the prompt dynamically
    const improveAnalysisPrompt = ai.definePrompt({
        name: 'improveAnalysisPrompt',
        input: { schema: ImproveAnalysisInputSchema },
        prompt: `${promptText}\n\nText a millorar:\n{{{text}}}`,
    });
    
    const { output } = await improveAnalysisPrompt(input);
    return output!;
  }
);
