import { getActions } from "@/lib/data"
import { DashboardClient } from "@/components/dashboard-client"
import { useTranslations } from "next-intl"

export default async function DashboardPage() {
  const actions = await getActions()
  const t = useTranslations("DashboardPage")

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-4">{t("title")}</h1>
      <DashboardClient actions={actions} />
    </div>
  )
}
