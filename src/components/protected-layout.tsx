
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { useLocale, useTranslations, NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { TabsProvider, useTabs } from "@/hooks/use-tabs";
import { DynamicTabs } from "./dynamic-tabs";
import { SidebarProvider } from "./ui/sidebar";


function LayoutWithTabs({ children }: { children: React.ReactNode }) {
    const tSidebar = useTranslations("AppSidebar");
    const { activeTab, tabs } = useTabs();
    
    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <SidebarProvider>
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
        </SidebarProvider>
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
  
  if (!user && !pathname.includes('/login')) {
     return null;
  }

  const content = (
      <TabsProvider>
          <LayoutWithTabs>
              {children}
          </LayoutWithTabs>
      </TabsProvider>
  )

  if (pathname.includes('/login')) {
      return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
      );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {content}
    </NextIntlClientProvider>
  );
}
