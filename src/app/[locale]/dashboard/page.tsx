
"use client"

import { useMemo } from 'react';
import { useActionState } from "@/hooks/use-action-state";
import { useTranslations } from "next-intl"
import { DashboardClient } from "@/components/dashboard-client"
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { ImprovementAction } from '@/lib/types';


export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const { user, loading: authLoading } = useAuth();
  const { actions, isLoading } = useActionState();

  const assignedActions = useMemo(() => {
    if (!user || !actions) return [];
  
    // An action is pending for the user if their email is in the 'authors' array
    // and the action is not finalized.
    return actions.filter(action => 
        action.status !== 'Finalizada' &&
        action.authors?.includes(user.email)
    );

  }, [actions, user]);


  if (isLoading || authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return <DashboardClient 
    actions={actions} 
    assignedActions={assignedActions}
  />
}
