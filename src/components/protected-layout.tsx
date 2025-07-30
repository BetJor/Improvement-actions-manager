
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { useLocale } from "next-intl";

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
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AppSidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background/60">
          {children}
        </main>
      </div>
    </div>
  );
}
