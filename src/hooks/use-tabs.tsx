

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';

// Import all page components that can be opened in a tab
import DashboardPage from '@/app/[locale]/dashboard/page';
import ActionsPage from '@/app/[locale]/actions/page';
import NewActionPage from '@/app/[locale]/actions/new/page';
import SettingsPage from '@/app/[locale]/settings/page';
import AiSettingsPage from '@/app/[locale]/ai-settings/page';
import PromptGalleryPage from '@/app/[locale]/prompt-gallery/page';
import RoadmapPage from '@/app/[locale]/roadmap/page';
import BacklogPage from '@/app/[locale]/backlog/page';
import MyGroupsPage from '@/app/[locale]/my-groups/page';
import ActionDetailPage from '@/app/[locale]/actions/[id]/page';
import UserManagementPage from '@/app/[locale]/user-management/page';
import ReportsPage from '@/app/[locale]/reports/page';
import IntranetTestPage from '@/app/[locale]/intranet-test/page';
import FirestoreRulesPage from '@/app/[locale]/firestore-rules/page';
import WorkflowPage from '@/app/[locale]/workflow/page';
import { getActionById, getActionTypes, getCategories, getSubcategories, getAffectedAreas } from '@/lib/data';

import { Home, ListChecks, Settings, Sparkles, Library, Route, Users, BarChart3, GanttChartSquare } from 'lucide-react';

const pageComponentMapping: { [key: string]: React.ComponentType<any> | undefined } = {
    '/dashboard': DashboardPage,
    '/actions': ActionsPage,
    '/actions/new': NewActionPage,
    '/settings': SettingsPage,
    '/workflow': WorkflowPage,
    '/ai-settings': AiSettingsPage,
    '/prompt-gallery': PromptGalleryPage,
    '/roadmap': RoadmapPage,
    '/backlog': BacklogPage,
    '/reports': ReportsPage,
    '/my-groups': MyGroupsPage,
    '/user-management': UserManagementPage,
    '/intranet-test': IntranetTestPage,
    '/firestore-rules': FirestoreRulesPage,
};

const getPageComponent = (path: string): React.ComponentType<any> | undefined => {
  const locales = ['ca', 'es'];
  // Clean the path of query parameters
  let cleanPath = path.split('?')[0];

  // Remove locale prefix if it exists
  const pathSegments = cleanPath.split('/').filter(Boolean);
  if (locales.includes(pathSegments[0])) {
    // Reconstruct the path without the locale
    cleanPath = `/${pathSegments.slice(1).join('/')}`;
  }

  // Handle root case which should map to dashboard
  if (cleanPath === '/') {
    cleanPath = '/dashboard';
  }
  
  if (pageComponentMapping[cleanPath]) {
    return pageComponentMapping[cleanPath];
  }
  // Fallback for dynamic action detail pages
  if (cleanPath.startsWith('/actions/')) {
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
    closeCurrentTab: () => void;
    setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children, initialPath }: { children: ReactNode, initialPath: string }) {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTabState] = useState<string | null>(null);
    const { user } = useAuth();
    const [lastUser, setLastUser] = useState(user?.uid);
    const router = useRouter();
    const locale = useLocale();

    const setActiveTab = useCallback((tabId: string) => {
        setActiveTabState(tabId);
    }, []);

    const openTab = useCallback((tabData: TabInput) => {
        const tabId = tabData.path;

        setTabs(prevTabs => {
            const existingTab = prevTabs.find(t => t.id === tabId);
            if (existingTab) {
                if (activeTab !== tabId) {
                    setActiveTab(tabId);
                }
                return prevTabs;
            }

            let newTab: Tab;
            if (tabData.loader) {
                newTab = { 
                    ...tabData, 
                    id: tabId, 
                    content: <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>, 
                    isLoading: true 
                };

                // DEMO: Simulate network delay
                setTimeout(() => {
                    tabData.loader!().then(loadedContent => {
                        setTabs(currentTabs => currentTabs.map(t => 
                            t.id === tabId ? { ...t, content: loadedContent, isLoading: false } : t
                        ));
                    }).catch(error => {
                        console.error("Error loading tab content:", error);
                        setTabs(currentTabs => currentTabs.map(t => 
                            t.id === tabId ? { ...t, content: <div>Error loading content.</div>, isLoading: false } : t
                        ));
                    });
                }, 500);

            } else {
                const PageComponent = getPageComponent(tabData.path);
                if (!PageComponent) {
                    console.error(`No page component found for path: ${tabData.path}`);
                    newTab = { ...tabData, id: tabId, content: <div>Not Found</div>, isLoading: false };
                } else {
                    newTab = { ...tabData, id: tabId, content: <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>, isLoading: true };
                     // DEMO: Simulate network delay
                    setTimeout(() => {
                        setTabs(currentTabs => currentTabs.map(t => 
                            t.id === tabId ? { ...t, content: <PageComponent />, isLoading: false } : t
                        ));
                    }, 500);
                }
            }
            
            setActiveTab(newTab.id);
            return [...prevTabs, newTab];
        });
    }, [activeTab, setActiveTab]);
    
     useEffect(() => {
        if (user && tabs.length === 0) {
            openTab({
                path: `/${locale}/dashboard`,
                title: 'Dashboard',
                icon: Home,
                isClosable: false,
            });
        }
    }, [user, tabs.length, locale, openTab]);


    useEffect(() => {
        if (user?.uid !== lastUser) {
            setTabs([]);
            setActiveTabState(null);
            setLastUser(user?.uid);
        }
    }, [user, lastUser]);
    
    const closeTab = (tabId: string) => {
        let nextActiveTabId: string | null = null;
        
        const index = tabs.findIndex(tab => tab.id === tabId);
        if (index === -1) return;
        
        const newTabs = tabs.filter(t => t.id !== tabId);

        if (activeTab === tabId) {
            if (newTabs.length > 0) {
                const newIndex = index === 0 ? 0 : index - 1;
                nextActiveTabId = newTabs[newIndex].id;
            } else {
                nextActiveTabId = null; // No more tabs
            }
        }
        
        setTabs(newTabs);

        if (nextActiveTabId) {
            setActiveTab(nextActiveTabId);
        } else if (newTabs.length === 0) {
            setActiveTabState(null);
            openTab({ path: `/${locale}/dashboard`, title: 'Dashboard', icon: Home, isClosable: false });
        }
    };

    const closeCurrentTab = () => {
        if (activeTab) {
            closeTab(activeTab);
        }
    }

    const value = {
        tabs,
        activeTab,
        openTab,
        closeTab,
        closeCurrentTab,
        setActiveTab,
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
