
"use client"

import type { ImprovementAction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionStatusBadge } from "@/components/action-status-badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CircleUser, Calendar, Users, Tag, CalendarClock, Info, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"


interface DetailRowProps {
  icon: React.ElementType
  label: string
  value?: string | React.ReactNode
  isDate?: boolean
}

const DetailRow = ({ icon: Icon, label, value, isDate = false }: DetailRowProps) => {
  if (!value) return null

  let displayValue = value;
  if (isDate && typeof value === 'string') {
      try {
          displayValue = format(parseISO(value), 'dd/MM/yyyy');
      } catch {
          displayValue = value; // Show original string if parsing fails
      }
  }


  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">
          {displayValue}
        </span>
      </div>
    </div>
  )
}

interface DetailsSectionProps {
  action: ImprovementAction
}

export function DetailsSection({ action }: DetailsSectionProps) {

  return (
    <Card>
      <Collapsible defaultOpen>
        <div className="flex justify-between items-center p-4">
            <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-5 w-5" />
                Detalles
            </CardTitle>
            <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="data-[state=open]:rotate-90">
                        <ChevronRight className="h-4 w-4 transition-transform" />
                    </Button>
                </CollapsibleTrigger>
            </div>
        </div>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <DetailRow icon={Tag} label="Ámbito" value={action.type} />
            <Separator />
            <DetailRow
              icon={CircleUser}
              label="Creador/a"
              value={
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {action.creator.avatar && <AvatarImage src={action.creator.avatar} />}
                    <AvatarFallback>{action.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{action.creator.name}</span>
                </div>
              }
            />
            <DetailRow
              icon={Users}
              label="Responsable"
              value={action.responsibleGroupId}
            />
            <Separator />
            <DetailRow icon={Calendar} label="Fecha Creación" value={action.creationDate} isDate />
            <DetailRow icon={CalendarClock} label="Vencimiento Análisis" value={action.analysisDueDate} isDate />
            <DetailRow icon={CalendarClock} label="Vencimiento Implantación" value={action.implementationDueDate} isDate />
            <DetailRow icon={CalendarClock} label="Vencimiento Cierre" value={action.closureDueDate} isDate />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
