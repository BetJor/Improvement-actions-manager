
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db as clientDb } from '@/lib/firebase';
import { z } from 'zod';
import type { SentEmailInfo } from "@/lib/types";

// This file is for CLIENT-SIDE execution only, specifically for dry runs.

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
    const docRef = doc(clientDb, 'app_settings', 'due_date_reminders');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return DueDateSettingsSchema.parse(docSnap.data());
    }
    return { daysUntilDue: 10 }; // Default
}

export async function updateDueDateSettings(settings: DueDateSettings): Promise<void> {
    const docRef = doc(clientDb, 'app_settings', 'due_date_reminders');
    await setDoc(docRef, settings, { merge: true });
}

// Main logic
export async function checkDueDates(input: z.infer<typeof CheckDueDatesInputSchema>): Promise<z.infer<typeof CheckDueDatesOutputSchema>> {
    console.warn("checkDueDates is being called from the client. This is for dry-run purposes only and does not reflect a real execution.");
    
    // On the client, we cannot safely import and run the full server-side logic
    // without causing dependency issues. This function on the client-side
    // is now primarily for displaying UI and triggering the *actual* logic which
    // runs scheduled on the server.
    // We will return a simulated message.
    
    return { 
        checkedActions: 0, 
        sentEmails: [], 
        errors: ["La ejecución real solo ocurre en el servidor programado. Este es un resultado de simulación desde el cliente."] 
    };
}
