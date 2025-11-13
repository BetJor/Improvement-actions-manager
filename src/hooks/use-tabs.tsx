

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { Loader2 } from 'lucide-react';
import { useActionState } from './use-action-state';

// Import all page components that can be opened in a tab
import DashboardPage from '@/app/dashboard/page';
import ActionsPage from '@/app/actions/page';
import NewActionPage from '@/app/actions/new/page';
import SettingsPage from '@/app/settings/page';
import AiSettingsPage from '@/app/ai-settings/page';
import MyGroupsPage from '@/app/my-groups/page';
import ActionDetailPage from '@/app/actions/[id]/page';
import UserManagementPage from '@/app/user-management/page';
import ReportsPage from '@/app/reports/page';
import FirestoreRulesPage from '@/app/firestore-rules/page';
import WorkflowPage from '@/app/workflow/page';
import DataLoadPage from '@/app/data-load/page'; // Import the new page
import { getActionById, getActions, getActionTypes, getCategories, getSubcategories, getAffectedAreas, getCenters, getResponsibilityRoles } from '@/lib/data';
import { ActionDetailsTab } from '@/components/action-details-tab';


import { Home, ListChecks, Settings, Sparkles, Library, Route, Users, BarChart3, GanttChartSquare, FileLock2, UploadCloud } from 'lucide-react';

const pageComponentMapping: { [key: string]: { component: React.ComponentType<any>, title: string, icon: React.ElementType, isClosable: boolean} | undefined } = {
    '/dashboard': { component: DashboardPage, title: 'Panel de Control', icon: Home, isClosable: false },
    '/actions': { component: ActionsPage, title: 'Acciones', icon: ListChecks, isClosable: true },
    '/actions/new': { component: NewActionPage, title: 'Nueva Acción', icon: ListChecks, isClosable: true },
    '/settings': { component: SettingsPage, title: 'Configuración', icon: Settings, isClosable: true },
    '/workflow': { component: WorkflowPage, title: 'Workflow', icon: GanttChartSquare, isClosable: true },
    '/ai-settings': { component: AiSettingsPage, title: 'Configuración IA', icon: Sparkles, isClosable: true },
    '/reports': { component: ReportsPage, title: 'Informes', icon: BarChart3, isClosable: true },
    '/my-groups': { component: MyGroupsPage, title: 'Mis Grupos', icon: Users, isClosable: true },
    '/user-management': { component: UserManagementPage, title: 'Gestión de Usuarios', icon: Users, isClosable: true },
    '/firestore-rules': { component: FirestoreRulesPage, title: 'Reglas de Firestore', icon: FileLock2, isClosable: true },
    '/data-load': { component: DataLoadPage, title: 'Càrrega de Dades', icon: UploadCloud, isClosable: true }, // Add new page to mapping
};

const getPageComponentInfo = (path: string): { component?: React.ComponentType<any>, title: string, icon: React.ElementType, isClosable: boolean, loader?: () => Promise<ReactNode> } | null => {
  const cleanPath = path.split('?')[0];

  if (pageComponentMapping[cleanPath]) {
    return pageComponentMapping[cleanPath]!;
  }
  
  const actionMatch = cleanPath.match(/^\/actions\/([^/]+)$/);
  if (actionMatch) {
    const actionId = actionMatch[1];
    return {
        title: `Acción...`, // Temporary title
        icon: GanttChartSquare,
        isClosable: true,
        loader: async () => {
            const actionData = await getActionById(actionId);
            if (!actionData) throw new Error("Action not found");
            
            const [types, cats, subcats, areas, centers, roles] = await Promise.all([
                getActionTypes(), getCategories(), getSubcategories(), getAffectedAreas(), getCenters(), getResponsibilityRoles()
            ]);
            const masterData = { ambits: { data: types }, origins: { data: cats }, classifications: { data: subcats }, affectedAreas: areas, centers: { data: centers }, responsibilityRoles: { data: roles } };
            
            return <ActionDetailsTab initialAction={actionData} masterData={masterData} />;
        },
        // We need a way to update the title after loading
        // This will be handled inside the openTab function.
    };
  }

  return null;
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
    const { setActions } = useActionState();
    const [lastUser, setLastUser] = useState(user?.uid);
    const router = useRouter();

    const reloadAllActions = useCallback(async () => {
        console.log("Reloading all actions for all tabs...");
        try {
            const freshActions = await getActions();
            setActions(freshActions);
        } catch (error) {
            console.error("Failed to reload actions:", error);
        }
    }, [setActions]);

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

                tabData.loader().then(loadedContent => {
                    // Extract actionId from title if it's an ActionDetailsTab
                    let finalTitle = tabData.title;
                    if (loadedContent && (loadedContent as any).type === ActionDetailsTab) {
                        const action = (loadedContent as any).props.initialAction;
                        if (action) {
                            finalTitle = `Acción ${action.actionId}`;
                        }
                    }

                    setTabs(currentTabs => currentTabs.map(t => 
                        t.id === tabId ? { ...t, content: loadedContent, title: finalTitle, isLoading: false } : t
                    ));
                }).catch(error => {
                    console.error("Error loading tab content:", error);
                    setTabs(currentTabs => currentTabs.map(t => 
                        t.id === tabId ? { ...t, content: <div>Error al cargar la acción. Es posible que no exista o no tengas permisos.</div>, isLoading: false } : t
                    ));
                });

            } else {
                 const pageInfo = getPageComponentInfo(tabData.path);
                 const PageComponent = pageInfo?.component;
                if (!PageComponent) {
                    console.error(`No page component found for path: ${tabData.path}`);
                    newTab = { ...tabData, id: tabId, content: <div>Not Found</div>, isLoading: false };
                } else {
                    newTab = { ...tabData, id: tabId, content: <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>, isLoading: true };
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
            const pageInfo = getPageComponentInfo(initialPath);
            if (pageInfo) {
                openTab({
                    path: initialPath,
                    title: pageInfo.title,
                    icon: pageInfo.icon,
                    isClosable: pageInfo.isClosable,
                    loader: pageInfo.loader
                });
            } else {
                // Fallback to dashboard if path is invalid
                openTab({
                    path: `/dashboard`,
                    title: 'Panel de Control',
                    icon: Home,
                    isClosable: false,
                });
            }
        }
    }, [user, tabs.length, openTab, initialPath]);


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
            openTab({ path: `/dashboard`, title: 'Panel de Control', icon: Home, isClosable: false });
        }
        
        // Reload actions after closing a tab to reflect changes
        reloadAllActions();
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
