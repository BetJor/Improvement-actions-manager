
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Tab as TabType } from '@/lib/types';
import ActionDetailPage from '@/app/[locale]/actions/[id]/page';
import { useParams } from 'next/navigation';

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

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTabState] = useState<Tab | null>(null);
  const params = useParams();
  
  const addTab = (newTab: Omit<Tab, 'content'>) => {
    setTabs((prevTabs) => {
        // Check if tab already exists
        if (prevTabs.find((tab) => tab.id === newTab.id)) {
             setActiveTabState(prevTabs.find((tab) => tab.id === newTab.id) || null);
            return prevTabs;
        }

        const actionId = newTab.id;
        const content = <ActionDetailPage />;

        const tabWithContent: Tab = { ...newTab, content };
        setActiveTabState(tabWithContent);
        return [...prevTabs, tabWithContent];
    });
  };

  const removeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      const tabToRemoveIndex = prevTabs.findIndex((tab) => tab.id === tabId);
      if (tabToRemoveIndex === -1) return prevTabs;

      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

      // If the removed tab was the active one, set a new active tab
      if (activeTab?.id === tabId) {
        if (newTabs.length === 0) {
          setActiveTabState(null);
        } else {
          // Activate the previous tab, or the first one if the removed was the first
          const newActiveIndex = Math.max(0, tabToRemoveIndex - 1);
          setActiveTabState(newTabs[newActiveIndex]);
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
