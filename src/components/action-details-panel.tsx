
"use client"

import type { ImprovementAction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionStatusBadge } from "./action-status-badge"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { CircleUser, Calendar, Flag, User, Users, Tag, CalendarClock, MessageSquare, Paperclip, Upload, Download, Send } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"


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
    <>
        {/* Details Card */}
        <Card>
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                    <CardHeader>
                        <AccordionTrigger>
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

        {/* Comments Card */}
        <Card>
             <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                     <CardHeader>
                        <AccordionTrigger>
                            <CardTitle className="flex items-center gap-2">
                               <MessageSquare className="h-5 w-5" />
                               {t('comments.title')}
                            </CardTitle>
                        </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-4">
                                {(action.comments || []).map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={comment.author.avatar} />
                                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm">{comment.author.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.date), { addSuffix: true, locale: es })}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-slate-100 p-2 rounded-md mt-1">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!action.comments || action.comments.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center">{t('comments.noComments')}</p>
                                )}
                            </div>
                             <div className="relative mt-4">
                                <Textarea placeholder={t('comments.addCommentPlaceholder')} className="pr-10" />
                                <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </AccordionContent>
                </AccordionItem>
             </Accordion>
        </Card>
        
        {/* Attachments Card */}
        <Card>
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                     <CardHeader>
                        <AccordionTrigger>
                            <CardTitle className="flex items-center gap-2">
                                <Paperclip className="h-5 w-5" />
                                {t('attachments.title')}
                            </CardTitle>
                        </AccordionTrigger>
                    </CardHeader>
                     <AccordionContent>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t('attachments.clickToUpload')}</span> {t('attachments.dragAndDrop')}</p>
                                        <p className="text-xs text-gray-500">PDF, PNG, JPG, DOCX...</p>
                                    </div>
                                    <Input id="dropzone-file" type="file" className="hidden" />
                                </label>
                            </div> 
                            <div className="space-y-2">
                                 {(action.attachments || []).map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="h-4 w-4" />
                                            <span className="text-sm font-medium">{file.fileName}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={file.fileUrl} download>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                 ))}
                                 {(!action.attachments || action.attachments.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center">{t('attachments.noAttachments')}</p>
                                )}
                            </div>
                        </CardContent>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    </>
  )
}
