
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Tab as TabType } from '@/lib/types';
import ActionDetailPage from '@/app/[locale]/actions/[id]/page';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { AppRouterContext, LayoutRouterContext, GlobalLayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useTranslations } from 'next-intl';

interface Tab extends TabType {
    content?: ReactNode;
}

interface TabsContextType {
  tabs: Tab[];
  activeTab: Tab | null;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function MockRouterProvider({ children, params }: { children: React.ReactNode, params: any }) {
    const router = useContext(AppRouterContext);
    const layoutRouter = useContext(LayoutRouterContext);
    const globalLayoutRouter = useContext(GlobalLayoutRouterContext);

    if (!router || !layoutRouter || !globalLayoutRouter) {
        return null;
    }
    
    const mockLayoutRouter = {
        ...layoutRouter,
        params: params,
    };

    return (
        <AppRouterContext.Provider value={router}>
            <GlobalLayoutRouterContext.Provider value={globalLayoutRouter}>
                 <LayoutRouterContext.Provider value={mockLayoutRouter}>
                    {children}
                </LayoutRouterContext.Provider>
            </GlobalLayoutRouterContext.Provider>
        </AppRouterContext.Provider>
    );
}


export function TabsProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AppSidebar");
  const currentParams = useParams();
  const pathname = usePathname();

  const getInitialTabs = (initialContent: React.ReactNode) => {
    const dashboardTab: Tab = {
      id: 'dashboard',
      title: t('dashboard'),
      href: `/${currentParams.locale}/dashboard`,
      isClosable: false,
      content: initialContent,
    };
    return [dashboardTab];
  };

  const [tabs, setTabs] = useState<Tab[]>(() => getInitialTabs(children));
  const [activeTab, setActiveTabState] = useState<Tab | null>(tabs[0]);

  useEffect(() => {
    if (activeTab && activeTab.href !== pathname) {
        // Prevent URL change if the active tab is for a static page that was just opened
        if(activeTab.id.startsWith('/')) {
             window.history.pushState({}, '', activeTab.href);
        } else {
             window.history.pushState({}, '', activeTab.href);
        }
    }
  }, [activeTab, pathname]);
  
  const addTab = (newTab: Tab) => {
    setTabs(prevTabs => {
        const existingTab = prevTabs.find((tab) => tab.id === newTab.id);
        if (existingTab) {
            setActiveTabState(existingTab);
            return prevTabs;
        }

        setActiveTabState(newTab);
        return [...prevTabs, newTab];
    });
  };

  const removeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      const tabToRemoveIndex = prevTabs.findIndex((tab) => tab.id === tabId);
      if (tabToRemoveIndex === -1) return prevTabs;

      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);
      
      if (activeTab?.id === tabId) {
        if (newTabs.length > 0) {
          const newActiveIndex = Math.max(0, tabToRemoveIndex - 1);
          setActiveTabState(newTabs[newActiveIndex]);
        } else {
            // This case should not happen as dashboard is not closable
            setActiveTabState(null);
            window.history.pushState({}, '', `/${currentParams.locale}/dashboard`);
        }
      }
      return newTabs;
    });
  };

  const setActiveTab = (tabId: string) => {
     const tabToActivate = tabs.find(tab => tab.id === tabId);
     if(tabToActivate) {
        setActiveTabState(tabToActivate);
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
