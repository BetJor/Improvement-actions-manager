"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, ListChecks, GanttChartSquare, Archive } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function AppSidebar() {
  const pathname = usePathname()
  const t = useTranslations("AppSidebar")

  const navItems = [
    { href: "/dashboard", icon: Home, label: t("dashboard") },
    { href: "/actions", icon: ListChecks, label: t("actions") },
    { href: "/backlog", icon: Archive, label: t("backlog") },
  ]

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GanttChartSquare className="h-6 w-6 text-primary" />
            <span className="">{t("title")}</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">{t("toggleNotifications")}</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  {
                    "bg-muted text-primary": pathname.endsWith(item.href),
                  }
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
