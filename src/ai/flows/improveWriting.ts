
'use server';
/**
 * @fileOverview A flow to improve the writing of a given text.
 * 
 * - improveWriting - The main function to call to get the improved text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getPrompt } from '@/services/ai-service';

const ImproveWritingInputSchema = z.object({
  text: z.string().describe("The text to be improved."),
});
export type ImproveWritingInput = z.infer<typeof ImproveWritingInputSchema>;

// The output is just the improved text string.
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
    const promptTemplate = await getPrompt('improveWriting');

    if (!promptTemplate) {
      throw new Error("The 'improveWriting' prompt is not configured in the settings.");
    }

    // Define the prompt dynamically, letting Genkit handle the variable substitution.
    const improveWritingPrompt = ai.definePrompt({
        name: 'improveWritingPrompt',
        input: { schema: ImproveWritingInputSchema },
        // The AI is asked to return a JSON with a 'description' field in the prompt.
        // Let's align the output schema to expect that.
        output: { schema: z.object({ description: z.string() }) },
        prompt: promptTemplate, // Use the template directly, Genkit will substitute {{{text}}}
    });
    
    try {
        console.log("[improveWritingFlow] Input to AI:", input);
        const { output } = await improveWritingPrompt(input);
        console.log("[improveWritingFlow] Output from AI:", output);
        
        // Return the description field from the output object, or an empty string if it fails
        return output?.description ?? '';

    } catch (error: any) {
        console.error("[improveWritingFlow] Error executing improveWritingPrompt:", error);
        
        // Return an empty string if the prompt execution fails for any reason
        return '';
    }
  }
);
