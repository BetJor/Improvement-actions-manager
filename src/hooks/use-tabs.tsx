
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { useLocale } from 'next-intl';

// Importa els components de pàgina que vols renderitzar
import DashboardPage from '@/app/[locale]/dashboard/page';
import ActionsPage from '@/app/[locale]/actions/page';
import NewActionPage from '@/app/[locale]/actions/new/page';
import ActionDetailPage from '@/app/[locale]/actions/[id]/page';
import SettingsPage from '@/app/[locale]/settings/page';
import AiSettingsPage from '@/app/[locale]/ai-settings/page';
import PromptGalleryPage from '@/app/[locale]/prompt-gallery/page';
import RoadmapPage from '@/app/[locale]/roadmap/page';
import MyGroupsPage from '@/app/[locale]/my-groups/page';

import { Home, ListChecks, Settings, Sparkles, Library, Route, FilePlus, GanttChartSquare, Users } from 'lucide-react';


const pageComponentMapping: { [key: string]: React.ComponentType<any> } = {
    '/dashboard': DashboardPage,
    '/actions': ActionsPage,
    '/actions/new': NewActionPage,
    '/settings': SettingsPage,
    '/ai-settings': AiSettingsPage,
    '/prompt-gallery': PromptGalleryPage,
    '/roadmap': RoadmapPage,
    '/my-groups': MyGroupsPage,
};

const getPageComponent = (path: string): React.ComponentType<any> | undefined => {
  if (pageComponentMapping[path]) {
    return pageComponentMapping[path];
  }
  const actionDetailRegex = /^\/actions\/[^/]+$/;
  if (actionDetailRegex.test(path)) {
    return ActionDetailPage;
  }
  return undefined;
};


const staticTabsConfig: Omit<Tab, 'id' | 'content'>[] = [
    { path: '/dashboard', title: 'Dashboard', icon: Home, isClosable: false },
    { path: '/actions', title: 'Accions', icon: ListChecks, isClosable: true },
    { path: '/roadmap', title: 'Roadmap', icon: Route, isClosable: true },
    { path: '/settings', title: 'Configuració', icon: Settings, isClosable: true },
    { path: '/ai-settings', title: 'Configuració IA', icon: Sparkles, isClosable: true },
    { path: '/prompt-gallery', title: 'Galeria de Prompts', icon: Library, isClosable: true },
    { path: '/my-groups', title: 'Els Meus Grups', icon: Users, isClosable: true },
];


export interface Tab {
    id: string; // Should be the same as the path
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    isClosable: boolean;
    content: ReactNode;
}

interface TabsContextType {
    tabs: Tab[];
    activeTab: string | null;
    openTab: (tabData: Omit<Tab, 'id' | 'content'> & { content?: ReactNode }) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children, initialContent, initialPath }: { children: ReactNode, initialContent: ReactNode, initialPath: string }) {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTabState] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const { user } = useAuth();
    const [lastUser, setLastUser] = useState(user?.uid);

    const getPathKey = (path: string) => {
        const pathParts = path.split('/').filter(p => p && p !== locale);
        if (pathParts.length > 1 && pathParts[0] === 'actions') {
            return `/${pathParts[0]}/[id]`;
        }
        return `/${pathParts.join('/') || 'dashboard'}`;
    }

    const openTab = useCallback((tabData: Omit<Tab, 'id' | 'content'> & { content?: ReactNode }) => {
        const existingTab = tabs.find(t => t.path === tabData.path);
        if (existingTab) {
            if (activeTab !== existingTab.id) {
                setActiveTabState(existingTab.id);
            }
            return;
        }

        let content = tabData.content;
        if (!content) {
            const PageComponent = getPageComponent(tabData.path);
            if (PageComponent) {
                 const params = tabData.path.startsWith('/actions/') ? { id: tabData.path.split('/')[2] } : {};
                 content = <PageComponent params={params} />;
            }
        }
        
        const newTab: Tab = { ...tabData, id: tabData.path, content: content || <div>Not Found</div> };
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTabState(newTab.id);
    }, [tabs, activeTab]);

    useEffect(() => {
        if (user && tabs.length === 0) {
            const pathKey = getPathKey(initialPath);
            const staticTab = staticTabsConfig.find(t => t.path === pathKey);
            openTab({
                path: '/dashboard',
                title: 'Dashboard',
                icon: Home,
                isClosable: false,
                content: initialContent
            });
        }
    }, [user, initialPath, initialContent, openTab, tabs.length]);


    useEffect(() => {
        if (user?.uid !== lastUser) {
            setTabs([]);
            setActiveTabState(null);
            setLastUser(user?.uid);
            router.push(`/${locale}/dashboard`);
        }
    }, [user, lastUser, router, locale]);
    
    const closeTab = (tabId: string) => {
        const tabToCloseIndex = tabs.findIndex(tab => tab.id === tabId);
        if (tabToCloseIndex === -1) return;

        let nextActiveTabId = null;
        if (activeTab === tabId) {
            if (tabs.length > 1) {
                const newIndex = Math.max(0, tabToCloseIndex - 1);
                nextActiveTabId = tabs[newIndex === tabToCloseIndex ? newIndex -1 : newIndex].id;
            }
        }
        
        setTabs(tabs => tabs.filter(t => t.id !== tabId));

        if (nextActiveTabId) {
             setActiveTabState(nextActiveTabId);
        } else if (tabs.length === 1) { // Closing the last tab
             setActiveTabState(null);
        }
    };

    const value = {
        tabs,
        activeTab,
        openTab,
        closeTab,
        setActiveTab: setActiveTabState,
    };

    return (
        <TabsContext.Provider value={value}>
            {children}
        </TabsContext.Provider>
    );
}

export function useTabs() {
    const context = useContext(TabsContext);
    if (context === undefined) {
        throw new Error('useTabs must be used within a TabsProvider');
    }
    return context;
}
