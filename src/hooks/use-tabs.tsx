
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';


import DashboardPage from '@/app/[locale]/dashboard/page';
import ActionsPage from '@/app/[locale]/actions/page';
import NewActionPage from '@/app/[locale]/actions/new/page';
import SettingsPage from '@/app/[locale]/settings/page';
import AiSettingsPage from '@/app/[locale]/ai-settings/page';
import PromptGalleryPage from '@/app/[locale]/prompt-gallery/page';
import RoadmapPage from '@/app/[locale]/roadmap/page';
import MyGroupsPage from '@/app/[locale]/my-groups/page';
import ActionDetailPage from '@/app/[locale]/actions/[id]/page';

import { Home, ListChecks, Settings, Sparkles, Library, Route, Users } from 'lucide-react';

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
  // Fallback for dynamic action detail pages
  if (path.startsWith('/actions/')) {
    return ActionDetailPage;
  }
  return undefined;
};

export interface Tab {
    id: string; 
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    isClosable: boolean;
    content: ReactNode;
    isLoading: boolean;
}

type TabInput = Omit<Tab, 'id' | 'content' | 'isLoading'> & { 
    content?: ReactNode;
    loader?: () => Promise<ReactNode>;
};

interface TabsContextType {
    tabs: Tab[];
    activeTab: string | null;
    openTab: (tabData: TabInput) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children, initialPath }: { children: ReactNode, initialPath: string }) {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTabState] = useState<string | null>(null);
    const { user } = useAuth();
    const [lastUser, setLastUser] = useState(user?.uid);

    const openTab = useCallback((tabData: TabInput) => {
        const tabId = tabData.path;

        setTabs(prevTabs => {
            const existingTab = prevTabs.find(t => t.id === tabId);
            if (existingTab) {
                if (activeTab !== tabId) {
                    setActiveTabState(tabId);
                }
                return prevTabs;
            }

            let newTab: Tab;
            if (tabData.loader) {
                // Tab with async content
                newTab = { 
                    ...tabData, 
                    id: tabId, 
                    content: <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>, 
                    isLoading: true 
                };

                // Start loading content
                tabData.loader().then(loadedContent => {
                    setTabs(currentTabs => currentTabs.map(t => 
                        t.id === tabId ? { ...t, content: loadedContent, isLoading: false } : t
                    ));
                }).catch(error => {
                    console.error("Error loading tab content:", error);
                    setTabs(currentTabs => currentTabs.map(t => 
                        t.id === tabId ? { ...t, content: <div>Error loading content.</div>, isLoading: false } : t
                    ));
                });
            } else {
                 // Tab with static content
                const PageComponent = getPageComponent(tabData.path);
                const content = PageComponent ? <PageComponent /> : <div>Not Found</div>;
                newTab = { ...tabData, id: tabId, content, isLoading: false };
            }

            setActiveTabState(newTab.id);
            return [...prevTabs, newTab];
        });
    }, [activeTab]);
    
    useEffect(() => {
        if (user && tabs.length === 0 && !activeTab) {
            openTab({
                path: '/dashboard',
                title: 'Dashboard',
                icon: Home,
                isClosable: false,
            });
        }
    }, [user, tabs.length, activeTab, openTab]);


    useEffect(() => {
        if (user?.uid !== lastUser) {
            setTabs([]);
            setActiveTabState(null);
            setLastUser(user?.uid);
        }
    }, [user, lastUser]);
    
    const closeTab = (tabId: string) => {
        let nextActiveTabId: string | null = null;
        
        setTabs(prevTabs => {
            const tabToCloseIndex = prevTabs.findIndex(tab => tab.id === tabId);
            if (tabToCloseIndex === -1) return prevTabs;

            if (activeTab === tabId) {
                if (prevTabs.length > 1) {
                    const newIndex = tabToCloseIndex === 0 ? 1 : tabToCloseIndex - 1;
                    nextActiveTabId = prevTabs[newIndex].id;
                }
            }
            
            return prevTabs.filter(t => t.id !== tabId);
        });

        if (nextActiveTabId) {
             setActiveTabState(nextActiveTabId);
        } else if (tabs.length === 1) { 
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
