
"use client"

import type { ImprovementAction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionStatusBadge } from "./action-status-badge"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { CircleUser, Calendar, Flag, User, Users, Tag, CalendarClock } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


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


interface ActionDetailsPanelProps {
  action: ImprovementAction
}

export function ActionDetailsPanel({ action }: ActionDetailsPanelProps) {
  const t = useTranslations("ActionDetailPage")
  
  return (
    <Card>
        <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border-b-0">
                <CardHeader>
                    <AccordionTrigger className="p-0 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                           <CardTitle>{t('details')}</CardTitle>
                           <ActionStatusBadge status={action.status} />
                        </div>
                    </AccordionTrigger>
                </CardHeader>
                <AccordionContent>
                    <CardContent className="space-y-4 pt-4">
                        <DetailRow icon={Tag} label={t("type")} value={action.type} />
                        <Separator />
                        <DetailRow 
                            icon={CircleUser} 
                            label={t("creator")} 
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
                            label={t("responsible")} 
                            value={action.responsibleGroupId} 
                        />
                        <Separator />
                        <DetailRow icon={Calendar} label={t("creationDate")} value={action.creationDate} />
                        <DetailRow icon={CalendarClock} label={t("analysisDue")} value={action.analysisDueDate} />
                        <DetailRow icon={CalendarClock} label={t("implementationDue")} value={action.implementationDueDate} />
                        <DetailRow icon={CalendarClock} label={t("closureDue")} value={action.closureDueDate} />
                    </CardContent>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </Card>
  )
}
