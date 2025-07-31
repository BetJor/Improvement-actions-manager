
"use client";

import { getActions } from "@/lib/data"
import { ActionsTable } from "@/components/actions-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react";
import type { ImprovementAction } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function ActionsPage() {
  const t = useTranslations("ActionsPage");
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActions() {
      setIsLoading(true);
      try {
        const actionsData = await getActions();
        setActions(actionsData);
      } catch (error) {
        console.error("Failed to load actions", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadActions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Carregant accions...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <Link href="/actions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("createAction")}
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground">
        {t("description")}
      </p>
      <ActionsTable actions={actions} />
    </div>
  )
}
