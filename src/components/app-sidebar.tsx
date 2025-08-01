
"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, ListChecks, Settings, Route, Sparkles, Library } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { GanttChartSquare } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"


function SidebarNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

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

  const navItems = [
    { href: `/${locale}/dashboard`, icon: Home, label: t("dashboard") },
    { href: `/${locale}/actions`, icon: ListChecks, label: t("actions") },
  ]
  
  const settingsNavItems = [
    { href: `/${locale}/settings`, icon: Settings, label: t("settings") },
    { href: `/${locale}/ai-settings`, icon: Sparkles, label: t("aiSettings") },
  ]

  const galleryNavItems = [
    { href: `/${locale}/prompt-gallery`, icon: Library, label: t("promptGallery") },
    { href: `/${locale}/roadmap`, icon: Route, label: t("roadmap") },
  ]

  return (
    <Sidebar collapsible="icon">
        <SidebarHeader className="flex h-14 items-center bg-sidebar px-4 sm:h-16">
            <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 group-data-[collapsible=icon]:-rotate-90">
                    <GanttChartSquare className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-semibold text-primary transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                    {t("title")}
                </span>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
            {navItems.map((item) => (
                <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
            <SidebarSeparator />
            {settingsNavItems.map((item) => (
                <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
            <SidebarSeparator />
            {galleryNavItems.map((item) => (
                <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
  )
}
