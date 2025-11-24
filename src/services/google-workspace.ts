'use server';
/**
 * @fileoverview A service for interacting with the Google Workspace Admin SDK.
 * This service handles authentication and provides methods to fetch data from Google Workspace.
 */
import { google } from 'googleapis';

// --- CONFIGURACIÓ IMPORTANT ---
// Pots canviar aquest email o usar una variable d'entorn
const WORKSPACE_ADMIN_SUBJECT = process.env.WORKSPACE_ADMIN_EMAIL || 'svc-gcds@costaisa.com';
// ---

// --- ATENCIÓ: Tots aquests permisos han d'estar autoritzats a la consola de Google ---
// (Seguretat > Control d'accés i de dades > Controls d'API > Delegació de tot el domini)
// Si afegeixes un nou 'scope' aquí, has d'afegir-lo també a la consola d'admin de Google.
const WORKSPACE_SCOPES = [
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
    'https://www.googleapis.com/auth/admin.directory.group.readonly',
    'https://www.googleapis.com/auth/admin.directory.group.member.readonly',
];

/**
 * Creates an authenticated GoogleAuth client for the Admin SDK.
 * This client uses a service account and impersonates a user in the target domain.
 * @returns A promise that resolves to an authenticated auth client.
 */
async function getAuthClient() {
    console.log(`[GoogleWorkspaceService] Attempting to get auth client for subject: ${WORKSPACE_ADMIN_SUBJECT}`);
    // La variable d'entorn GOOGLE_APPLICATION_CREDENTIALS s'utilitzarà automàticament.
    const auth = new google.auth.GoogleAuth({
        scopes: WORKSPACE_SCOPES,
        clientOptions: {
            subject: WORKSPACE_ADMIN_SUBJECT,
        },
    });

    try {
        const client = await auth.getClient();
        console.log('[GoogleWorkspaceService] Auth client obtained successfully.');
        return client;
    } catch(error: any) {
        console.error('[GoogleWorkspaceService] Error getting auth client:', error.message);
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.log(`[GoogleWorkspaceService] GOOGLE_APPLICATION_CREDENTIALS is set to: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
        } else {
            console.warn('[GoogleWorkspaceService] GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
        }

        if (error.message.includes('unauthorized_client')) {
             throw new Error(`Client not authorized. Please check that the service account has the correct scopes delegated in the Google Admin Console. Required scopes: ${WORKSPACE_SCOPES.join(', ')}`);
        }
        if (error.message.includes('credential')) {
             throw new Error(`Authentication error. Ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly and points to a valid service account file. Original error: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Fetches all users from a specified Google Workspace domain with pagination.
 * @param domain The domain to fetch users from (e.g., 'yourdomain.com').
 * @returns A promise that resolves to an array of user objects from the Google Admin SDK.
 */
export async function getWorkspaceUsers(domain: string): Promise<any[]> {
    console.log(`[GoogleWorkspaceService] Fetching all users for domain: ${domain}`);
    try {
        const authClient = await getAuthClient();
        const admin = google.admin({ version: 'directory_v1', auth: authClient as any });

        let allUsers: any[] = [];
        let pageToken: string | undefined = undefined;

        do {
            const res = await admin.users.list({
                domain: domain,
                maxResults: 500, // Maximum allowed per page
                orderBy: 'email',
                pageToken,
            });

            const users = res.data.users;
            if (users && users.length > 0) {
                allUsers = allUsers.concat(users);
                console.log(`[GoogleWorkspaceService] Fetched ${users.length} users (total: ${allUsers.length})`);
            }

            pageToken = res.data.nextPageToken || undefined;
        } while (pageToken);

        console.log(`[GoogleWorkspaceService] Found ${allUsers.length} total users.`);
        return allUsers;

    } catch (error: any) {
        console.error('[GoogleWorkspaceService] Failed to fetch users:', error.message);
        console.error('[GoogleWorkspaceService] Full error object:', JSON.stringify(error, null, 2));
        throw new Error(`Could not fetch users from Google Workspace: ${error.message}`);
    }
}

/**
 * Fetches all groups from a specified Google Workspace domain with pagination.
 * @returns A promise that resolves to an array of all group objects.
 */
export async function getWorkspaceGroups(): Promise<any[]> {
  const domain = 'costaisa.com';
  console.log(`[GoogleWorkspaceService] Fetching all groups for domain: ${domain}`);
  try {
    const authClient = await getAuthClient();
    const admin = google.admin({ version: 'directory_v1', auth: authClient as any });

    let allGroups: any[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const res = await admin.groups.list({
        domain,
        maxResults: 200, // Maximum allowed per page
        pageToken,
      });

      const groups = res.data.groups;
      if (groups && groups.length > 0) {
        allGroups = allGroups.concat(groups);
        console.log(`[GoogleWorkspaceService] Fetched ${groups.length} groups (total: ${allGroups.length})`);
      }

      pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);

    console.log(`[GoogleWorkspaceService] Found ${allGroups.length} total groups.`);
    return allGroups;
  } catch (error: any) {
    console.error(`[GoogleWorkspaceService] Failed to fetch groups:`, error.message);
    if ((error as any).errors) {
        console.error('[GoogleWorkspaceService] Detailed errors:', JSON.stringify((error as any).errors, null, 2));
    }
    throw new Error(`Could not fetch groups from Google Workspace: ${error.message}`);
  }
}

/**
 * Fetches a single group by its ID or email from Google Workspace.
 * @param groupId The unique ID or email of the group.
 * @returns A promise that resolves to the group object or null if not found.
 */
export async function getWorkspaceGroupById(groupId: string): Promise<any | null> {
    console.log(`[GoogleWorkspaceService] Fetching group by ID: ${groupId}`);
    try {
        const authClient = await getAuthClient();
        const admin = google.admin({ version: 'directory_v1', auth: authClient as any });

        const res = await admin.groups.get({
            groupKey: groupId,
        });

        return res.data;
    } catch (error: any) {
        // If the error is 404, it means the group was not found. Return null.
        if (error.code === 404) {
            console.warn(`[GoogleWorkspaceService] Group with ID '${groupId}' not found.`);
            return null;
        }
        console.error(`[GoogleWorkspaceService] Failed to fetch group '${groupId}':`, error.message);
        throw new Error(`Could not fetch group '${groupId}' from Google Workspace: ${error.message}`);
    }
}


/**
 * Checks if a user is a member of a group, including nested groups.
 * @param userEmail The email of the user to check.
 * @param groupKey The email or unique ID of the group to check.
 * @returns A promise that resolves to true if the user is a member, false otherwise.
 */
export async function isUserMemberOfGroup(userEmail: string, groupKey: string): Promise<boolean> {
    console.log(`[isUserMemberOfGroup] Starting check for user '${userEmail}' in group '${groupKey}'`);
    const authClient = await getAuthClient();
    const admin = google.admin({ version: 'directory_v1', auth: authClient as any });
    const visitedGroups = new Set<string>(); // To prevent infinite loops with circular nesting

    async function checkMembership(currentGroupKey: string): Promise<boolean> {
        console.log(`[isUserMemberOfGroup] ==> Checking group: ${currentGroupKey}`);
        if (visitedGroups.has(currentGroupKey)) {
            console.log(`[isUserMemberOfGroup] Circular dependency detected for group ${currentGroupKey}. Skipping.`);
            return false;
        }
        visitedGroups.add(currentGroupKey);

        try {
            // Use hasMember to check directly, it's more efficient for direct members.
            try {
                console.log(`[isUserMemberOfGroup] Checking direct membership of '${userEmail}' in '${currentGroupKey}'...`);
                const checkRes = await admin.members.hasMember({ groupKey: currentGroupKey, memberKey: userEmail });
                if (checkRes.data.isMember) {
                    console.log(`[isUserMemberOfGroup] User is a DIRECT member of ${currentGroupKey}.`);
                    return true;
                }
                 console.log(`[isUserMemberOfGroup] User is NOT a direct member of ${currentGroupKey}.`);
            } catch (e: any) {
                console.warn(`[isUserMemberOfGroup] 'hasMember' call failed for group '${currentGroupKey}' (this can be normal). Error: ${e.message}. Proceeding to list members.`);
            }
            
            // Fallback to listing members to check for nested groups.
            console.log(`[isUserMemberOfGroup] Listing members of group '${currentGroupKey}' to check for nested groups...`);
            const res = await admin.members.list({ groupKey: currentGroupKey });
            const members = res.data.members;

            if (!members || members.length === 0) {
                console.log(`[isUserMemberOfGroup] Group '${currentGroupKey}' has no members.`);
                return false;
            }

            console.log(`[isUserMemberOfGroup] Group '${currentGroupKey}' has ${members.length} members. Iterating...`);
            for (const member of members) {
                 if (member.type === 'USER' && member.email?.toLowerCase() === userEmail.toLowerCase()) {
                    console.log(`[isUserMemberOfGroup] Found user '${userEmail}' as a member in group '${currentGroupKey}'.`);
                    return true;
                }
                if (member.type === 'GROUP' && member.id) {
                    console.log(`[isUserMemberOfGroup] Found nested group '${member.email}'. Recursing...`);
                    // Recursive call to check the nested group
                    if (await checkMembership(member.id)) {
                        console.log(`[isUserMemberOfGroup] User found in nested group '${member.email}'.`);
                        return true;
                    }
                }
            }
            console.log(`[isUserMemberOfGroup] User not found in any members of '${currentGroupKey}'.`);
            return false;
        } catch (error: any) {
            console.error(`[isUserMemberOfGroup] Error checking members for group ${currentGroupKey}:`, error.message);
            // If a group can't be checked, assume the user is not a member of it.
            return false;
        }
    }

    const result = await checkMembership(groupKey);
    console.log(`[isUserMemberOfGroup] Final result for user '${userEmail}' in group '${groupKey}': ${result}`);
    return result;
}