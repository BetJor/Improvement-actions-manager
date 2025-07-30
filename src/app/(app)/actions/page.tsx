import { getActions } from "@/lib/data"
import { ActionsTable } from "@/components/actions-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function ActionsPage() {
  const actions = await getActions()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Improvement Actions</h1>
        <Link href="/actions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Action
          </Button>
        </Link>
      </div>
      <p className="text-muted-foreground">
        Here you can find all the improvement actions. Use the filters to narrow down your search.
      </p>
      <ActionsTable actions={actions} />
    </div>
  )
}
