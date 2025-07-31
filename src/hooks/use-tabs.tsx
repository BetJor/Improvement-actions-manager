
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
        const existingTab = tabs.find(t => t.path === tabData.path);
        if (existingTab) {
            if (activeTab !== existingTab.id) {
                setActiveTab(existingTab.id);
            }
            return;
        }
        
        const newTab: Tab = { ...tabData, id: tabData.path };
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTab(newTab.id);
    };

    const closeTab = (tabId: string) => {
        console.log(`[useTabs] Funció closeTab reb el ID: ${tabId}`);
        console.log('[useTabs] Estat actual de les pestanyes:', tabs.map(t => t.id));

        const tabToCloseIndex = tabs.findIndex(tab => tab.id === tabId);
        if (tabToCloseIndex === -1) {
            console.error(`[useTabs] ERROR: No s'ha trobat la pestanya amb ID ${tabId} per a tancar.`);
            return;
        }
        console.log(`[useTabs] La pestanya a tancar es troba a l'índex: ${tabToCloseIndex}`);


        // Filtra la pestanya a tancar
        const newTabs = tabs.filter(tab => tab.id !== tabId);
        console.log(`[useTabs] Nou array de pestanyes després de filtrar:`, newTabs.map(t => t.id));
        
        // Comprova si la pestanya que es tanca és l'activa
        if (activeTab === tabId) {
            let nextActiveTabId: string | null = null;
            if (newTabs.length > 0) {
                // Si hi ha pestanyes, activa la que està a la mateixa posició (que era la següent) o l'anterior
                const newActiveIndex = Math.max(0, tabToCloseIndex - 1);
                nextActiveTabId = newTabs[newActiveIndex].id;
            } else {
                // Si no en queden, torna al dashboard
                nextActiveTabId = '/dashboard';
            }
            
            console.log(`[useTabs] La pestanya tancada era l'activa. Nova pestanya activa serà: ${nextActiveTabId}`);
            if (nextActiveTabId) {
                router.push(nextActiveTabId);
            }
        }
        
        // Finalment, actualitza l'estat amb les noves pestanyes
        setTabs(newTabs);
        console.log(`[useTabs] Estat final de pestanyes establert.`);
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
