
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, ComponentType, useEffect } from 'react';
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
                 if (activeTab !== existingTab.id) {
                    setActiveTabState(existingTab.id);
                }
                return prevTabs;
            }
            const newTab: Tab = { ...tabData, id: tabData.path };
            setActiveTabState(newTab.id);
            return [...prevTabs, newTab];
        });
    };

    const closeTab = (tabId: string) => {
        const tabToCloseIndex = tabs.findIndex(tab => tab.id === tabId);
        if (tabToCloseIndex === -1 || !tabs[tabToCloseIndex].isClosable) {
            return;
        }
    
        // If the closed tab was the active one, navigate away.
        // The useEffect below will handle setting the new active tab.
        if (activeTab === tabId) {
            const newActiveTab = tabs[tabToCloseIndex - 1] || tabs[tabToCloseIndex + 1];
            if (newActiveTab) {
                router.push(newActiveTab.path);
            } else {
                router.push('/'); 
            }
        }
    
        // Update the list of tabs, removing the closed one.
        setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
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
