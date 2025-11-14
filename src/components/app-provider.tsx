'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { AppContent } from '@/components/app-content';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
      <Toaster />
    </AuthProvider>
  );
}
