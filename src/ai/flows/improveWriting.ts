
'use server';
/**
 * @fileOverview A flow to improve the writing of a given text.
 * 
 * - improveWriting - The main function to call to get the improved text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImproveWritingInputSchema = z.object({
  text: z.string().describe("The text to be improved."),
});
export type ImproveWritingInput = z.infer<typeof ImproveWritingInputSchema>;

const ImproveWritingOutputSchema = z.object({
  improvedText: z.string().describe("The improved text."),
});
export type ImproveWritingOutput = z.infer<typeof ImproveWritingOutputSchema>;

export async function improveWriting(input: ImproveWritingInput): Promise<ImproveWritingOutput> {
  return improveWritingFlow(input);
}

const improveWritingPrompt = ai.definePrompt({
    name: 'improveWritingPrompt',
    input: { schema: ImproveWritingInputSchema },
    output: { schema: ImproveWritingOutputSchema },
    prompt: `
        You are an expert in quality management systems. Your task is to convert the following text into a formal non-conformity description.
        The description should be clear, concise, and professional, suitable for a formal report.
        Correct any grammatical errors and improve clarity, but maintain the core meaning of the original text.
        The response MUST be in the same language as the original text.
        Respond ONLY with the improved text in the 'improvedText' field of the JSON output.

        Original text to convert:
        "{{text}}"
    `,
});


const improveWritingFlow = ai.defineFlow(
  {
    name: 'improveWritingFlow',
    inputSchema: ImproveWritingInputSchema,
    outputSchema: ImproveWritingOutputSchema,
  },
  async (input) => {
    const { output } = await improveWritingPrompt(input);
    return output!;
  }
);
