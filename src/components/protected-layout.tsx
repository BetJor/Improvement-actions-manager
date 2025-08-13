
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { useTranslations, NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { TabsProvider, useTabs } from "@/hooks/use-tabs";
import { DynamicTabs } from "./dynamic-tabs";
import { SidebarProvider } from "./ui/sidebar";
import { ActionStateProvider } from "@/hooks/use-action-state";


function LayoutWithTabs({ children }: { children: React.ReactNode }) {
    const t = useTranslations();
    const { activeTab, tabs } = useTabs();
    
    const activeTabObject = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="relative flex h-screen w-full flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <AppSidebar t={t} />
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


export function ProtectedLayout({ 
  children,
  locale,
  messages
}: { 
  children: React.ReactNode,
  locale: string,
  messages: AbstractIntlMessages
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user && !pathname.includes('/login')) {
      router.push(`/${locale}/login`);
    }
  }, [user, loading, pathname, router, locale]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregant...</div>;
  }
  
  const isLoginPage = pathname.includes('/login');

  if (!user && !isLoginPage) {
     return null; // Don't render anything until redirect happens
  }

  const content = (
    <ActionStateProvider>
        <TabsProvider initialPath={pathname}>
        {isLoginPage ? children : 
            <LayoutWithTabs>
                {children}
            </LayoutWithTabs>
        }
        </TabsProvider>
    </ActionStateProvider>
  )

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
        <SidebarProvider>
            {content}
        </SidebarProvider>
    </NextIntlClientProvider>
  );
}
