
"use client";

import "./globals.css"
import { Inter } from 'next/font/google'
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { TabsProvider } from "@/hooks/use-tabs"
import { DynamicTabs } from "@/components/dynamic-tabs"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ActionStateProvider } from "@/hooks/use-action-state"
import { Loader2 } from "lucide-react"

const inter = Inter({ subsets: ['latin'] })

// Metadata should be exported from a server component, so we keep it separate.
// However, the layout itself needs to be a client component to use hooks.
// This is a common pattern. We'll export metadata from a separate, empty layout.
/*
export const metadata = {
  title: "Gestor de Acciones de Mejora",
  description: "Gestiona y sigue las acciones de mejora a toda tu organización.",
}
*/

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

function AppContent({ children }: { children: React.ReactNode }) {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
          <AuthProvider>
            <AppContent>
              {children}
            </AppContent>
            <Toaster />
          </AuthProvider>
      </body>
    </html>
  )
}
