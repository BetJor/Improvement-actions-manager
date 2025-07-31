
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ListChecks, Settings, Route, Sparkles, Library } from "lucide-react"
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
import { GanttChartSquare } from "lucide-react"
import { useTabs } from "@/hooks/use-tabs"
import ActionsPage from "@/app/[locale]/actions/page"
import SettingsPage from "@/app/[locale]/settings/page"
import AiSettingsPage from "@/app/[locale]/ai-settings/page"
import PromptGalleryPage from "@/app/[locale]/prompt-gallery/page"
import RoadmapPage from "@/app/[locale]/roadmap/page"
import { MockRouterProvider } from "@/hooks/use-tabs"

const pageComponents: { [key: string]: React.ComponentType } = {
  '/actions': ActionsPage,
  '/settings': SettingsPage,
  '/ai-settings': AiSettingsPage,
  '/prompt-gallery': PromptGalleryPage,
  '/roadmap': RoadmapPage,
};


function SidebarNavLink({ href, icon: Icon, label, t }: { href: string; icon: React.ElementType; label: string, t: any }) {
  const { addTab, activeTab, setActiveTab } = useTabs();
  const pathname = usePathname();

  const isActive = (href: string) => {
    const baseHref = href.split('/').slice(2).join('/'); // Remove locale
    const activeHref = activeTab?.href.split('/').slice(2).join('/');
    
    if (baseHref === 'dashboard') return activeHref === 'dashboard';
    
    // For nested routes like /actions/[id]
    return activeHref?.startsWith(baseHref);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href.endsWith("/dashboard")) {
        setActiveTab("dashboard");
        return;
    }

    const PageComponent = pageComponents[href.substring(3)]; // remove locale
    if (PageComponent) {
      addTab({
        id: href, // Use href as a unique ID for these static pages
        title: label,
        href: href,
        isClosable: true,
        content: (
          <MockRouterProvider params={{}}>
            <PageComponent />
          </MockRouterProvider>
        ),
      });
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive(href)}
        tooltip={{ children: label }}
        onClick={handleClick}
      >
        <Link href={href}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}


export function AppSidebar() {
  const pathname = usePathname()
  const t = useTranslations("AppSidebar")

  const navItems = [
    { href: "/dashboard", icon: Home, label: t("dashboard") },
    { href: "/actions", icon: ListChecks, label: t("actions") },
  ]
  
  const settingsNavItems = [
    { href: "/settings", icon: Settings, label: t("settings") },
    { href: "/ai-settings", icon: Sparkles, label: t("aiSettings") },
  ]

  const galleryNavItems = [
    { href: "/prompt-gallery", icon: Library, label: t("promptGallery") },
    { href: "/roadmap", icon: Route, label: t("roadmap") },
  ]

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
                <SidebarNavLink key={item.href} {...item} t={t} />
            ))}
            <SidebarSeparator />
            {settingsNavItems.map((item) => (
                <SidebarNavLink key={item.href} {...item} t={t} />
            ))}
            <SidebarSeparator />
            {galleryNavItems.map((item) => (
                <SidebarNavLink key={item.href} {...item} t={t} />
            ))}
            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
  )
}
