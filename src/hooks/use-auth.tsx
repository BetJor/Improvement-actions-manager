
"use client";

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
} from 'firebase/auth';
import { auth, firebaseApp } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import type { User, ImprovementActionType } from '@/lib/types';
import { getUserById, updateUser, getResponsibilityRoles, getActionTypes } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userRoles: string[]; // IDs of ResponsibilityRole
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [canManageSettings, setCanManageSettings] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const resolveUserPermissions = useCallback(async (userToResolve: User | null) => {
    if (!userToResolve) {
      setUserRoles([]);
      setCanManageSettings(false);
      return;
    }
    
    // Global admins can always manage settings
    const isGlobalAdmin = userToResolve.role === 'Admin';
    
    try {
      const [allRoles, allAmbits] = await Promise.all([
        getResponsibilityRoles(),
        getActionTypes(),
      ]);
      
      const matchedRoles = userToResolve.email 
        ? allRoles.filter(role => role.type === 'Fixed' && role.email === userToResolve.email).map(role => role.id!)
        : [];
        
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
                await resolveUserPermissions(impersonatedUser);
                setIsImpersonating(true);
                setLoading(false);
                return;
            } else {
                sessionStorage.removeItem(IMPERSONATION_KEY);
            }
        }
        
        const fullUserDetails = await getUserById(fbUser.uid);
        setUser(fullUserDetails);
        await resolveUserPermissions(fullUserDetails);
        setFirebaseUser(fbUser);
        setIsImpersonating(false);
    } else {
        setUser(null);
        setFirebaseUser(null);
        setIsImpersonating(false);
        await resolveUserPermissions(null);
    }
    setLoading(false);
  }, [resolveUserPermissions]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      await loadFullUser(fbUser);
      if (fbUser && pathname.includes('/login')) {
        // Use window.location.href for a full page navigation, which is cleaner
        // for redirecting away from a login page.
        window.location.href = `/dashboard`;
      }
    });

    return () => unsubscribe();
  }, [pathname, loadFullUser]);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User is signed in. The onAuthStateChanged listener will handle loading the user data.
        }
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
      // First, sign out from Firebase to invalidate the user's token.
      await signOut(auth);
      
      // Then, clean up local state like impersonation.
      sessionStorage.removeItem(IMPERSONATION_KEY);
      setIsImpersonating(false);
      setUser(null);
      setFirebaseUser(null);

      // Finally, redirect to the login page.
      router.push(`/login`);
      
    } catch (error) {
      console.error("Error signing out", error);
      // Even if there's an error, force a clean state and redirect.
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
      await resolveUserPermissions(userToImpersonate);
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
        // Update backend without causing a full user reload
        await updateUser(user.id, { dashboardLayout: layout });
      } catch (error) {
        console.error("Failed to update dashboard layout:", error);
        // Optionally revert local state on error by fetching the user again
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
