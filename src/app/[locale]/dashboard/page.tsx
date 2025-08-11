import { getActions } from "@/lib/data"
import { getTranslations } from "next-intl/server"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const t = await getTranslations("DashboardPage");
  const actions = await getActions();
  
  const translations = {
    title: t("title"),
    totalActions: t("totalActions"),
    activeActions: t("activeActions"),
    finalizedActions: t("finalizedActions"),
    drafts: t("drafts"),
    actionsByStatus: {
        title: t("actionsByStatus.title"),
        description: t("actionsByStatus.description"),
    },
    actionsByType: {
        title: t("actionsByType.title"),
        description: t("actionsByType.description"),
    },
    chartLabel: t("chartLabel"),
  }

  return <DashboardClient actions={actions} t={translations} />
}
