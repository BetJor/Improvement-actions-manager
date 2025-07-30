import { getActions } from "@/lib/data"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const actions = await getActions()

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
      <DashboardClient actions={actions} />
    </div>
  )
}
