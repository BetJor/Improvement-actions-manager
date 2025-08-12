
"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"
import { uploadFileAndUpdateAction, getActionById } from "@/lib/data"
import type { ImprovementAction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Paperclip, Upload, Download, Loader2, ChevronDown } from "lucide-react"
import { Badge } from "../ui/badge"

interface AttachmentsSectionProps {
  action: ImprovementAction
  onActionUpdate: (updatedAction: ImprovementAction) => void;
}

export function AttachmentsSection({ action, onActionUpdate }: AttachmentsSectionProps) {
  const t = useTranslations("ActionDetailPage.attachments")
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploadingFile(true)
    try {
      await uploadFileAndUpdateAction(action.id, file, {
        id: user.uid,
        name: user.displayName || 'Unknown User',
        avatar: user.photoURL || undefined,
      })

      toast({
        title: "Fitxer pujat",
        description: `${file.name} s'ha pujat i adjuntat correctament.`,
      })

      const updatedAction = await getActionById(action.id)
      if (updatedAction) onActionUpdate(updatedAction)

    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        variant: "destructive",
        title: "Error de pujada",
        description: "No s'ha pogut pujar el fitxer.",
      })
    } finally {
      setIsUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Card>
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer">
            <CardTitle className="flex items-center gap-2 text-base">
              <Paperclip className="h-5 w-5" />
              {t('title')}
            </CardTitle>
             <div className="flex items-center gap-2">
                <Badge variant="secondary">{(action.attachments || []).length}</Badge>
                <Button variant="ghost" size="icon" className="data-[state=open]:rotate-180">
                    <ChevronDown className="h-4 w-4 transition-transform" />
                </Button>
            </div>
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
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('clickToUpload')}</span> {t('dragAndDrop')}</p>
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
              {(action.attachments && action.attachments.length > 0) ? (
                action.attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="h-4 w-4 shrink-0" />
                            <span className="truncate text-sm">{file.fileName}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{file.fileName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download={file.fileName}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 w-full">{t('noAttachments')}</p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
