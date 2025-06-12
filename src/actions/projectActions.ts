'use server';

import { summarizeProjectProgress, type SummarizeProjectProgressInput } from '@/ai/flows/summarize-project-progress';
import type { ProjectUpdate, ProjectFile } from '@/types';

export async function generateProgressSummaryAction(
  projectUpdates: ProjectUpdate[],
  projectFiles: ProjectFile[]
): Promise<{ summary?: string; error?: string }> {
  try {
    const updatesText = projectUpdates.map(u => u.text).join(' ');
    const filesText = projectFiles.map(f => `File: ${f.name} (type: ${f.type}${f.size ? `, size: ${f.size}`: ''})`).join('; ');

    const input: SummarizeProjectProgressInput = {
      updates: updatesText.length > 0 ? updatesText : "No textual updates provided.",
      fileUploads: filesText.length > 0 ? filesText : "No files uploaded.",
    };
    
    const result = await summarizeProjectProgress(input);
    return { summary: result.progress };
  } catch (error) {
    console.error("Error generating progress summary:", error);
    return { error: "Failed to generate summary. Please try again." };
  }
}
