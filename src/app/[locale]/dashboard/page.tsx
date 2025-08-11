import { getActions } from "@/lib/data"
import { getTranslations } from "next-intl/server"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const t = await getTranslations("DashboardPage");
  const actions = await getActions();
  
  return <DashboardClient actions={actions} t={t} />
}
