import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ImprovementActionStatus } from "@/lib/types"

interface ActionStatusBadgeProps {
  status: ImprovementActionStatus
}

export function ActionStatusBadge({ status }: ActionStatusBadgeProps) {
  const statusStyles = {
    Borrador: "bg-gray-200 text-gray-800",
    "Pendiente Análisis": "bg-yellow-200 text-yellow-800",
    "Pendiente Comprobación": "bg-blue-200 text-blue-800",
    "Pendiente de Cierre": "bg-purple-200 text-purple-800",
    Finalizada: "bg-green-200 text-green-800",
  }

  return (
    <Badge
      className={cn(
        "border-transparent hover:opacity-90",
        statusStyles[status]
      )}
    >
      {status}
    </Badge>
  )
}
