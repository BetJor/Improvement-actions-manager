
"use client"

import { useState, useEffect } from "react"
import { getActions } from "@/lib/data"
import { ReportsClient } from '@/components/reports-client';
import type { ImprovementAction } from "@/lib/types";
import { Loader2 } from "lucide-react";


export default function ReportsPage() {
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
    title: "Informes",
    description: "Analiza las acciones de mejora con estos informes.",
    actionsByStatus: {
      title: "Acciones por Estado",
      description: "Distribución de las acciones de mejora según su estado actual.",
    },
    actionsByType: {
      title: "Acciones por Tipo",
      description: "Distribución de las acciones de mejora según su tipo.",
    },
    actionsByCategory: {
      title: "Acciones por Categoría",
      description: "Distribución de las acciones de mejora según su categoría.",
    },
    chartLabel: "Acciones",
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
