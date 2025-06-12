// Summarize Project Progress Flow
'use server';

/**
 * @fileOverview Summarizes project progress for a property based on updates and file uploads.
 *
 * - summarizeProjectProgress - A function that generates a concise progress summary.
 * - SummarizeProjectProgressInput - The input type for the summarizeProjectProgress function.
 * - SummarizeProjectProgressOutput - The return type for the summarizeProjectProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeProjectProgressInputSchema = z.object({
  updates: z
    .string()
    .describe('Project updates, including descriptions of recent activities.'),
  fileUploads: z
    .string()
    .describe('Information extracted from uploaded files related to the project.'),
});
export type SummarizeProjectProgressInput = z.infer<
  typeof SummarizeProjectProgressInputSchema
>;

const SummarizeProjectProgressOutputSchema = z.object({
  progress: z
    .string()
    .describe(
      'A concise, one-sentence summary of the project progress based on updates and file uploads.'
    ),
});
export type SummarizeProjectProgressOutput = z.infer<
  typeof SummarizeProjectProgressOutputSchema
>;

export async function summarizeProjectProgress(
  input: SummarizeProjectProgressInput
): Promise<SummarizeProjectProgressOutput> {
  return summarizeProjectProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProjectProgressPrompt',
  input: {schema: SummarizeProjectProgressInputSchema},
  output: {schema: SummarizeProjectProgressOutputSchema},
  prompt: `You are a project manager tasked with summarizing project progress for a property.

  Based on the provided updates and file uploads, create a concise one-sentence summary of the project's current status.

  Updates: {{{updates}}}
  File Uploads: {{{fileUploads}}}

  Progress Summary:`, // Ensure the AI provides only a one-sentence summary
});

const summarizeProjectProgressFlow = ai.defineFlow(
  {
    name: 'summarizeProjectProgressFlow',
    inputSchema: SummarizeProjectProgressInputSchema,
    outputSchema: SummarizeProjectProgressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
