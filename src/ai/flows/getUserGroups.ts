
'use server';
/**
 * @fileOverview A flow to retrieve the Google Groups for a given user email.
 * 
 * This flow uses mock data for demonstration purposes. To connect to the real
 * Google Workspace API, you would need to install 'googleapis', configure
 * Application Default Credentials (ADC), and use the Google Admin SDK.
 * 
 * - getUserGroups - A function that returns the groups for a user.
 * - GetUserGroupsInput - The input type for the getUserGroups function (user email).
 * - GetUserGroupsOutput - The return type for the getUserGroups function (array of groups).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { UserGroup } from '@/lib/types';
import { groups, users } from '@/lib/static-data'; // Using mock data

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
    console.log(`[getUserGroupsFlow] Starting to fetch mock groups for: ${userEmail}`);
    
    // Find the user ID from the mock users data based on the email
    const user = users.find(u => u.email === userEmail);
    if (!user) {
        console.warn(`[getUserGroupsFlow] User with email ${userEmail} not found in mock data.`);
        return [];
    }

    // Find groups that contain the user's ID in their userIds array
    const userGroups = groups.filter(g => g.userIds.includes(user.id));
    
    console.log(`[getUserGroupsFlow] Found ${userGroups.length} mock groups for ${userEmail}`);

    return userGroups.map(g => ({
        id: g.id,
        name: g.name,
        // Mock data doesn't have description, so we can leave it undefined.
        // description: g.description || undefined, 
    }));
  }
);
