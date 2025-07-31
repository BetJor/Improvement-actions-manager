
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
import { useParams } from "next/navigation"


const pageComponents: { [key: string]: React.ComponentType | { component: React.ComponentType, params?: any } } = {
    '/actions': ActionsPage,
    '/settings': SettingsPage,
    '/ai-settings': AiSettingsPage,
    '/prompt-gallery': PromptGalleryPage,
    '/roadmap': RoadmapPage,
};


function SidebarNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const { addTab, activeTab, setActiveTab } = useTabs();
  const currentParams = useParams();

  const fullHref = `/${currentParams.locale}${href}`;

  const isActive = () => {
    if (href === "/dashboard") {
        return activeTab?.id === 'dashboard';
    }
    return activeTab?.id === fullHref;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (href === "/dashboard") {
        setActiveTab("dashboard");
        return;
    }

    const pageInfo = pageComponents[href];
    if (pageInfo) {
      const PageComponent = 'component' in pageInfo ? pageInfo.component : pageInfo;
      const params = 'component' in pageInfo ? pageInfo.params : {};

      addTab({
        id: fullHref, 
        title: label,
        href: fullHref,
        isClosable: true,
        content: (
          <MockRouterProvider params={{ locale: currentParams.locale, ...params }}>
            <PageComponent />
          </MockRouterProvider>
        ),
      });
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive()}
        tooltip={{ children: label }}
        onClick={handleClick}
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}


export function AppSidebar() {
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
                <SidebarNavLink key={item.href} href={`/${useParams().locale}${item.href}`} icon={item.icon} label={item.label} />
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
