
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, ComponentType, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

export interface Tab {
    id: string; // Should be the same as the path
    title: string;
    path: string;
    icon: ComponentType<{ className?: string }>;
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
        // Clear tabs if user changes
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
            setActiveTabState(tab.id);
            if (window.location.pathname !== tab.path) {
                router.push(tab.path);
            }
        }
    };

    const openTab = (tabData: Omit<Tab, 'id'>) => {
        setTabs(prevTabs => {
            const existingTab = prevTabs.find(t => t.path === tabData.path);
            if (existingTab) {
                if (activeTab !== existingTab.id) {
                    setActiveTabState(existingTab.id);
                }
                return prevTabs;
            }
            const newTab: Tab = { ...tabData, id: tabData.path };
            return [...prevTabs, newTab];
        });
        setActiveTabState(tabData.path);
    };

    const closeTab = (tabId: string) => {
        const tabToCloseIndex = tabs.findIndex(tab => tab.id === tabId);
        if (tabToCloseIndex === -1) return;

        let newActiveTabId: string | null = null;
        
        // Determine the next active tab *before* closing the current one
        if (activeTab === tabId) {
            // If there's a tab to the right, make it active
            if (tabToCloseIndex < tabs.length - 1) {
                newActiveTabId = tabs[tabToCloseIndex + 1].id;
            } 
            // Otherwise, if there's a tab to the left, make it active
            else if (tabToCloseIndex > 0) {
                newActiveTabId = tabs[tabToCloseIndex - 1].id;
            }
        }

        // Remove the tab from the list
        setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));

        // Navigate if the active tab was closed
        if (newActiveTabId) {
            setActiveTabState(newActiveTabId);
            const newActiveTab = tabs.find(t => t.id === newActiveTabId);
            if(newActiveTab) {
                 router.push(newActiveTab.path);
            }
        } else if (tabs.length === 1 && activeTab === tabId) {
             // If it was the last tab, navigate to dashboard
            router.push('/dashboard');
        }
    };
    
    // Effect to set active tab from pathname
    useEffect(() => {
        const currentTab = tabs.find(t => t.path === pathname);
        if (currentTab) {
            setActiveTabState(currentTab.id);
        }
    }, [pathname, tabs]);


    const value = useMemo(() => ({
        tabs,
        activeTab,
        openTab,
        closeTab,
        setActiveTab,
    }), [tabs, activeTab]);

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
