
"use client"

import { useActionState } from "@/hooks/use-action-state";
import { ActionsTable } from "@/components/actions-table"
import { ClientButton } from "./client-button"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

export default function ActionsPage() {
  const t = useTranslations("Actions.page");
  const { actions, isLoading } = useActionState();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <ClientButton />
      </div>
      <p className="text-muted-foreground">
        {t("description")}
      </p>
      <ActionsTable actions={actions} />
    </div>
  )
}
