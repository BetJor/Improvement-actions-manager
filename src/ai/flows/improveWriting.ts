
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
  title: z.string().describe("The suggested title for the non-conformity."),
  description: z.string().describe("The improved and detailed description of the non-conformity."),
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
      You are an expert in quality management systems. Your task is to convert the following text into a formal non-conformity description suitable for a formal report.

      The response should be structured, detailed, and professional. It must include:
      1.  A concise and descriptive title for the non-conformity.
      2.  A clear description of the finding.
      3.  An analysis of the potential risks and consequences (e.g., safety, compliance, etc.).
      4.  A mention of the immediate corrective action required or suggested.

      The response MUST be in the same language as the original text.
      
      Respond ONLY with the generated title in the 'title' field and the full detailed description in the 'description' field of the JSON output.

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
