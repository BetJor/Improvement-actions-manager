'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  type User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithRedirect,
  getRedirectResult,
  getIdTokenResult,
} from 'firebase/auth';
import { auth, firebaseApp } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import type { User, ImprovementActionType, UserGroup } from '@/lib/types';
import { getUserById, updateUser } from '@/services/users-service';
import { getResponsibilityRoles, getActionTypes } from '@/services/master-data-service';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userRoles: string[]; // IDs of ResponsibilityRole
  userGroups: UserGroup[]; // Groups from custom claims
  canManageSettings: boolean;
  isImpersonating: boolean;
  impersonateUser: (userToImpersonate: User) => void;
  stopImpersonating: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDashboardLayout: (layout: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IMPERSONATION_KEY = 'impersonation_original_user';
const REDIRECT_URL_KEY = 'auth_redirect_url';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [canManageSettings, setCanManageSettings] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const resolveUserPermissions = useCallback(async (fbUser: FirebaseUser | null, userToResolve: User | null) => {
    if (!fbUser || !userToResolve) {
      setUserRoles([]);
      setCanManageSettings(false);
      setUserGroups([]);
      return;
    }
    
    // Global admins can always manage settings
    const isGlobalAdmin = userToResolve.role === 'Admin';
    
    try {
      const idTokenResult = await getIdTokenResult(fbUser);
      const claims = idTokenResult.claims;
      const groupsFromClaims: string[] = (claims.groups as string[]) || [];
      
      const mappedGroups: UserGroup[] = groupsFromClaims.map(g => ({
          id: g,
          name: g.split('@')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Heuristic name
          userIds: []
      }));
      setUserGroups(mappedGroups);

      const [allRoles, allAmbits] = await Promise.all([
        getResponsibilityRoles(),
        getActionTypes(),
      ]);
      
      const matchedRoles = allRoles
        .filter(role => 
            (role.type === 'Fixed' && groupsFromClaims.includes(role.email || ''))
        )
        .map(role => role.id!);
        
      setUserRoles(matchedRoles);

      if (isGlobalAdmin) {
        setCanManageSettings(true);
      } else {
        const isConfigAdmin = allAmbits.some(ambit => 
          ambit.configAdminRoleIds?.some(adminRoleId => matchedRoles.includes(adminRoleId))
        );
        setCanManageSettings(isConfigAdmin);
      }

    } catch (error) {
      console.error("Failed to resolve user permissions:", error);
      setUserRoles([]);
      setUserGroups([]);
      setCanManageSettings(isGlobalAdmin);
    }
  }, []);

  const loadFullUser = useCallback(async (fbUser: FirebaseUser | null, forceReload: boolean = false) => {
    if (fbUser) {
        const impersonationData = sessionStorage.getItem(IMPERSONATION_KEY);
        if (impersonationData && !forceReload) {
            const { impersonatedUser, originalUser } = JSON.parse(impersonationData);
            if (originalUser?.id === fbUser.uid) {
                setUser(impersonatedUser);
                setFirebaseUser(fbUser);
                await resolveUserPermissions(fbUser, impersonatedUser);
                setIsImpersonating(true);
                setLoading(false);
                return;
            } else {
                sessionStorage.removeItem(IMPERSONATION_KEY);
            }
        }
        
        const fullUserDetails = await getUserById(fbUser.uid);
        setUser(fullUserDetails);
        await resolveUserPermissions(fbUser, fullUserDetails);
        setFirebaseUser(fbUser);
        setIsImpersonating(false);
    } else {
        setUser(null);
        setFirebaseUser(null);
        setIsImpersonating(false);
        await resolveUserPermissions(null, null);
    }
    setLoading(false);
  }, [resolveUserPermissions]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser?.uid !== firebaseUser?.uid) {
            setLoading(true);
            await loadFullUser(fbUser);
            
            if (fbUser && pathname.includes('/login')) {
                const redirectUrl = sessionStorage.getItem(REDIRECT_URL_KEY);
                sessionStorage.removeItem(REDIRECT_URL_KEY);
                window.location.href = redirectUrl || '/dashboard';
            }
        }
    });

    return () => unsubscribe();
  }, [pathname, loadFullUser, firebaseUser]);


  useEffect(() => {
    // If the initial load is done and there's still no user, and we are not on the login page, redirect.
    if (!loading && !user && !pathname.includes('/login')) {
      sessionStorage.setItem(REDIRECT_URL_KEY, pathname);
      router.push('/login');
    }
  }, [user, loading, pathname, router]);


  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        // If result is not null, onAuthStateChanged will handle the user loading.
      } catch (error) {
        console.error("Error during sign-in redirect:", error);
      }
    };
    handleRedirectResult();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (user.email && !user.email.endsWith('@costaisa.com')) {
      await signOut(auth);
      throw new Error('El acceso está restringido a usuarios del dominio costaisa.com');
    }
  };

  const signInWithGoogleRedirect = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem(IMPERSONATION_KEY);
      setIsImpersonating(false);
      setUser(null);
      setFirebaseUser(null);
      router.push(`/login`);
    } catch (error) {
      console.error("Error signing out", error);
      sessionStorage.removeItem(IMPERSONATION_KEY);
      setUser(null);
      router.push(`/login`);
    }
  };

  const impersonateUser = async (userToImpersonate: User) => {
    if (user?.role === 'Admin' && firebaseUser) {
      const originalUser = user;
      sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify({
        impersonatedUser: userToImpersonate,
        originalUser: originalUser
      }));
      setUser(userToImpersonate);
      // We pass `null` for fbUser because we can't get claims for another user on the client.
      // Permissions for impersonated user will be based on their DB role, not claims.
      await resolveUserPermissions(null, userToImpersonate);
      setIsImpersonating(true);
      window.location.reload(); 
    } else {
      console.error("Only admins can impersonate users.");
    }
  };

  const stopImpersonating = useCallback(async () => {
    sessionStorage.removeItem(IMPERSONATION_KEY);
    setIsImpersonating(false);
    await loadFullUser(auth.currentUser, true); 
  }, [loadFullUser]);
  
  const updateDashboardLayout = useCallback(async (layout: string[]) => {
      if (!user) return;
      try {
        await updateUser(user.id, { dashboardLayout: layout });
      } catch (error) {
        console.error("Failed to update dashboard layout:", error);
        const originalUser = await getUserById(user.id);
        setUser(originalUser);
      }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        isAdmin: user?.role === 'Admin',
        userRoles,
        userGroups,
        canManageSettings,
        isImpersonating,
        impersonateUser,
        stopImpersonating,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signInWithEmail,
        sendPasswordReset,
        logout,
        updateDashboardLayout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
