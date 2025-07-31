
"use client"

import type { ImprovementAction, User } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionStatusBadge } from "./action-status-badge"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { CircleUser, Calendar, Flag, User as UserIcon, Users, Tag, CalendarClock, MessageSquare, Paperclip, Upload, Download, Send, Loader2, Trash2, Info } from "lucide-react"
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
import { useAuth } from "@/hooks/use-auth"
import { updateAction, getActionById, uploadFileAndUpdateAction } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect, useRef } from "react"
import type { ActionComment } from "@/lib/types"
import { Badge } from "@/components/ui/badge"


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
  onActionUpdate: (updatedAction: ImprovementAction) => void;
}

export function ActionDetailsPanel({ action, onActionUpdate }: ActionDetailsPanelProps) {
  const t = useTranslations("ActionDetailPage")
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmittingComment(true);

    const commentToAdd: ActionComment = {
      id: crypto.randomUUID(),
      author: {
        id: user.uid,
        name: user.displayName || 'Unknown User',
        avatar: user.photoURL || undefined,
      },
      date: new Date().toISOString(),
      text: newComment,
    };

    try {
      await updateAction(action.id, { newComment: commentToAdd });
      toast({
        title: "Comentari afegit",
        description: "El teu comentari s'ha desat correctament.",
      });
      setNewComment("");
      // Refresh the action data to show the new comment
      const updatedAction = await getActionById(action.id);
      if(updatedAction) {
        onActionUpdate(updatedAction);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut afegir el comentari.",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingFile(true);
    try {
      await uploadFileAndUpdateAction(action.id, file, {
        id: user.uid,
        name: user.displayName || 'Unknown User',
        avatar: user.photoURL || undefined,
      });

      toast({
        title: "Fitxer pujat",
        description: `${file.name} s'ha pujat i adjuntat correctament.`,
      });

      const updatedAction = await getActionById(action.id);
      if (updatedAction) {
        onActionUpdate(updatedAction);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Error de pujada",
        description: "No s'ha pogut pujar el fitxer.",
      });
    } finally {
      setIsUploadingFile(false);
       if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  
  return (
    <Card>
        <Accordion type="multiple" defaultValue={['details']} className="w-full">
            <AccordionItem value="details" className="border-b">
                <AccordionTrigger className="p-4">
                    <div className="flex justify-between items-center w-full">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            {t('details')}
                        </CardTitle>
                        <ActionStatusBadge status={action.status} />
                    </div>
                </AccordionTrigger>
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
            
            <AccordionItem value="comments" className="border-b">
                <AccordionTrigger className="p-4">
                     <div className="flex justify-between items-center w-full">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MessageSquare className="h-5 w-5" />
                            {t('comments.title')}
                        </CardTitle>
                        <Badge variant="secondary">{(action.comments || []).length}</Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {(action.comments || []).length > 0 ? (
                                action.comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                            {comment.author.avatar && <AvatarImage src={comment.author.avatar} />}
                                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm">{comment.author.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.date), { addSuffix: true, locale: es })}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md mt-1 whitespace-pre-wrap">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">{t('comments.noComments')}</p>
                            )}
                        </div>
                         <form onSubmit={handleCommentSubmit} className="relative pt-4">
                            <Textarea 
                              placeholder={t('comments.addCommentPlaceholder')} 
                              className="pr-10"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              disabled={isSubmittingComment}
                            />
                            <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" disabled={isSubmittingComment || !newComment.trim()}>
                                {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </CardContent>
                </AccordionContent>
            </AccordionItem>

             <AccordionItem value="attachments" className="border-b-0">
                <AccordionTrigger className="p-4">
                    <div className="flex justify-between items-center w-full">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Paperclip className="h-5 w-5" />
                            {t('attachments.title')}
                        </CardTitle>
                        <Badge variant="secondary">{(action.attachments || []).length}</Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                    {isUploadingFile ? (
                                        <>
                                            <Loader2 className="w-8 h-8 mb-4 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground">Pujant fitxer...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('attachments.clickToUpload')}</span> {t('attachments.dragAndDrop')}</p>
                                            <p className="text-xs text-muted-foreground">PDF, PNG, JPG, DOCX...</p>
                                        </>
                                    )}
                                </div>
                                <Input 
                                  id="dropzone-file" 
                                  type="file" 
                                  className="hidden" 
                                  onChange={handleFileChange}
                                  ref={fileInputRef}
                                  disabled={isUploadingFile}
                                />
                            </label>
                        </div> 
                        <div className="space-y-2">
                             {(action.attachments || []).length > 0 ? (
                                action.attachments.map(file => (
                                  <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
                                      <div className="flex items-center gap-2 overflow-hidden">
                                          <Paperclip className="h-4 w-4 shrink-0" />
                                          <span className="text-sm font-medium truncate" title={file.fileName}>{file.fileName}</span>
                                      </div>
                                      <Button variant="ghost" size="icon" asChild>
                                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download={file.fileName}>
                                              <Download className="h-4 w-4" />
                                          </a>
                                      </Button>
                                  </div>
                               ))
                             ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">{t('attachments.noAttachments')}</p>
                             )}
                        </div>
                    </CardContent>
                </AccordionContent>
            </AccordionItem>

        </Accordion>
    </Card>
  )
}
