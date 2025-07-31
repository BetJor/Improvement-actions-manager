
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Tab as TabType } from '@/lib/types';
import ActionDetailPage from '@/app/[locale]/actions/[id]/page';
import { useParams } from 'next/navigation';
import { AppRouterContext, LayoutRouterContext, GlobalLayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface Tab extends TabType {
    content?: ReactNode;
}

interface TabsContextType {
  tabs: Tab[];
  activeTab: Tab | null;
  addTab: (tab: Omit<Tab, 'content'>) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// This is a workaround to provide router context to components rendered in tabs
function MockRouterProvider({ children, params }: { children: React.ReactNode, params: any }) {
    const router = useContext(AppRouterContext);
    const layoutRouter = useContext(LayoutRouterContext);
    const globalLayoutRouter = useContext(GlobalLayoutRouterContext);

    // If any of the essential contexts are null, we can't render
    if (!router || !layoutRouter || !globalLayoutRouter) {
        // This can happen on initial load, return null or a loader
        return null;
    }
    
    // Create a mock layout router context that includes the new params
    const mockLayoutRouter = {
        ...layoutRouter,
        childNodes: new Map(layoutRouter.childNodes),
        tree: [...layoutRouter.tree],
        url: `/actions/${params.id}`,
    };

    // The key is to provide a mock LayoutRouterContext with the correct params
    return (
        <AppRouterContext.Provider value={router}>
            <GlobalLayoutRouterContext.Provider value={globalLayoutRouter}>
                 <LayoutRouterContext.Provider value={{...mockLayoutRouter, params: params}}>
                    {children}
                </LayoutRouterContext.Provider>
            </GlobalLayoutRouterContext.Provider>
        </AppRouterContext.Provider>
    );
}


export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTabState] = useState<Tab | null>(null);
  const currentParams = useParams();
  
  const addTab = (newTab: Omit<Tab, 'content'>) => {
    setTabs((prevTabs) => {
        // Check if tab already exists
        if (prevTabs.find((tab) => tab.id === newTab.id)) {
             const existingTab = prevTabs.find((tab) => tab.id === newTab.id) || null
             setActiveTabState(existingTab);
             // Also update URL for consistency
             window.history.pushState({}, '', existingTab?.href);
             return prevTabs;
        }

        const actionId = newTab.id;
        const content = (
            <MockRouterProvider params={{ locale: currentParams.locale, id: actionId }}>
                <ActionDetailPage />
            </MockRouterProvider>
        );

        const tabWithContent: Tab = { ...newTab, content };
        setActiveTabState(tabWithContent);
        // Also update URL for consistency
        window.history.pushState({}, '', tabWithContent.href);
        return [...prevTabs, tabWithContent];
    });
  };

  const removeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      const tabToRemoveIndex = prevTabs.findIndex((tab) => tab.id === tabId);
      if (tabToRemoveIndex === -1) return prevTabs;

      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);
      
      let newActiveTab: Tab | null = null;
      if (activeTab?.id === tabId) {
        if (newTabs.length > 0) {
          const newActiveIndex = Math.max(0, tabToRemoveIndex - 1);
          newActiveTab = newTabs[newActiveIndex];
        }
        setActiveTabState(newActiveTab);
        window.history.pushState({}, '', newActiveTab?.href || `/${currentParams.locale}/dashboard`);
      }
      return newTabs;
    });
  };

  const setActiveTab = (tabId: string) => {
     const tabToActivate = tabs.find(tab => tab.id === tabId);
     if(tabToActivate) {
        setActiveTabState(tabToActivate);
        window.history.pushState({}, '', tabToActivate.href);
     }
  };

  return (
    <TabsContext.Provider value={{ tabs, activeTab, addTab, removeTab, setActiveTab }}>
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
