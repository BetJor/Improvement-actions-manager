
"use client"

import { Signal, SignalHigh, SignalMedium, SignalLow, Ban } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ImprovementActionStatus } from "@/lib/types"

interface ActionStatusIndicatorProps {
  status: ImprovementActionStatus;
  isCompliant?: boolean | null;
}

export function ActionStatusIndicator({ status, isCompliant = null }: ActionStatusIndicatorProps) {
  const getIcon = () => {
    if (status === 'Finalizada') {
      if (isCompliant === false) {
        return { Icon: Ban, color: "text-red-500", label: "Finalizada (No Conforme)" };
      }
      return { Icon: Signal, color: "text-green-500", label: "Finalizada" };
    }

    switch (status) {
      case 'Borrador':
        return { Icon: SignalLow, color: "text-gray-400", label: "Borrador" };
      case 'Pendiente Análisis':
        return { Icon: SignalMedium, color: "text-green-400", label: "Pendiente Análisis" };
      case 'Pendiente Comprobación':
        return { Icon: SignalHigh, color: "text-green-500", label: "Pendiente Comprobación" };
      case 'Pendiente de Cierre':
        return { Icon: SignalHigh, color: "text-green-500", label: "Pendiente de Cierre" }; // Using SignalHigh as "full"
      default:
        return { Icon: SignalLow, color: "text-gray-400", label: "Desconocido" };
    }
  };

  const { Icon, color, label } = getIcon();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon className={cn("h-5 w-5", color)} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
