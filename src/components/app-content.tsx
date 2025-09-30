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

function MainLayout({ children }: { children: React.ReactNode }) {
    const { tabs, activeTab } = useTabs();
    
    return (
        <div className="relative flex h-screen w-full flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <AppSidebar />
                <main className="flex-1 flex flex-col bg-background/60 overflow-y-auto p-4 sm:p-6">
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
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user && !pathname.includes('/login')) {
      router.push(`/login`);
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /><span>Cargando...</span></div>;
  }
  
  const isLoginPage = pathname.includes('/login');

  if (!user && !isLoginPage) {
     return null; 
  }
  
  if (isLoginPage) {
    return <>{children}</>;
  }
  
  return (
    <ActionStateProvider>
      <SidebarProvider>
        <TabsProvider initialPath={pathname}>
            <MainLayout>
                {children}
            </MainLayout>
        </TabsProvider>
      </SidebarProvider>
    </ActionStateProvider>
  );
}
