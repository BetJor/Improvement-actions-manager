
"use client"

import { useMemo } from 'react';
import { useActionState } from "@/hooks/use-action-state";
import { DashboardClient } from "@/components/dashboard-client"
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { ImprovementAction } from '@/lib/types';


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { actions, isLoading } = useActionState();

  const assignedActions = useMemo(() => {
    if (!user || !actions) return [];
  
    return actions.filter(action => {
      // It's pending if I am responsible for the analysis
      const isResponsibleForAnalysis = action.status === 'Pendiente Análisis' && action.responsibleGroupId === user.email;
      
      // It's pending if it's a draft I created
      const isCreatorOfDraft = action.status === 'Borrador' && action.creator.id === user.id;

      // It's also pending if it's a draft assigned to me (or my group), even if I didn't create it
      const isResponsibleForDraft = action.status === 'Borrador' && action.responsibleGroupId === user.email;

      return isResponsibleForAnalysis || isCreatorOfDraft || isResponsibleForDraft;
    });

  }, [actions, user]);


  if (isLoading || authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return <DashboardClient 
    actions={actions} 
    assignedActions={assignedActions}
  />
}
