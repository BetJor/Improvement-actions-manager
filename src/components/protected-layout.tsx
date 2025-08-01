
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { useLocale, useTranslations } from "next-intl";
import { TabsProvider, useTabs } from "@/hooks/use-tabs";
import { DynamicTabs } from "./dynamic-tabs";


function LayoutWithTabs({ children }: { children: React.ReactNode }) {
    const tSidebar = useTranslations("AppSidebar");
    const { activeTab, tabs } = useTabs();
    
    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <div className="flex h-screen w-full flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <AppSidebar t={tSidebar} />
                <main className="flex-1 flex flex-col bg-background/60 overflow-y-auto">
                    <DynamicTabs />
                    <div className="p-4 lg:p-6 flex-grow">
                        {activeTabContent || children}
                    </div>
                </main>
            </div>
        </div>
    );
}


export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  
  useEffect(() => {
    if (!loading && !user && !pathname.includes('/login')) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, pathname, router, locale]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregant...</div>;
  }
  
  if (!user && !pathname.includes('/login')) {
     return null;
  }
  
  if (pathname.includes('/login')) {
      return <>{children}</>
  }

  return (
    <TabsProvider>
        <LayoutWithTabs>
            {children}
        </LayoutWithTabs>
    </TabsProvider>
  );
}
