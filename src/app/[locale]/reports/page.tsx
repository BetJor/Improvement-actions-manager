import { getActions } from "@/lib/data"
import { getTranslations } from "next-intl/server"
import { ReportsClient } from '@/components/reports-client';


export default async function ReportsPage() {
  const [actions, t] = await Promise.all([
    getActions(),
    getTranslations('Reports')
  ]);

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

  return <ReportsClient 
    actions={actions}
    t={translations} 
  />
}
