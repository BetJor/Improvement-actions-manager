
"use client"

import type { ImprovementAction, User } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionStatusBadge } from "./action-status-badge"
import { Separator } from "./ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { CircleUser, Calendar, Flag, User as UserIcon, Users, Tag, CalendarClock, MessageSquare, Paperclip, Upload, Download, Send, Loader2, Trash2, Info, ChevronDown, Link as LinkIcon, ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "@/hooks/use-auth"
import { updateAction, uploadFileAndUpdateAction, getActionById } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useState, useRef } from "react"
import type { ActionComment } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { useParams } from "next/navigation"


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
  const params = useParams();
  
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
      const updatedAction = await getActionById(action.id);
      if (updatedAction) onActionUpdate(updatedAction);
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

      // Fetch the updated action and pass it to the parent
      const updatedAction = await getActionById(action.id);
      if (updatedAction) onActionUpdate(updatedAction);

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
    <div className="flex flex-col gap-6">
        
        {action.originalActionId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Acció Original (BIS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Aquesta acció es va crear a partir del tancament no conforme de l'acció:</p>
              <p className="font-semibold">{action.originalActionTitle}</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/${params.locale}/actions/${action.originalActionId}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Veure Acció Original
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
            <Collapsible defaultOpen={true}>
                <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-4 cursor-pointer">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            {t('details')}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <ActionStatusBadge status={action.status} />
                             <Button variant="ghost" size="icon" className="data-[state=open]:rotate-180">
                                <ChevronDown className="h-4 w-4 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
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
                </CollapsibleContent>
            </Collapsible>
        </Card>

        <Card>
            <Collapsible defaultOpen={true}>
                <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-4 cursor-pointer">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MessageSquare className="h-5 w-5" />
                            {t('comments.title')}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{(action.comments || []).length}</Badge>
                            <Button variant="ghost" size="icon" className="data-[state=open]:rotate-180">
                                <ChevronDown className="h-4 w-4 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
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
                </CollapsibleContent>
            </Collapsible>
        </Card>

        <Card>
            <Collapsible defaultOpen={true}>
                <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center p-4 cursor-pointer">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Paperclip className="h-5 w-5" />
                            {t('attachments.title')}
                        </CardTitle>
                         <Button variant="ghost" size="icon" className="data-[state=open]:rotate-180">
                            <ChevronDown className="h-4 w-4 transition-transform" />
                        </Button>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
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
                        <div className="flex justify-end min-h-[40px]">
                            {(action.attachments && action.attachments.length > 0) ? (
                                <div className="group relative flex h-10 items-center justify-end">
                                {action.attachments.map((file, index) => (
                                    <div
                                        key={file.id}
                                        className="file-item group-hover:ml-0"
                                        style={{
                                            zIndex: action.attachments!.length - index,
                                            marginLeft: index > 0 ? '-24px' : '0',
                                        }}
                                    >
                                        <div className="flex items-center gap-2 rounded-full border bg-background p-2 shadow-sm transition-all duration-300 group-hover:max-w-xs group-hover:rounded-md group-hover:pr-3">
                                            <Paperclip className="h-5 w-5 shrink-0" />
                                            <span className="truncate text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">{file.fileName}</span>
                                            <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100">
                                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download={file.fileName}>
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4 w-full">{t('attachments.noAttachments')}</p>
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    </div>
  )
}
