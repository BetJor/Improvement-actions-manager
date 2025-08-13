
"use client"

import { useState, useEffect } from 'react';
import { getActions, getTranslations } from "@/lib/data"
import type { ImprovementAction } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { ReportsClient } from '@/components/reports-client';


export default function ReportsPage() {
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [translations, setTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [fetchedActions, t] = await Promise.all([
          getActions(),
          getTranslations('Reports')
        ]);
        setActions(fetchedActions);
        setTranslations(t);
      } catch (error) {
        console.error("Failed to load report data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading || !translations) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return <ReportsClient 
    actions={actions}
    t={translations} 
  />
}
