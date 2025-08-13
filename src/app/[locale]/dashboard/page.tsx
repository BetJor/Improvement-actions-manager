
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
  
    const isUserTurnToAct = (action: ImprovementAction): boolean => {
      switch (action.status) {
        case 'Pendiente Análisis':
          // The main responsible for the action group needs to act.
          return user.email === action.responsibleGroupId;
        
        case 'Pendiente Comprobación':
          // The designated verification responsible needs to act.
          // First, check if any proposed action is still pending.
          const hasPendingProposedActions = action.analysis?.proposedActions?.some(pa => pa.status === 'Pendent');
          if (hasPendingProposedActions) {
            // It's the turn of the responsible for the proposed action
            return action.analysis?.proposedActions.some(pa => pa.responsibleUserId === user.id && pa.status === 'Pendent') || false;
          }
          // If all proposed actions are done, it's the verification responsible's turn.
          return user.id === action.analysis?.verificationResponsibleUserId;

        case 'Pendiente de Cierre':
          // The original creator of the action needs to close it.
          return user.id === action.creator.id;
        
        default:
          // For other statuses like 'Borrador' or 'Finalizada', no one needs to act.
          // Also check for pending proposed actions for active but not yet verifying statuses
           if (action.status !== 'Borrador' && action.status !== 'Finalizada') {
              return action.analysis?.proposedActions?.some(pa => pa.responsibleUserId === user.id && pa.status === 'Pendent') || false;
           }
          return false;
      }
    };
  
    return actions.filter(action => isUserTurnToAct(action));
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

    
