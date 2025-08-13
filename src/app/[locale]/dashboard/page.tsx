
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

  const participatingActions = useMemo(() => {
    if (!user || !actions) return [];

    return actions
      .filter(action => action.status !== 'Borrador')
      .map(action => {
        let roles: string[] = [];
        if (action.creator.id === user.id) roles.push("Creador/a");
        if (action.responsibleGroupId === user.email) roles.push("Responsable Principal");
        if (action.analysis?.proposedActions?.some(pa => pa.responsibleUserId === user.id)) roles.push("Responsable Tasca");
        if (action.analysis?.verificationResponsibleUserId === user.id) roles.push("Verificador/a");
        
        if (roles.length > 0) {
          return { ...action, userRoles: roles };
        }
        return null;
      })
      .filter(Boolean) as (ImprovementAction & { userRoles: string[] })[];

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
    participatingActions: {
        title: t("participatingActions.title"),
        description: t("participatingActions.description"),
        noActions: t("participatingActions.noActions"),
        col: {
            id: t("participatingActions.col.id"),
            title: t("participatingActions.col.title"),
            status: t("participatingActions.col.status"),
            myRole: t("participatingActions.col.myRole"),
        }
    },
    chartLabel: t("chartLabel"),
  }

  if (isLoading || authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return <DashboardClient 
    actions={actions} 
    assignedActions={assignedActions}
    participatingActions={participatingActions}
    t={translations} 
  />
}
