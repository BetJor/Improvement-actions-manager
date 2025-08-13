
"use client"

import { useState, useEffect, useMemo } from 'react';
import { getActions } from "@/lib/data"
import { useTranslations } from "next-intl"
import { DashboardClient } from "@/components/dashboard-client"
import type { ImprovementAction } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user } = useAuth();
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const fetchedActions = await getActions();
        setActions(fetchedActions);
      } catch (error) {
        console.error("Failed to load dashboard actions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);
  
  const assignedActions = useMemo(() => {
    if (!user || !actions) return [];
    
    return actions.filter(action => 
      action.responsibleGroupId === user.email && 
      action.status !== 'Borrador' && 
      action.status !== 'Finalizada'
    );
  }, [actions, user]);

  const translations = {
    title: t("title"),
    totalActions: t("totalActions"),
    activeActions: t("activeActions"),
    finalizedActions: t("finalizedActions"),
    drafts: t("drafts"),
    actionsByStatus: {
        title: t("actionsByStatus.title"),
        description: t("actionsByStatus.description"),
    },
    actionsByType: {
        title: t("actionsByType.title"),
        description: t("actionsByType.description"),
    },
    myPendingActions: {
        title: t("myPendingActions.title"),
        description: t("myPendingActions.description"),
        noActions: t("myPendingActions.noActions"),
        col: {
            id: t("myPendingActions.col.id"),
            title: t("myPendingActions.col.title"),
            status: t("myPendingActions.col.status"),
        }
    },
    chartLabel: t("chartLabel"),
  }

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return <DashboardClient actions={actions} assignedActions={assignedActions} t={translations} />
}

    