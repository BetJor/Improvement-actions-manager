
"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, ListChecks, Settings, Route, Sparkles, Library, GanttChartSquare } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "./ui/sidebar"


function SidebarNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale;
  const isActive = pathname === href || (href !== `/${locale}/dashboard` && pathname.startsWith(href));

  return (
    <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive}>
            <Link href={href}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </Link>
        </SidebarMenuButton>
    </SidebarMenuItem>
  );
}


export function AppSidebar({ t }: { t: any }) {
  const locale = useParams().locale;
  const { user } = useAuth(); 
  const { state } = useSidebar();
  
  if (!user) return null;

  const mainNavItems = [
    { href: `/${locale}/dashboard`, icon: Home, label: t("dashboard") },
    { href: `/${locale}/actions`, icon: ListChecks, label: t("actions") },
  ]
  
  const adminNavItems = [
    { href: `/${locale}/settings`, icon: Settings, label: t("settings") },
    { href: `/${locale}/ai-settings`, icon: Sparkles, label: t("aiSettings") },
    { href: `/${locale}/prompt-gallery`, icon: Library, label: t("promptGallery") },
  ]

  const aboutNavItems = [
    { href: `/${locale}/roadmap`, icon: Route, label: t("roadmap") },
  ]

  return (
    <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <GanttChartSquare className="h-7 w-7 text-primary" />
                <span className="text-lg font-semibold">{t('title')}</span>
            </div>
        </SidebarHeader>
        <SidebarContent className="pt-4">
            <SidebarMenu>
                {mainNavItems.map((item) => (
                    <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
                ))}
            </SidebarMenu>
            <div className="my-4 border-t border-border -mx-2"></div>
             <SidebarMenu>
                {adminNavItems.map((item) => (
                    <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
                ))}
            </SidebarMenu>
            <div className="my-4 border-t border-border -mx-2"></div>
            <SidebarMenu>
                {aboutNavItems.map((item) => (
                    <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
                ))}
            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
  )
}
