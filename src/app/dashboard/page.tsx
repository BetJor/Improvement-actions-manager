
"use client"

import { useMemo } from 'react';
import { useActionState } from "@/hooks/use-action-state";
import { DashboardClient } from "@/components/dashboard-client"
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { ImprovementAction } from '@/lib/types';


export default function DashboardPage() {
  const { user, userGroups, loading: authLoading } = useAuth();
  const { actions, isLoading } = useActionState();

  const userGroupEmails = useMemo(() => new Set(userGroups.map(g => g.id)), [userGroups]);

  const assignedActions = useMemo(() => {
    if (!user || !actions) return [];
  
    return actions.filter(action => {
      // It's a draft I created
      const isCreatorOfDraft = action.status === 'Borrador' && action.creator.id === user.id;

      // I am responsible for analysis (directly or through group)
      const isResponsibleForAnalysis = action.status === 'Pendiente Análisis' && 
        (action.responsibleGroupId === user.email || userGroupEmails.has(action.responsibleGroupId));

      // I am responsible for one of the proposed actions that is not yet implemented
      const isResponsibleForProposedAction = (action.status === 'Pendiente Comprobación' || action.status === 'Pendiente Análisis') &&
        action.analysis?.proposedActions.some(pa => 
            pa.responsibleUserId === user.id && pa.status !== 'Implementada'
        );

      // I am responsible for the verification
      const isResponsibleForVerification = action.status === 'Pendiente Comprobación' && action.analysis?.verificationResponsibleUserId === user.id;

      // I am the creator, responsible for closure
      const isResponsibleForClosure = action.status === 'Pendiente de Cierre' && action.creator.id === user.id;

      return isCreatorOfDraft || isResponsibleForAnalysis || isResponsibleForProposedAction || isResponsibleForVerification || isResponsibleForClosure;
    });

  }, [actions, user, userGroupEmails]);


  if (isLoading || authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return <DashboardClient 
    actions={actions} 
    assignedActions={assignedActions}
  />
}
