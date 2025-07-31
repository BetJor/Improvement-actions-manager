
'use server';
/**
 * @fileOverview A flow to improve the writing of a given text.
 * 
 * - improveWriting - The main function to call to get the improved text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getPrompt } from '@/lib/data';

const ImproveWritingInputSchema = z.object({
  text: z.string().describe("The text to be improved."),
});
export type ImproveWritingInput = z.infer<typeof ImproveWritingInputSchema>;

// The output is now a simple string with the improved description.
const ImproveWritingOutputSchema = z.string().describe("The improved and detailed description of the non-conformity.");
export type ImproveWritingOutput = z.infer<typeof ImproveWritingOutputSchema>;

export async function improveWriting(input: ImproveWritingInput): Promise<ImproveWritingOutput> {
  const result = await improveWritingFlow(input);
  return result;
}

const improveWritingFlow = ai.defineFlow(
  {
    name: 'improveWritingFlow',
    inputSchema: ImproveWritingInputSchema,
    outputSchema: ImproveWritingOutputSchema,
  },
  async (input) => {
    // Get the dynamic prompt from Firestore
    const promptText = await getPrompt('improveWriting');

    if (!promptText) {
      throw new Error("The 'improveWriting' prompt is not configured in the settings.");
    }

    // Define the prompt dynamically
    const improveWritingPrompt = ai.definePrompt({
        name: 'improveWritingPrompt',
        input: { schema: ImproveWritingInputSchema },
        output: { schema: ImproveWritingOutputSchema },
        prompt: `${promptText}\n\nText a millorar:\n{{{text}}}`,
    });
    
    const { output } = await improveWritingPrompt(input);
    return output!;
  }
);
