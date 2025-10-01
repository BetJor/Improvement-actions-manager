
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

// The output is now an object containing the improved text and debug info.
const ImproveWritingOutputSchema = z.object({
    improvedText: z.string().describe("The improved and detailed description of the non-conformity."),
    debugInfo: z.string().describe("Debugging information about the AI call.")
});
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

    // Define the prompt dynamically to output just a string
    const improveWritingPrompt = ai.definePrompt({
        name: 'improveWritingPrompt',
        input: { schema: ImproveWritingInputSchema },
        output: { schema: z.string() }, // The AI model should return a simple string
        prompt: `${promptText}\n\nText a millorar:\n{{{text}}}`,
    });
    
    let debugInfo = `Input to AI: "${input.text}"\n`;
    let improvedText = '';

    try {
        console.log("[improveWritingFlow] Input to AI:", input);
        const { output } = await improveWritingPrompt(input);
        
        improvedText = output ?? '';
        debugInfo += `Raw Output from AI: "${output}"\nFinal Text: "${improvedText}"`;
        console.log("[improveWritingFlow] Output from AI:", output);
        
        return { improvedText, debugInfo };

    } catch (error: any) {
        console.error("[improveWritingFlow] Error executing improveWritingPrompt:", error);
        debugInfo += `Error: ${error.message || 'Unknown error'}`;
        
        // Return an empty string if the prompt execution fails for any reason
        return { improvedText: '', debugInfo };
    }
  }
);
