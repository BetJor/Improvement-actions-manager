
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

// Importa els components de pàgina que vols renderitzar
import DashboardPage from '@/app/[locale]/dashboard/page';
import ActionsPage from '@/app/[locale]/actions/page';
import NewActionPage from '@/app/[locale]/actions/new/page';
import ActionDetailPage from '@/app/[locale]/actions/[id]/page';
import SettingsPage from '@/app/[locale]/settings/page';
import AiSettingsPage from '@/app/[locale]/ai-settings/page';
import PromptGalleryPage from '@/app/[locale]/prompt-gallery/page';
import RoadmapPage from '@/app/[locale]/roadmap/page';

import { Home, ListChecks, Settings, Sparkles, Library, Route, FilePlus, GanttChartSquare } from 'lucide-react';

const pageComponentMapping: { [key: string]: React.ComponentType<any> } = {
    '/dashboard': DashboardPage,
    '/actions': ActionsPage,
    '/actions/new': NewActionPage,
    '/settings': SettingsPage,
    '/ai-settings': AiSettingsPage,
    '/prompt-gallery': PromptGalleryPage,
    '/roadmap': RoadmapPage,
};

const staticTabsConfig = [
    { path: '/dashboard', title: 'Dashboard', icon: Home, isClosable: false },
    { path: '/actions', title: 'Accions', icon: ListChecks, isClosable: true },
    { path: '/settings', title: 'Configuració', icon: Settings, isClosable: true },
    { path: '/ai-settings', title: 'Configuració IA', icon: Sparkles, isClosable: true },
    { path: '/prompt-gallery', title: 'Galeria de Prompts', icon: Library, isClosable: true },
    { path: '/roadmap', title: 'Roadmap', icon: Route, isClosable: true },
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
    openTab: (tabData: Omit<Tab, 'id'>) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children }: { children: ReactNode }) {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTabState] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const [lastUser, setLastUser] = useState(user?.uid);


    useEffect(() => {
        if (user?.uid !== lastUser) {
            setTabs([]);
            setActiveTabState(null);
            setLastUser(user?.uid);
            router.push('/dashboard');
        }
    }, [user, lastUser, router]);

    const setActiveTab = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
            console.log(`[useTabs] setActiveTab: Canviant a pestanya ${tabId}`);
            setActiveTabState(tab.id);
            if (window.location.pathname !== tab.path) {
                console.log(`[useTabs] setActiveTab: Navegant a la ruta ${tab.path}`);
                router.push(tab.path);
            }
        } else {
             console.warn(`[useTabs] setActiveTab: S'ha intentat activar una pestanya no existent amb ID ${tabId}`);
        }
    };
    
    const openTab = (tabData: Omit<Tab, 'id'>) => {
        const existingTab = tabs.find(t => t.path === tabData.path);
        if (existingTab) {
            if (activeTab !== existingTab.id) {
                setActiveTab(existingTab.id);
            }
            return;
        }
        
        const newTab: Tab = { ...tabData, id: tabData.path };
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTabState(newTab.id);
    };

    const closeTab = (tabId: string) => {
        console.log(`[useTabs] closeTab: Rebuda crida per tancar ${tabId}. Pestanya activa actual: ${activeTab}`);
        const tabToCloseIndex = tabs.findIndex(tab => tab.id === tabId);

        if (tabToCloseIndex === -1) {
            console.error(`[useTabs] closeTab: No s'ha trobat la pestanya amb ID ${tabId} per tancar.`);
            return;
        }
        
        console.log(`[useTabs] closeTab: La pestanya a tancar es troba a l'índex ${tabToCloseIndex}.`);
        
        const updatedTabs = tabs.filter(t => t.id !== tabId);
        console.log(`[useTabs] closeTab: Nou array de pestanyes després de filtrar:`, updatedTabs.map(t => t.id));

        if (activeTab === tabId) {
            console.log(`[useTabs] closeTab: La pestanya tancada era l'activa.`);
            let nextActiveTab: Tab | undefined;
            if (updatedTabs.length > 0) {
                // Prioritza la pestanya de l'esquerra
                nextActiveTab = updatedTabs[Math.max(0, tabToCloseIndex - 1)];
            }
            
            console.log(`[useTabs] closeTab: La següent pestanya activa serà:`, nextActiveTab?.id || 'cap');

            setTabs(updatedTabs);
            if (nextActiveTab) {
                setActiveTab(nextActiveTab.id);
            } else {
                console.log(`[useTabs] closeTab: No queden pestanyes, es navega a /dashboard.`);
                setActiveTabState('/dashboard');
                router.push('/dashboard');
            }
        } else {
            console.log(`[useTabs] closeTab: La pestanya tancada NO era l'activa. Només s'actualitza la llista.`);
            setTabs(updatedTabs);
        }
    };


    useEffect(() => {
        const pathWithoutLocale = pathname.split('/').slice(2).join('/');
        const fullPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/dashboard';

        const existingTab = tabs.find(t => t.id === fullPath);
        
        if (existingTab) {
            if(activeTab !== existingTab.id) {
               setActiveTabState(existingTab.id);
            }
            return;
        }

        let tabData: Omit<Tab, 'id'> | null = null;
        
        const staticTab = staticTabsConfig.find(t => t.path === fullPath);
        if (staticTab) {
            tabData = {
                path: staticTab.path,
                title: staticTab.title,
                icon: staticTab.icon,
                isClosable: staticTab.isClosable,
                content: React.createElement(pageComponentMapping[staticTab.path])
            };
        } else {
             const actionIdMatch = fullPath.match(/\/actions\/(.+)/);
             if (fullPath === '/actions/new') {
                 tabData = {
                    path: '/actions/new',
                    title: 'Nova Acció',
                    icon: FilePlus,
                    isClosable: true,
                    content: React.createElement(NewActionPage)
                 };
             } else if (actionIdMatch) {
                 const id = actionIdMatch[1];
                 tabData = {
                    path: `/actions/${id}`,
                    title: `Acció ${id.substring(0, 6)}...`,
                    icon: GanttChartSquare,
                    isClosable: true,
                    content: React.createElement(ActionDetailPage)
                 }
             }
        }
        
        if (tabData) {
            const newTab: Tab = { ...tabData, id: tabData.path };
            setTabs(prev => {
                if (prev.some(t => t.id === newTab.id)) return prev;
                return [...prev, newTab]
            });
            setActiveTabState(newTab.id);
        }
    }, [pathname]);

    useEffect(() => {
        // Aquest useEffect només s'encarrega de la navegació quan l'activeTab canvia.
        const activeTabData = tabs.find(t => t.id === activeTab);
        if (activeTabData && activeTabData.path !== pathname) {
           // No naveguem aqui per evitar conflictes
        }
    }, [activeTab, tabs, pathname, router]);

    return (
        <TabsContext.Provider value={{ tabs, activeTab, openTab, closeTab, setActiveTab }}>
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
