
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
    const promptTemplate = await getPrompt('improveWriting');

    if (!promptTemplate) {
      throw new Error("The 'improveWriting' prompt is not configured in the settings.");
    }
    
    // Manually construct the full prompt for debugging by replacing the placeholder
    const fullPromptForDebug = promptTemplate.replace('{{{text}}}', input.text);
    let debugInfo = `PROMPT CONSTRUÏT ENVIAT A LA IA:\n---------------------------------\n${fullPromptForDebug}\n\n`;

    // Define the prompt dynamically, letting Genkit handle the variable substitution.
    const improveWritingPrompt = ai.definePrompt({
        name: 'improveWritingPrompt',
        input: { schema: ImproveWritingInputSchema },
        // The AI is asked to return a JSON with a 'description' field in the prompt.
        // Let's align the output schema to expect that.
        output: { schema: z.object({ description: z.string() }) },
        prompt: promptTemplate, // Use the template directly, Genkit will substitute {{{text}}}
    });
    
    let improvedText = '';

    try {
        console.log("[improveWritingFlow] Input to AI:", input);
        const { output } = await improveWritingPrompt(input);
        
        // The output is now an object, e.g., { description: "..." }
        improvedText = output?.description ?? '';
        debugInfo += `RESPOSTA CRUA REBUDA DE LA IA:\n---------------------------------\n${JSON.stringify(output, null, 2)}`;
        console.log("[improveWritingFlow] Output from AI:", output);
        
        return { improvedText, debugInfo };

    } catch (error: any) {
        console.error("[improveWritingFlow] Error executing improveWritingPrompt:", error);
        debugInfo += `ERROR REBUT DE LA IA:\n---------------------\n${error.message || 'Unknown error'}`;
        
        // Return an empty string if the prompt execution fails for any reason
        return { improvedText: '', debugInfo };
    }
  }
);
