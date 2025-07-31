
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, ComponentType } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface Tab {
    id: string;
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


export function TabsProvider({ children, initialContent, initialPath }: { children: ReactNode, initialContent: ReactNode, initialPath: string }) {
    
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTabState] = useState<string | null>(null);
    const router = useRouter();

    const setActiveTab = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
            setActiveTabState(tab.id);
            if(window.location.pathname !== tab.path) {
                router.push(tab.path);
            }
        }
    };

    const openTab = (tabData: Omit<Tab, 'id'>) => {
        setTabs(prevTabs => {
            const existingTab = prevTabs.find(t => t.path === tabData.path);
            if (existingTab) {
                return prevTabs;
            }
            const newTab: Tab = { ...tabData, id: tabData.path };
            return [...prevTabs, newTab];
        });
    };

    const closeTab = (tabId: string) => {
        const tabToCloseIndex = tabs.findIndex(t => t.id === tabId);
        if (tabToCloseIndex === -1 || !tabs[tabToCloseIndex].isClosable) return;
        
        let newActiveTabId: string | null = null;
        if (activeTab === tabId) {
            const newActiveTab = tabs[tabToCloseIndex - 1] || tabs[tabToCloseIndex + 1] || null;
            newActiveTabId = newActiveTab ? newActiveTab.id : null;
        }

        const newTabs = tabs.filter(t => t.id !== tabId);
        setTabs(newTabs);

        if (newActiveTabId) {
            setActiveTab(newActiveTabId);
        } else if (newTabs.length > 0 && !newTabs.find(t => t.id === activeTab)) {
            // If the active tab was closed and there's no new active tab logic, default to the last one
            setActiveTab(newTabs[newTabs.length - 1].id);
        } else if (newTabs.length === 0) {
            router.push('/');
        }
    };


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
