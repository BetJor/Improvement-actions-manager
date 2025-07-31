
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

const initialTabs: Omit<Tab, 'id' | 'content'>[] = [
    { title: 'Dashboard', path: '/dashboard', icon: Home, isClosable: false },
    { title: 'Actions', path: '/actions', icon: ListChecks, isClosable: false },
    { title: 'Settings', path: '/settings', icon: Settings, isClosable: false },
    { title: 'AI Settings', path: '/ai-settings', icon: Sparkles, isClosable: false },
    { title: 'Prompt Gallery', path: '/prompt-gallery', icon: Library, isClosable: false },
    { title: 'Roadmap', path: '/roadmap', icon: Route, isClosable: false },
];

export function TabsProvider({ children, initialContent, initialPath }: { children: ReactNode, initialContent: ReactNode, initialPath: string }) {
    
    const initialTabId = initialPath.substring(1); // e.g. 'dashboard'
    const initialTabDetails = initialTabs.find(t => t.path === initialPath) || { title: 'Dashboard', path: '/dashboard', icon: Home, isClosable: false};

    const [tabs, setTabs] = useState<Tab[]>([
        { 
            id: initialTabId, 
            ...initialTabDetails,
            content: initialContent
        }
    ]);

    const [activeTab, setActiveTabState] = useState<string | null>(initialTabId);
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
        const existingTab = tabs.find(t => t.id === tabId);

        if (existingTab) {
            setActiveTab(existingTab.id);
        } else {
            const newTab: Tab = { ...tabData, id: tabId };
            setTabs(prevTabs => [...prevTabs, newTab]);
            setActiveTab(newTab.id);
        }
    };

    const closeTab = (tabId: string) => {
        const tabToCloseIndex = tabs.findIndex(t => t.id === tabId);
        if (tabToCloseIndex === -1) return;
        
        const newTabs = tabs.filter(t => t.id !== tabId);
        
        if (activeTab === tabId) {
            const newActiveTab = newTabs[tabToCloseIndex - 1] || newTabs[0];
            if (newActiveTab) {
                setActiveTab(newActiveTab.id);
            } else {
                setActiveTabState(null);
                // Optionally, navigate to a default route like '/'
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
