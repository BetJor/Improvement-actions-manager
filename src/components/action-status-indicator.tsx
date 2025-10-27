"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ImprovementActionStatus } from "@/lib/types"

interface ActionStatusIndicatorProps {
  status: ImprovementActionStatus;
  isCompliant?: boolean | null;
}

const Bar = ({ colorClass }: { colorClass: string }) => (
  <div className={cn("h-4 w-1.5 rounded-sm", colorClass)} />
);

export function ActionStatusIndicator({ status, isCompliant = null }: ActionStatusIndicatorProps) {
  
  const getStatusDetails = () => {
    switch (status) {
      case 'Borrador':
        return {
          label: status,
          bars: [ 'bg-gray-300', 'bg-gray-300', 'bg-gray-300', 'bg-gray-300' ]
        };
      case 'Pendiente Análisis':
        return {
          label: status,
          bars: [ 'bg-green-400', 'bg-gray-300', 'bg-gray-300', 'bg-gray-300' ]
        };
      case 'Pendiente Comprobación':
        return {
          label: status,
          bars: [ 'bg-green-500', 'bg-green-500', 'bg-gray-300', 'bg-gray-300' ]
        };
      case 'Pendiente de Cierre':
        return {
          label: status,
          bars: [ 'bg-green-600', 'bg-green-600', 'bg-green-600', 'bg-gray-300' ]
        };
      case 'Finalizada':
        if (isCompliant === false) {
          return {
            label: "Finalizada (No Conforme)",
            bars: [ 'bg-red-500', 'bg-red-500', 'bg-red-500', 'bg-red-500' ]
          };
        }
        return {
          label: "Finalizada (Conforme)",
          bars: [ 'bg-green-700', 'bg-green-700', 'bg-green-700', 'bg-green-700' ]
        };
      default:
        return { label: status, bars: null };
    }
  };

  const { label, bars } = getStatusDetails();

  if (!bars) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center space-x-0.5">
            {bars.map((color, index) => (
              <Bar key={index} colorClass={color} />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
