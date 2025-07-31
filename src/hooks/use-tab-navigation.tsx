
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTabs } from './use-tabs';
import { Home, ListChecks, Settings, Sparkles, Library, Route, FilePlus, GanttChartSquare } from 'lucide-react';

// Importa els components de pàgina que vols renderitzar
import DashboardPage from '@/app/[locale]/dashboard/page';
import ActionsPage from '@/app/[locale]/actions/page';
import NewActionPage from '@/app/[locale]/actions/new/page';
import ActionDetailPage from '@/app/[locale]/actions/[id]/page';
import SettingsPage from '@/app/[locale]/settings/page';
import AiSettingsPage from '@/app/[locale]/ai-settings/page';
import PromptGalleryPage from '@/app/[locale]/prompt-gallery/page';
import RoadmapPage from '@/app/[locale]/roadmap/page';


const staticTabsConfig = [
    { path: '/dashboard', title: 'Dashboard', icon: Home, isClosable: false, component: DashboardPage },
    { path: '/actions', title: 'Accions', icon: ListChecks, isClosable: false, component: ActionsPage },
    { path: '/settings', title: 'Configuració', icon: Settings, isClosable: false, component: SettingsPage },
    { path: '/ai-settings', title: 'Configuració IA', icon: Sparkles, isClosable: false, component: AiSettingsPage },
    { path: '/prompt-gallery', title: 'Galeria de Prompts', icon: Library, isClosable: false, component: PromptGalleryPage },
    { path: '/roadmap', title: 'Roadmap', icon: Route, isClosable: false, component: RoadmapPage },
];

export function useTabNavigation() {
  const pathname = usePathname();
  const { openTab, setActiveTab } = useTabs();

  useEffect(() => {
    // treu el locale del path
    const pathWithoutLocale = pathname.split('/').slice(2).join('/');
    const fullPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/dashboard';

    let handled = false;

    // Check for static tabs
    const staticTab = staticTabsConfig.find(t => t.path === fullPath);
    if (staticTab) {
      openTab({
        path: staticTab.path,
        title: staticTab.title,
        icon: staticTab.icon,
        isClosable: staticTab.isClosable,
        content: <staticTab.component />
      });
      setActiveTab(staticTab.path);
      handled = true;
    }
    
    if (handled) return;

    // Handle dynamic tabs
    const actionIdMatch = fullPath.match(/\/actions\/(.+)/);

    if (fullPath === '/actions/new') {
        const path = '/actions/new';
        openTab({
            path: path,
            title: 'Nova Acció',
            icon: FilePlus,
            isClosable: true,
            content: <NewActionPage />
        });
        setActiveTab(path);
    } else if (actionIdMatch) {
        const id = actionIdMatch[1];
        const path = `/actions/${id}`;
        openTab({
            path: path,
            title: `Acció ${id.substring(0,8)}...`, // Shorten title
            icon: GanttChartSquare,
            isClosable: true,
            content: <ActionDetailPage />
        });
        setActiveTab(path);
    }

  }, [pathname, openTab, setActiveTab]);
}
