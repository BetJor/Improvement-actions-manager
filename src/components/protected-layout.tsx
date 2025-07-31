
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { useLocale, useTranslations } from "next-intl";
import { SidebarProvider } from "@/components/ui/sidebar";


export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const tSidebar = useTranslations("AppSidebar");

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
    <SidebarProvider>
        <div className="flex h-full w-full">
            <AppSidebar t={tSidebar} />
            <div className="flex flex-1 flex-col overflow-y-auto">
                <Header />
                 <main className="flex-1 space-y-4 p-4 lg:p-6 bg-background/60 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    </SidebarProvider>
  );
}
