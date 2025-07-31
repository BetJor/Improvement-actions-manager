
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
import { useTabs, MockRouterProvider } from "@/hooks/use-tabs"
import ActionsPage from "@/app/[locale]/actions/page"
import SettingsPage from "@/app/[locale]/settings/page"
import AiSettingsPage from "@/app/[locale]/ai-settings/page"
import PromptGalleryPage from "@/app/[locale]/prompt-gallery/page"
import RoadmapPage from "@/app/[locale]/roadmap/page"

const pageComponents: { [key: string]: React.ComponentType } = {
  '/actions': ActionsPage,
  '/settings': SettingsPage,
  '/ai-settings': AiSettingsPage,
  '/prompt-gallery': PromptGalleryPage,
  '/roadmap': RoadmapPage,
};

function SidebarNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const { addTab, activeTab, setActiveTab } = useTabs();
  const pathname = usePathname();

  const isActive = () => {
    if (href.endsWith("/dashboard")) {
        return activeTab?.id === 'dashboard';
    }
    return activeTab?.id === href;
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
        id: href, 
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
        isActive={isActive()}
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
                <SidebarNavLink key={item.href} {...item} />
            ))}
            <SidebarSeparator />
            {settingsNavItems.map((item) => (
                <SidebarNavLink key={item.href} {...item} />
            ))}
            <SidebarSeparator />
            {galleryNavItems.map((item) => (
                <SidebarNavLink key={item.href} {...item} />
            ))}
            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
  )
}
