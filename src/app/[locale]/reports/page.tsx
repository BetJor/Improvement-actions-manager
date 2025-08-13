
"use client"

import { useState, useEffect } from "react"
import { getActions } from "@/lib/data"
import { useTranslations } from "next-intl"
import { ReportsClient } from '@/components/reports-client';
import type { ImprovementAction } from "@/lib/types";
import { Loader2 } from "lucide-react";


export default function ReportsPage() {
  const t = useTranslations('Reports');
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const fetchedActions = await getActions();
        setActions(fetchedActions);
      } catch (error) {
        console.error("Failed to load actions for reports:", error);
        // Optionally, show a toast message to the user
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const translations = {
    title: t("title"),
    description: t("description"),
    actionsByStatus: {
      title: t("actionsByStatus.title"),
      description: t("actionsByStatus.description"),
    },
    actionsByType: {
      title: t("actionsByType.title"),
      description: t("actionsByType.description"),
    },
    actionsByCategory: {
      title: t("actionsByCategory.title"),
      description: t("actionsByCategory.description"),
    },
    chartLabel: t("chartLabel"),
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return <ReportsClient 
    actions={actions}
    t={translations} 
  />
}
