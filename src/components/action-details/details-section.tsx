
"use client"

import type { ImprovementAction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionStatusBadge } from "@/components/action-status-badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CircleUser, Calendar, Users, Tag, CalendarClock, Info, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

interface DetailRowProps {
  icon: React.ElementType
  label: string
  value?: string | React.ReactNode
}

const DetailRow = ({ icon: Icon, label, value }: DetailRowProps) => {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">
          {value}
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
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5" />
              Detalles
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="data-[state=open]:rotate-180">
                <ChevronDown className="h-4 w-4 transition-transform" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <DetailRow icon={Tag} label="Tipo" value={action.type} />
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
            <DetailRow icon={Calendar} label="Fecha Creación" value={action.creationDate} />
            <DetailRow icon={CalendarClock} label="Vencimiento Análisis" value={action.analysisDueDate} />
            <DetailRow icon={CalendarClock} label="Vencimiento Implantación" value={action.implementationDueDate} />
            <DetailRow icon={CalendarClock} label="Vencimiento Cierre" value={action.closureDueDate} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
