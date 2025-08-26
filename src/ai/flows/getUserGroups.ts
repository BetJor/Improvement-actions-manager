
'use server';
/**
 * @fileOverview A flow to retrieve the Google Groups for a given user email.
 * 
 * This flow uses the Google Admin SDK to fetch the actual groups from Google Workspace.
 * It requires Application Default Credentials (ADC) to be configured for the environment
 * and a GSuite admin email for impersonation.
 * 
 * - getUserGroups - A function that returns the groups for a user.
 * - GetUserGroupsInput - The input type for the getUserGroups function (user email).
 * - GetUserGroupsOutput - The return type for the getUserGroups function (array of groups).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import type { UserGroup } from '@/lib/types';
import { getUserById } from '@/lib/data';

// The input is now the user's email address
const GetUserGroupsInputSchema = z.string().email().describe("The email address of the user.");
export type GetUserGroupsInput = z.infer<typeof GetUserGroupsInputSchema>;

const UserGroupSchema = z.object({
  id: z.string().describe("The group's primary email address or unique ID."),
  name: z.string().describe("The display name of the group."),
  description: z.string().optional().describe("A brief description of the group."),
  // userIds are not directly available in the group list response, so we remove it.
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
    console.log(`[getUserGroupsFlow] Starting to fetch groups for: ${userEmail}`);
    
    const adminEmail = process.env.GSUITE_ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error("GSUITE_ADMIN_EMAIL environment variable is not set. Please provide a GSuite admin email to impersonate.");
    }
    
    try {
      // Authenticate using Application Default Credentials
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/admin.directory.group.readonly'],
        subject: adminEmail, // Impersonate the admin user
      });
      
      const authClient = await auth.getClient();
      const admin = google.admin({ version: 'directory_v1', auth: authClient });

      console.log(`[getUserGroupsFlow] Authenticated successfully. Fetching groups for userKey: ${userEmail}`);
      
      const response = await admin.groups.list({
        userKey: userEmail,
      });

      const groups = response.data.groups || [];
      
      console.log(`[getUserGroupsFlow] Found ${groups.length} groups for ${userEmail}`);

      return groups.map(g => ({
        id: g.email || g.id || '',
        name: g.name || '',
        description: g.description || undefined,
      })).filter(g => g.id); // Filter out any groups that might not have an email or id

    } catch (error: any) {
      console.error(`[getUserGroupsFlow] Error fetching Google Groups for ${userEmail}:`, error.message);
      
      // Provide more specific error messages
      if (error.code === 403) {
          throw new Error(`Permission denied. Check if the service account has domain-wide delegation and the correct API scopes in Google Workspace Admin Console. The impersonated admin might also lack permissions.`);
      }
      if (error.code === 404) {
          throw new Error(`User or group resource not found. Ensure the user email '${userEmail}' and the admin email '${adminEmail}' are correct.`);
      }

      throw new Error(`An unexpected error occurred while fetching Google Groups: ${error.message}`);
    }
  }
);
