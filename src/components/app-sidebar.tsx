
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ListChecks, Archive, GanttChartSquare, Settings, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const t = useTranslations("AppSidebar")

  const navItems = [
    { href: "/dashboard", icon: Home, label: t("dashboard") },
    { href: "/actions", icon: ListChecks, label: t("actions") },
  ]
  
  const secondaryNavItems = [
    { href: "/settings", icon: Settings, label: t("settings") },
    { href: "/backlog", icon: Archive, label: t("backlog") },
    { href: "/planning", icon: Clock, label: t("planning") },
  ]

  const isActive = (href: string) => {
    // Special case for actions and its sub-pages
    if (href === "/actions") {
      return pathname.includes("/actions");
    }
    if (href === "/settings") {
      return pathname.includes("/settings");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sidebar collapsible="icon">
        <SidebarHeader>
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
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={{ children: item.label }}
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            <SidebarSeparator />
            {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={{ children: item.label }}
                >
                    <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
  )
}
