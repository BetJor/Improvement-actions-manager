
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
        const tabToCloseIndex = tabs.findIndex((tab) => tab.id === tabId);
        if (tabToCloseIndex === -1 || !tabs[tabToCloseIndex].isClosable) {
            return; // No es pot tancar o no s'ha trobat
        }
    
        // Si la pestanya que es tanca és l'activa, determina quina serà la propera pestanya activa
        let nextActiveTabPath: string | null = null;
        if (activeTab === tabId) {
            const newActiveTab = tabs[tabToCloseIndex - 1] || tabs[tabToCloseIndex + 1];
            if (newActiveTab) {
                nextActiveTabPath = newActiveTab.path;
            } else if (tabs.length > 1) {
                // fallback a la primera pestanya si alguna cosa va malament
                nextActiveTabPath = tabs[0].path;
            }
        }
    
        // Actualitza la llista de pestanyes
        const newTabs = tabs.filter((tab) => tab.id !== tabId);
        setTabs(newTabs);
    
        // Si hem tancat la pestanya activa i n'hi ha una de nova, navega a ella
        if (nextActiveTabPath) {
            router.push(nextActiveTabPath);
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
