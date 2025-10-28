
"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { uploadFileAndUpdateAction, getActionById } from "@/lib/data"
import type { ImprovementAction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Paperclip, Upload, Download, Loader2, ChevronRight, FileText } from "lucide-react"
import { Badge } from "../ui/badge"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../ui/dialog"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

interface AttachmentsSectionProps {
  action: ImprovementAction
  onActionUpdate: (updatedAction: ImprovementAction) => void;
}

export function AttachmentsSection({ action, onActionUpdate }: AttachmentsSectionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) {
        return;
    }
    setFileToUpload(file);
    setIsDescriptionDialogOpen(true);
  }

  const handleUploadWithDescription = async () => {
    if (!fileToUpload || !user) return;
    
    setIsDescriptionDialogOpen(false);
    setIsUploadingFile(true);

    try {
      const auth = getAuth();
      const currentUser = await new Promise<any>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        }, reject);
      });

      if (!currentUser) throw new Error("No authenticated user found.");

      await uploadFileAndUpdateAction(action.id, fileToUpload, {
        id: currentUser.uid,
        name: currentUser.displayName || 'Unknown User',
        avatar: currentUser.photoURL || undefined,
      }, fileDescription);
      
      toast({
        title: "Archivo subido",
        description: `${fileToUpload.name} se ha subido y adjuntado correctamente.`,
      });
   
      const updatedAction = await getActionById(action.id)
      if (updatedAction) {
        onActionUpdate(updatedAction)
      }

    } catch (error) {
      console.error("[Attachments] Error during upload process:", error);
      toast({
        variant: "destructive",
        title: "Error de subida",
        description: "No se ha podido subir el archivo.",
      })
    } finally {
      setIsUploadingFile(false);
      setFileToUpload(null);
      setFileDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }


  return (
    <>
    <Card>
      <Collapsible defaultOpen>
        <div className="flex justify-between items-center p-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Paperclip className="h-5 w-5" />
            Adjuntos
          </CardTitle>
          <div className="flex items-center gap-2">
              <Badge variant="secondary">{(action.attachments || []).length}</Badge>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="data-[state=open]:rotate-90">
                    <ChevronRight className="h-4 w-4 transition-transform" />
                </Button>
              </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  {isUploadingFile ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-4 text-muted-foreground animate-spin" />
                      <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
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
            <div className="space-y-3">
              {(action.attachments && action.attachments.length > 0) ? (
                action.attachments.map((file) => (
                  <div key={file.id} className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="h-4 w-4 shrink-0" />
                              <span className="truncate text-sm font-semibold">{file.fileName}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{file.fileName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download={file.fileName}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    {file.description && (
                       <p className="text-sm text-muted-foreground pl-6">{file.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 w-full">Aún no hay archivos adjuntos.</p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>

    <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir descripción al archivo</DialogTitle>
          <DialogDescription>
            Añade una descripción opcional para el archivo "{fileToUpload?.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="file-description">Descripción</Label>
          <Textarea 
            id="file-description"
            value={fileDescription}
            onChange={(e) => setFileDescription(e.target.value)}
            placeholder="Describe el contenido o el propósito de este archivo..."
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => { setFileToUpload(null); setFileDescription(""); }}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleUploadWithDescription}>Subir archivo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
