"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, ListChecks, Settings, Route, Sparkles, Library } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "./ui/sidebar"


function SidebarNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const params = useParams();
  const isActive = pathname === href || (href !== `/${params.locale}/dashboard` && pathname.startsWith(href));

  return (
    <SidebarMenuItem>
        <Link href={href} passHref>
            <SidebarMenuButton asChild isActive={isActive}>
                <a>
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </a>
            </SidebarMenuButton>
        </Link>
    </SidebarMenuItem>
  );
}


export function AppSidebar({ t }: { t: any }) {
  const locale = useParams().locale;
  const { user } = useAuth(); 
  const { state } = useSidebar();
  
  console.log("[AppSidebar] Rendering with state:", state);


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
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <nav className="flex flex-col gap-2 p-4 text-sm font-medium">
            {mainNavItems.map((item) => (
                <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
            <div className="my-2 border-t border-muted"></div>
            {adminNavItems.map((item) => (
                <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
            <div className="my-2 border-t border-muted"></div>
            {aboutNavItems.map((item) => (
                <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
        </nav>
    </aside>
  )
}
