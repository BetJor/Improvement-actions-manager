
"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, ListChecks, Settings, Route, Sparkles, Library } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

function SidebarNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-primary-foreground/80 transition-all hover:text-primary-foreground",
        isActive && "bg-primary-foreground/10 text-primary-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
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
    <aside className="hidden w-64 flex-col bg-primary text-primary-foreground md:flex">
      <nav className="flex flex-col gap-2 p-4 text-sm font-medium">
        {mainNavItems.map((item) => (
            <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
         <div className="my-2 border-t border-primary-foreground/20"></div>
        {adminNavItems.map((item) => (
            <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
        <div className="my-2 border-t border-primary-foreground/20"></div>
        {aboutNavItems.map((item) => (
            <SidebarNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
      </nav>
    </aside>
  )
}
