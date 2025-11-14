
'use server';

import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';
import type { ImprovementAction, SentEmailInfo } from "../lib/types";


// Schemas and Types
const DueDateSettingsSchema = z.object({
  daysUntilDue: z.number().int().positive().default(10),
});
export type DueDateSettings = z.infer<typeof DueDateSettingsSchema>;

const CheckDueDatesInputSchema = z.object({
    actions: z.array(z.any()).describe("The list of actions to process."),
    isDryRun: z.boolean().optional().default(true).describe("If true, it will not write to the database."),
});

const CheckDueDatesOutputSchema = z.object({
  checkedActions: z.number(),
  sentEmails: z.array(z.custom<SentEmailInfo>()),
  errors: z.array(z.string()),
});

// Helper flows
export async function getDueDateSettings(): Promise<DueDateSettings> {
    const docRef = doc(db, 'app_settings', 'due_date_reminders');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return DueDateSettingsSchema.parse(docSnap.data());
    }
    return { daysUntilDue: 10 }; // Default
}

export async function updateDueDateSettings(settings: DueDateSettings): Promise<void> {
    const docRef = doc(db, 'app_settings', 'due_date_reminders');
    await setDoc(docRef, settings, { merge: true });
}

// Main logic - This will now be a wrapper around the Genkit flow for the client
export async function checkDueDates(input: z.infer<typeof CheckDueDatesInputSchema>): Promise<z.infer<typeof CheckDueDatesOutputSchema>> {
    
    // This is a placeholder as the real logic is moved to the Cloud Function.
    // The UI calls this, but we'll simulate a dry run.
    console.warn("checkDueDates is being called from the client. This should be for dry-run purposes only.");

    const { checkDueDates: checkDueDatesFlow } = await import('@/ai/flows/checkDueDates');
    
    const result = await checkDueDatesFlow({
        actions: input.actions,
        isDryRun: true // Always force dry-run from client-side call
    });

    return result;
}
