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

let admin: ReturnType<typeof google.admin> | null = null;

async function getAdminSdk() {
    if (admin) {
        return admin;
    }

    try {
        console.log(`[GoogleWorkspaceService] Initializing Admin SDK client for subject: ${WORKSPACE_ADMIN_SUBJECT}`);
        
        // Les credencials s'haurien de carregar automàticament des de la variable d'entorn GOOGLE_APPLICATION_CREDENTIALS
        const auth = new google.auth.GoogleAuth({
            scopes: WORKSPACE_SCOPES,
            clientOptions: {
              subject: WORKSPACE_ADMIN_SUBJECT
            }
        });
        
        const authClient = await auth.getClient();

        admin = google.admin({ version: 'directory_v1', auth: authClient as any });
        console.log('[GoogleWorkspaceService] Admin SDK client initialized successfully.');
        return admin;

    } catch(error: any) {
        console.error('[GoogleWorkspaceService] Error initializing Admin SDK client:', error.message);
        if (error.message.includes('unauthorized_client')) {
             throw new Error(`Client not authorized. Please check that the service account has the correct scopes delegated in the Google Admin Console. Required scopes: ${WORKSPACE_SCOPES.join(', ')}`);
        }
        if (error.message.includes('credential')) {
             throw new Error(`Authentication error. Ensure service-account.json is valid. Original error: ${error.message}`);
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
        const adminSdk = await getAdminSdk();

        let allUsers: any[] = [];
        let pageToken: string | undefined = undefined;

        do {
            const res = await adminSdk.users.list({
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
    const adminSdk = await getAdminSdk();

    let allGroups: any[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const res = await adminSdk.groups.list({
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
        const adminSdk = await getAdminSdk();

        const res = await adminSdk.groups.get({
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
    try {
        const adminSdk = await getAdminSdk();
        const res = await adminSdk.members.hasMember({ groupKey: groupKey, memberKey: userEmail });
        
        // hasMember returns a 200 response with a boolean isMember property
        if (res.status === 200 && typeof res.data.isMember === 'boolean') {
            return res.data.isMember;
        }
        // If the response is unexpected, assume not a member for safety.
        console.warn(`[isUserMemberOfGroup] Unexpected response from hasMember for group '${groupKey}'. Status: ${res.status}`);
        return false;
        
    } catch (error: any) {
        // A 404 error here means either the group or the member doesn't exist.
        // In either case, the user is not a member of the group.
        if (error.code === 404) {
             console.warn(`[isUserMemberOfGroup] Group '${groupKey}' or user '${userEmail}' not found.`);
             return false;
        }
        // For other errors, log it and return false to be safe.
        console.error(`[isUserMemberOfGroup] Error checking membership for user '${userEmail}' in group '${groupKey}': ${error.message}`);
        return false;
    }
}
