
"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, ListChecks, Settings, Route, Sparkles, Library, GanttChartSquare, Users } from "lucide-react"
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
  const { user } = useAuth(); 
  const { state } = useSidebar();
  
  if (!user) return null;

  const mainNavItems = [
    { href: `/${locale}/dashboard`, icon: Home, label: t("dashboard"), isTab: true },
    { href: `/${locale}/actions`, icon: ListChecks, label: t("actions"), isTab: true },
  ]
  
  const adminNavItems = [
    { href: `/${locale}/settings`, icon: Settings, label: t("settings"), isTab: true },
    { href: `/${locale}/ai-settings`, icon: Sparkles, label: t("aiSettings"), isTab: true },
    { href: `/${locale}/prompt-gallery`, icon: Library, label: t("promptGallery"), isTab: true },
  ]

  const aboutNavItems = [
    { href: `/${locale}/roadmap`, icon: Route, label: t("roadmap"), isTab: true },
  ]

  return (
    <Sidebar>
        <SidebarContent className="pt-7">
            <SidebarMenu>
                {mainNavItems.map((item) => (
                    <SidebarNavLink key={item.href} {...item} />
                ))}
            </SidebarMenu>
            <div className="my-4 border-t border-border -mx-2"></div>
             <SidebarMenu>
                {adminNavItems.map((item) => (
                    <SidebarNavLink key={item.href} {...item} />
                ))}
            </SidebarMenu>
            <div className="my-4 border-t border-border -mx-2"></div>
            <SidebarMenu>
                {aboutNavItems.map((item) => (
                    <SidebarNavLink key={item.href} {...item} />
                ))}
            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
  )
}
