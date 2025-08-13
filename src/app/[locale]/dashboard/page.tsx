
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
  const { user, loading: authLoading } = useAuth();
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return; // Wait for auth to be ready
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
  }, [authLoading]);
  
  const assignedActions = useMemo(() => {
    if (!user || !actions) return [];
  
    return actions.filter(action => {
      // The action must not be in a final or draft state
      const isActionActive = action.status !== 'Borrador' && action.status !== 'Finalizada';
      if (!isActionActive) return false;
  
      // Condition 1: User is the main responsible for the entire action
      const isMainResponsible = action.responsibleGroupId === user.email;
  
      // Condition 2: User is responsible for at least one of the proposed actions
      const isProposedActionResponsible = 
        action.analysis?.proposedActions?.some(
          (pa) => pa.responsibleUserId === user.id
        ) || false;

      // Condition 3: User is the verification responsible
      const isVerificationResponsible = action.analysis?.verificationResponsibleUserId === user.id;
  
      return isMainResponsible || isProposedActionResponsible || isVerificationResponsible;
    });
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

  if (isLoading || authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return <DashboardClient actions={actions} assignedActions={assignedActions} t={translations} />
}

    
