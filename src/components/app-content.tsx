
"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTabs, TabsProvider } from '@/hooks/use-tabs';
import { Loader2 } from 'lucide-react';
import { Header } from './header';
import { AppSidebar } from './app-sidebar';
import { DynamicTabs } from './dynamic-tabs';
import { SidebarProvider } from './ui/sidebar';
import { ActionStateProvider } from '@/hooks/use-action-state';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

function MainLayout({ children }: { children: React.ReactNode }) {
    const { tabs, activeTab } = useTabs();
    
    return (
        <div className="relative flex h-screen w-full flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <AppSidebar />
                <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6">
                    <div className="mb-6">
                        <DynamicTabs />
                    </div>
                    <div className="flex-grow">
                        {tabs.map(tab => (
                            <div key={tab.id} style={{ display: tab.id === activeTab ? 'block' : 'none' }} className="h-full">
                                {tab.content}
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}


export function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // The redirect logic is now handled inside the useAuth hook to keep track of the original URL.
  // This component just decides what to render based on the auth state.

  // While loading, show a full-screen spinner.
  // This prevents any content (even the login page) from flashing briefly
  // while Firebase determines the auth state.
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /><span>Cargando...</span></div>;
  }
  
  const isLoginPage = pathname.includes('/login');

  // If we are on the login page but the user is already authenticated,
  // we show the loading screen while the redirect in useAuth takes effect.
  // This prevents the login form from flashing.
  if (isLoginPage && user) {
     return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /><span>Redirigiendo...</span></div>;
  }

  // If on login page and not authenticated, show the login page.
  if (isLoginPage && !user) {
    return <>{children}</>;
  }
  
  // If not on login page and not authenticated, we'll be redirected by the useAuth hook.
  // Return null to prevent rendering the main layout while the redirect happens.
  if (!isLoginPage && !user) {
     return null; 
  }
  
  // If we get here, user is authenticated and not on the login page, so render the main app.
  return (
    <ActionStateProvider>
      <SidebarProvider>
        <TabsProvider initialPath={pathname}>
            <FirebaseErrorListener />
            <MainLayout>
                {children}
            </MainLayout>
        </TabsProvider>
      </SidebarProvider>
    </ActionStateProvider>
  );
}
