
import { getActions } from "@/lib/data"
import { ActionsTable } from "@/components/actions-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { useTabs } from "@/hooks/use-tabs"
import { FilePlus } from "lucide-react"
import { ClientButton } from "./client-button"

export default async function ActionsPage() {
  const t = await getTranslations("ActionsPage");
  const actions = await getActions();

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
