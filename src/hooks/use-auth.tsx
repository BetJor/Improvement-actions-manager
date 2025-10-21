

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
import type { User } from '@/lib/types';
import { getUserById, updateUser, getResponsibilityRoles } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userRoles: string[]; // IDs of ResponsibilityRole
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
  const router = useRouter();
  const pathname = usePathname();

  const resolveUserRoles = useCallback(async (userToResolve: User) => {
    if (!userToResolve?.email) return [];
    
    try {
      const allRoles = await getResponsibilityRoles();
      const matchedRoles = allRoles
        .filter(role => role.type === 'Fixed' && role.email === userToResolve.email)
        .map(role => role.id!);
      
      setUserRoles(matchedRoles);
    } catch (error) {
      console.error("Failed to resolve user roles:", error);
      setUserRoles([]);
    }
  }, []);

  const loadFullUser = useCallback(async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
        const impersonationData = sessionStorage.getItem(IMPERSONATION_KEY);
        if (impersonationData) {
            const { impersonatedUser, originalUser } = JSON.parse(impersonationData);
            if (originalUser?.id === fbUser.uid) {
                setUser(impersonatedUser);
                setFirebaseUser(fbUser);
                await resolveUserRoles(impersonatedUser);
                setIsImpersonating(true);
                setLoading(false);
                return;
            } else {
                sessionStorage.removeItem(IMPERSONATION_KEY);
            }
        }
        
        const fullUserDetails = await getUserById(fbUser.uid);
        setUser(fullUserDetails);
        if (fullUserDetails) {
            await resolveUserRoles(fullUserDetails);
        }
        setFirebaseUser(fbUser);
        setIsImpersonating(false);
    } else {
        setUser(null);
        setFirebaseUser(null);
        setIsImpersonating(false);
        setUserRoles([]);
        sessionStorage.removeItem(IMPERSONATION_KEY);
    }
    setLoading(false);
  }, [resolveUserRoles]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      await loadFullUser(fbUser);
      if (fbUser && pathname.includes('/login')) {
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
    await signInWithPopup(auth, provider);
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
      await stopImpersonating();
      
      // Manually clear the user state before signing out
      setUser(null);
      setFirebaseUser(null);
      setIsImpersonating(false);

      await signOut(auth);
      router.push(`/login`);
      
    } catch (error) {
      console.error("Error signing out", error);
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
      await resolveUserRoles(userToImpersonate);
      setIsImpersonating(true);
      window.location.reload(); 
    } else {
      console.error("Only admins can impersonate users.");
    }
  };

  const stopImpersonating = useCallback(async () => {
    sessionStorage.removeItem(IMPERSONATION_KEY);
    setIsImpersonating(false);
    await loadFullUser(auth.currentUser); 
  }, [loadFullUser]);
  
  const updateDashboardLayout = async (layout: string[]) => {
      if (!user) return;
      try {
        await updateUser(user.id, { dashboardLayout: layout });
        setUser({ ...user, dashboardLayout: layout }); // Update local state
      } catch (error) {
        console.error("Failed to update dashboard layout:", error);
      }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        isAdmin: user?.role === 'Admin',
        userRoles,
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
