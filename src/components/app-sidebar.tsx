
"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, ListChecks, Settings, Route, Sparkles, Library, PanelBottom } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { GanttChartSquare } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"


function SidebarNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== `/${useParams().locale}/dashboard` && pathname.startsWith(href));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={{ children: label }}
      >
        <Link href={href}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}


export function AppSidebar({ t }: { t: any }) {
  const locale = useParams().locale;
  const { user } = useAuth(); 

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
    <Sidebar collapsible="icon" className="p-2">
        <SidebarContent className="flex flex-col">
            <SidebarMenu>
                {mainNavItems.map((item) => (
                    <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
                ))}
            </SidebarMenu>

            <SidebarGroup className="mt-4">
                <SidebarGroupLabel>Administració</SidebarGroupLabel>
                <SidebarMenu>
                    {adminNavItems.map((item) => (
                        <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
                    ))}
                </SidebarMenu>
            </SidebarGroup>
            
            <div className="mt-auto">
                <SidebarMenu>
                    <SidebarSeparator />
                    {aboutNavItems.map((item) => (
                        <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
                    ))}
                </SidebarMenu>
            </div>
        </SidebarContent>
    </Sidebar>
  )
}
