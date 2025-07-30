
'use server';
/**
 * @fileOverview A flow to improve the writing of a given text.
 * 
 * - improveWriting - The main function to call to get the improved text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImproveWritingInputSchema = z.string().describe("The text to be improved.");
export type ImproveWritingInput = z.infer<typeof ImproveWritingInputSchema>;

const ImproveWritingOutputSchema = z.string().describe("The improved text.");
export type ImproveWritingOutput = z.infer<typeof ImproveWritingOutputSchema>;

export async function improveWriting(input: ImproveWritingInput): Promise<ImproveWritingOutput> {
  return improveWritingFlow(input);
}

const improveWritingPrompt = ai.definePrompt({
    name: 'improveWritingPrompt',
    input: { schema: ImproveWritingInputSchema },
    output: { schema: ImproveWritingOutputSchema },
    prompt: `
        You are a professional writing assistant. Your task is to improve the following text.
        Correct any grammatical errors, improve clarity, and ensure a professional tone.
        Maintain the original meaning of the text.
        Respond ONLY with the improved text, without any additional comments or introductions.

        Text to improve:
        "{{prompt}}"
    `,
});


const improveWritingFlow = ai.defineFlow(
  {
    name: 'improveWritingFlow',
    inputSchema: ImproveWritingInputSchema,
    outputSchema: ImproveWritingOutputSchema,
  },
  async (prompt) => {
    // Pass the raw string prompt directly.
    // The prompt template will receive it as the `prompt` variable.
    const { output } = await improveWritingPrompt(prompt);
    return output!;
  }
);
