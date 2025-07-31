
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, ComponentType } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ListChecks, Settings, Route, Sparkles, Library } from "lucide-react"

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
    openTab: (tabData: Omit<Tab, 'id' | 'content'> & { content: ReactNode }) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);


export function TabsProvider({ children, initialContent, initialPath }: { children: ReactNode, initialContent: ReactNode, initialPath: string }) {
    
    const initialTabId = initialPath.startsWith('/') ? initialPath.substring(1) : initialPath;
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTabState] = useState<string | null>(null);
    const router = useRouter();

    const setActiveTab = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
            setActiveTabState(tab.id);
            router.push(tab.path);
        }
    };

    const openTab = (tabData: Omit<Tab, 'id'>) => {
        const tabId = tabData.path.startsWith('/') ? tabData.path.substring(1) : tabData.path;
        
        setTabs(prevTabs => {
            const existingTab = prevTabs.find(t => t.id === tabId);
            if (existingTab) {
                return prevTabs; // No changes if tab already exists
            }
            const newTab: Tab = { ...tabData, id: tabId };
            return [...prevTabs, newTab];
        });

        setActiveTabState(tabId);
    };

    const closeTab = (tabId: string) => {
        const tabToCloseIndex = tabs.findIndex(t => t.id === tabId);
        if (tabToCloseIndex === -1 || !tabs[tabToCloseIndex].isClosable) return;
        
        const newTabs = tabs.filter(t => t.id !== tabId);
        
        if (activeTab === tabId) {
            const newActiveTab = newTabs[tabToCloseIndex - 1] || newTabs[0];
            if (newActiveTab) {
                setActiveTab(newActiveTab.id);
            } else {
                setActiveTabState(null);
                 router.push('/');
            }
        }
        setTabs(newTabs);
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
