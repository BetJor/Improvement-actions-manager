
"use client"

import { useState, useEffect, useMemo } from 'react';
import { getActions, getFollowedActions } from "@/lib/data"
import { useTranslations } from "next-intl"
import { DashboardClient } from "@/components/dashboard-client"
import type { ImprovementAction } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { user, loading: authLoading } = useAuth();
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [followedActions, setFollowedActions] = useState<ImprovementAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (authLoading || !user) return; // Wait for auth to be ready
      setIsLoading(true);
      try {
        const [fetchedActions, fetchedFollowedActions] = await Promise.all([
            getActions(),
            getFollowedActions(user.id)
        ]);
        setActions(fetchedActions);
        setFollowedActions(fetchedFollowedActions);
      } catch (error) {
        console.error("Failed to load dashboard actions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [authLoading, user]);
  
  const assignedActions = useMemo(() => {
    if (!user || !actions) return [];
  
    const isUserTurnToAct = (action: ImprovementAction): boolean => {
      switch (action.status) {
        case 'Pendiente Análisis':
          return user.email === action.responsibleGroupId;
        
        case 'Pendiente Comprobación':
          const hasPendingProposedActions = action.analysis?.proposedActions?.some(pa => pa.status === 'Pendent');
          if (hasPendingProposedActions) {
            return action.analysis?.proposedActions.some(pa => pa.responsibleUserId === user.id && pa.status === 'Pendent') || false;
          }
          return user.id === action.analysis?.verificationResponsibleUserId;

        case 'Pendiente de Cierre':
          return user.id === action.creator.id;
        
        default:
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
    followedActions: {
        title: t("followedActions.title"),
        description: t("followedActions.description"),
        noActions: t("followedActions.noActions"),
        unfollow: t("followedActions.unfollow"),
        col: {
            id: t("followedActions.col.id"),
            title: t("followedActions.col.title"),
            status: t("followedActions.col.status"),
            myRole: t("followedActions.col.myRole"),
        }
    },
  }

  if (isLoading || authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return <DashboardClient 
    actions={actions} 
    assignedActions={assignedActions}
    initialFollowedActions={followedActions}
    t={translations} 
  />
}
