
'use server';
/**
 * @fileOverview A flow to retrieve the Google Groups for a given user email.
 * 
 * This flow uses the Google Admin SDK to connect to the Google Workspace API. 
 * It requires Application Default Credentials (ADC) to be configured in the environment,
 * and it impersonates a G Suite admin user to perform the necessary actions.
 * 
 * Make sure the following environment variables are set:
 * - GSUITE_ADMIN_EMAIL: The email of the G Suite admin to impersonate.
 * 
 * - getUserGroups - A function that returns the groups for a user.
 * - GetUserGroupsInput - The input type for the getUserGroups function (user email).
 * - GetUserGroupsOutput - The return type for the getUserGroups function (array of groups).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import type { UserGroup } from '@/lib/types';

// The input is the user's email address
const GetUserGroupsInputSchema = z.string().email().describe("The email address of the user.");
export type GetUserGroupsInput = z.infer<typeof GetUserGroupsInputSchema>;

const UserGroupSchema = z.object({
  id: z.string().describe("The group's primary email address or unique ID."),
  name: z.string().describe("The display name of the group."),
  description: z.string().optional().describe("A brief description of the group."),
});

const GetUserGroupsOutputSchema = z.array(UserGroupSchema);
export type GetUserGroupsOutput = z.infer<typeof GetUserGroupsOutputSchema>;

// This is the main function that the frontend will call.
export async function getUserGroups(userEmail: GetUserGroupsInput): Promise<GetUserGroupsOutput> {
  return getUserGroupsFlow(userEmail);
}

const getUserGroupsFlow = ai.defineFlow(
  {
    name: 'getUserGroupsFlow',
    inputSchema: GetUserGroupsInputSchema,
    outputSchema: GetUserGroupsOutputSchema,
  },
  async (userEmail) => {
    const adminEmail = process.env.GSUITE_ADMIN_EMAIL;
    if (!adminEmail) {
        throw new Error("La variable d'entorn GSUITE_ADMIN_EMAIL no està configurada. És necessari per a la suplantació de l'usuari administrador.");
    }
    
    console.log(`[getUserGroupsFlow] Starting to fetch groups for: ${userEmail} by impersonating ${adminEmail}`);

    try {
        // 1. Authenticate and create a client
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/admin.directory.group.readonly'],
            // Impersonate the G Suite admin user
            clientOptions: {
              subject: adminEmail
            }
        });

        const authClient = await auth.getClient();
        
        // 2. Create the Admin SDK client
        const admin = google.admin({
            version: 'directory_v1',
            auth: authClient,
        });

        // 3. List the groups for the specified user
        const response = await admin.groups.list({
            userKey: userEmail,
            maxResults: 200, // Maximum allowed by the API
        });
        
        const groups = response.data.groups;

        if (!groups || groups.length === 0) {
            console.log(`[getUserGroupsFlow] No groups found for user ${userEmail}.`);
            return [];
        }

        console.log(`[getUserGroupsFlow] Found ${groups.length} groups for ${userEmail}.`);

        // 4. Map the results to our defined output schema
        return groups.map(g => ({
            id: g.email || g.id!,
            name: g.name || '',
            description: g.description || undefined,
        }));
        
    } catch (error: any) {
        console.error(`[getUserGroupsFlow] Error fetching groups from Google Admin SDK:`, error.message);
        if (error.code === 403) {
             throw new Error("Accés denegat a l'API de Google Admin. Assegura't que la Compte de Servei té els permisos de 'Domain-Wide Delegation' correctes a Google Workspace i que l'API d'Admin SDK està habilitada.");
        } else if (error.code === 404) {
            throw new Error(`L'usuari '${userEmail}' o el domini no s'ha trobat a Google Workspace.`);
        }
        throw new Error("S'ha produït un error inesperat en connectar amb l'API de Google Workspace.");
    }
  }
);
