
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
  const pathname = usePathname();

  const isActive = () => {
    // Exact match for dashboard
    if (href.endsWith('/dashboard')) {
        return activeTab?.id === 'dashboard';
    }
    // Match for other main routes
    return activeTab?.id === href;
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Handle dashboard separately
    if (href.endsWith('/dashboard')) {
        setActiveTab("dashboard");
        return;
    }
    
    // remove locale from href to match pageComponents keys
    const pageKey = href.replace(`/${currentParams.locale}`, '');
    const pageInfo = pageComponents[pageKey];

    if (pageInfo) {
      const PageComponent = 'component' in pageInfo ? pageInfo.component : pageInfo;
      const params = 'component' in pageInfo ? pageInfo.params : {};

      addTab({
        id: href, 
        title: label,
        href: href,
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
  const locale = useParams().locale;

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
