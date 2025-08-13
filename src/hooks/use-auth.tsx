
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, firebaseApp } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isImpersonating: boolean;
  impersonateUser: (userToImpersonate: User) => void;
  stopImpersonating: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IMPERSONATION_KEY = 'impersonation_original_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const loadFullUser = useCallback(async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
        // Check for impersonation first
        const impersonationData = sessionStorage.getItem(IMPERSONATION_KEY);
        if (impersonationData) {
            const { impersonatedUser, originalUser } = JSON.parse(impersonationData);
            // Ensure the original user stored is the same as the current firebase user
            if (originalUser?.id === fbUser.uid) {
                setUser(impersonatedUser);
                setFirebaseUser(fbUser);
                setIsImpersonating(true);
                setLoading(false);
                return;
            } else {
                // If not, clear the session storage as it's invalid
                sessionStorage.removeItem(IMPERSONATION_KEY);
            }
        }
        
        // No impersonation or invalid, load the normal user
        const fullUserDetails = await getUserById(fbUser.uid);
        setUser(fullUserDetails);
        setFirebaseUser(fbUser);
        setIsImpersonating(false);
    } else {
        setUser(null);
        setFirebaseUser(null);
        setIsImpersonating(false);
        sessionStorage.removeItem(IMPERSONATION_KEY);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      await loadFullUser(fbUser);
      if (fbUser && pathname.includes('/login')) {
        window.location.href = `/${locale}/dashboard`;
      }
    });

    return () => unsubscribe();
  }, [pathname, locale, loadFullUser]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
      stopImpersonating(); // Ensure impersonation is cleared on logout
      await signOut(auth);
      router.push(`/${locale}/login`);
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
      setIsImpersonating(true);
      window.location.reload(); // Refresh to apply context everywhere
    } else {
      console.error("Only admins can impersonate users.");
    }
  };

  const stopImpersonating = () => {
    sessionStorage.removeItem(IMPERSONATION_KEY);
    setIsImpersonating(false);
    loadFullUser(auth.currentUser); // Reload the original user data
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        isAdmin: user?.role === 'Admin',
        isImpersonating,
        impersonateUser,
        stopImpersonating,
        signInWithGoogle, 
        logout 
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
