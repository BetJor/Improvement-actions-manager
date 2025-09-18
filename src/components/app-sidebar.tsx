
"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, ListChecks, Settings, Route, Sparkles, Library, GanttChartSquare, Users, BarChart3, TestTubeDiagonal, FileLock2, Sitemap } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "./ui/sidebar"
import { useTabs } from "@/hooks/use-tabs"


function SidebarNavLink({ href, icon: Icon, label, isTab }: { href: string; icon: React.ElementType; label: string, isTab: boolean }) {
  const { openTab, setActiveTab, tabs, activeTab } = useTabs();
  const isActive = tabs.some(t => t.path === href && t.id === activeTab);

  const handleClick = (e: React.MouseEvent) => {
    if (isTab) {
      e.preventDefault();
      openTab({
        path: href,
        title: label,
        icon: Icon,
        isClosable: true,
      });
    }
  };

  return (
    <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} onClick={handleClick}>
            <Link href={href}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </Link>
        </SidebarMenuButton>
    </SidebarMenuItem>
  );
}


export function AppSidebar({ t }: { t: any }) {
  const locale = useParams().locale as string;
  const { user, isAdmin } = useAuth(); 
  const { state } = useSidebar();
  
  if (!user) return null;

  const mainNavItems = [
    { href: `/${locale}/dashboard`, icon: Home, label: t("Common.AppSidebar.dashboard"), isTab: true },
    { href: `/${locale}/actions`, icon: ListChecks, label: t("Common.AppSidebar.actions"), isTab: true },
    { href: `/${locale}/reports`, icon: BarChart3, label: t("Common.AppSidebar.reports"), isTab: true },
  ]
  
  const adminSettingsNavItems = [
    { href: `/${locale}/settings`, icon: Settings, label: t("Common.AppSidebar.settings"), isTab: true },
    { href: `/${locale}/workflow`, icon: Sitemap, label: "Workflow", isTab: true },
    { href: `/${locale}/ai-settings`, icon: Sparkles, label: t("Common.AppSidebar.aiSettings"), isTab: true },    
    { href: `/${locale}/user-management`, icon: Users, label: t("Common.AppSidebar.userManagement"), isTab: true },
  ]

  const adminDevNavItems = [
    { href: `/${locale}/firestore-rules`, icon: FileLock2, label: t("Common.AppSidebar.firestoreRules"), isTab: true },
    { href: `/${locale}/roadmap`, icon: Route, label: t("Common.AppSidebar.roadmap"), isTab: true },
    { href: `/${locale}/backlog`, icon: GanttChartSquare, label: t("Common.AppSidebar.backlog"), isTab: true },
    { href: `/${locale}/intranet-test`, icon: TestTubeDiagonal, label: "Intranet Test", isTab: true },
    { href: `/${locale}/prompt-gallery`, icon: Library, label: t("Common.AppSidebar.promptGallery"), isTab: true },
  ]


  return (
    <Sidebar>
        <SidebarContent className="pt-7">
            <SidebarMenu>
                {mainNavItems.map((item) => (
                    <SidebarNavLink key={item.href} {...item} />
                ))}
            </SidebarMenu>
            
            {isAdmin && (
                <>
                    <div className="my-4 border-t border-border -mx-2"></div>
                    <SidebarMenu>
                        {adminSettingsNavItems.map((item) => (
                            <SidebarNavLink key={item.href} {...item} />
                        ))}
                    </SidebarMenu>
                    <div className="my-4 border-t border-border -mx-2"></div>
                    <SidebarMenu>
                        {adminDevNavItems.map((item) => (
                            <SidebarNavLink key={item.href} {...item} />
                        ))}
                    </SidebarMenu>
                </>
            )}

        </SidebarContent>
    </Sidebar>
  )
}
