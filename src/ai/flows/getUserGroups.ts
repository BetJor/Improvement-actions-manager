
'use server';
/**
 * @fileOverview A flow to retrieve the Google Groups for a given user email.
 * 
 * This flow uses the Google Admin SDK to connect to the Google Workspace API. 
 * It requires a service account JSON key to be configured to perform the necessary actions.
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

// Service Account Credentials
const JSONKey = {
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDApP5LL57PtJWN\nWTpVbQjjNP0I7rBMsmPiEDbccXwGuSpRvhEHFza6iZAVyKqD9E9fW4TzxwEg3qnv\nQj4RdaPj/ySEpiqq6xc/msbMU4kZW0uFln2xiy/K8e4izw6JTsaa7Jvr1j+XqZtY\ngp5oczxFeKwnIHsP5QLTZ7eLcv7bpASyiN6Eu0sC6S64BdIf+WnBlKr/tOQYqC3v\nz0IegAhdXsEk88Pnf0sdj89CyEwWDYMEah8+SamHhCe2j+ycRRCs8hfsXaawSfJd\nX9rhkWNdFR0ib0RqWrIWRhoObMGLbkXfb7DX1OZgzbjY6U6+2gFAmoBFhKVQ5GFe\nNCninooDAgMBAAECggEAS53X9TI1f6kOFOQDyjlYxjpr4iAy0oApRbiAmEnxWYBA\nFMLq0yIxCMprZKmWCOKSb0cwqjGgh0LvaCtTyq2nDZz+PBUvZVSPFRfPVa+qfmn/\n/GlEYDbWpS4Of9pPheUGfxRF5a382y6ne/gVbsFg1JIX3OnadDQ7xjiNaq7SS+rn\nZ/3XpbXcGPUC9eq1HFpOiH2IKgtLgzogU2o23ZvttqabdgvYsZysTIWTUy+dMTC1\nWia8OD5MUkkPnf2/yTdLCeV7mYPAwo8HLLZajOGsqTcU6sxhrKRlU1exO5Rao1YA\nbT65eXseiJgGj1h0YZvKFzPbo9uerRl3adxYV8u/mQKBgQD8fnF3nbyBLjNtnpi6\nUuOM7SANa0xBvi88yWfTRcaQ6ljromnDERNlc8JYVEj9a8gyUEMcdEwWIOUu5/Y2\ntXbrlmhRVa0gupSQi+Y0j3SJH0ixdrLnqESFAxRyuoWfXeHsQWFrSLCLJ0a1lAPg\nugDugNuKP+CTX1pgntl7sorDuQKBgQDDUcyouMFMovc/IdGS85vfPX553h2dDIpA\nlVL+nTnUQI9b7Lg4mg+01C7IZx3F2PMibh9BQWUIMSmCVnDuXMLEhVG36PiKUMSO\nVFLUsqalnlES+ncFFE5aasXaJdseqHvlv5nhbJByDnnmZptsIzBNUbn8nigVLjo9\nnkCrfVDRmwKBgQCwWmhKEaPt3iURdWpbCTXh4mU2ujCi4oD/xfR8fgm4gdXljqSs\nGCsh+v5Mz2HDjxpe+exF3XyfIA6y+lTf1VLgLUdjN6Iab/cAFpaNM31DoNQXDz7Z\nyo9BD+uiTmCx9NKtPuUaF8UnDCG5BU7IEWJBM0MjhoYGqNzpC0n/ua5uEQKBgFWq\nYuD9Z4p9T4PZCVoyjoLzLa21xbdD8L8yvxv9SYfWaQogYQwyRgFBruMmluBXrwvC\n0OKGFBHrvhD0aMOi26nl71mCTMAdfJgQU+QGFyE8tsJkKB+KMHNnsS9kux5PN0gl\nKRC91PyxbLWo+zIKnPzMg45Qr7PaeqDb7/FHHVNRAoGBAN7PnVKSHabDW+drqx+O\n3cE2kMApK3uSr9RYm3aAM/8MY35YgSP7YQNl3ykITJK25nf0H7wNEGgUymirQG5+\nk3iu3QtfjcZNVAFZH5xepZz6PcF98RSu53a5qAdGdcssXE6RoOWai+8QUhLM1M3d\nQW9F2F+x78Oy2yJxM8ultNoJ\n-----END PRIVATE KEY-----\n",
  "client_email": "gam-project-a4x-ksa-k4w@gam-project-a4x-ksa-k4w.iam.gserviceaccount.com",
};


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
        // 1. Authenticate using the provided Service Account JSON key
        const jwtClient = new google.auth.JWT(
            JSONKey.client_email,
            undefined,
            JSONKey.private_key.replace(/\\n/g, '\n'), // Ensure newlines are correctly formatted
            ['https://www.googleapis.com/auth/admin.directory.group.readonly'],
            adminEmail // User to impersonate
        );

        await jwtClient.authorize();
        
        // 2. Create the Admin SDK client
        const admin = google.admin({
            version: 'directory_v1',
            auth: jwtClient,
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
             throw new Error("Accés denegat a l'API de Google Admin. Assegura't que el compte de servei té els permisos de 'Domain-Wide Delegation' correctes a Google Workspace i que l'API d'Admin SDK està habilitada.");
        } else if (error.code === 404) {
            throw new Error(`L'usuari '${userEmail}' o el domini no s'ha trobat a Google Workspace.`);
        }
        throw new Error("S'ha produït un error inesperat en connectar amb l'API de Google Workspace.");
    }
  }
);

    