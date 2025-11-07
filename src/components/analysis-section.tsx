

"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getPrompt, getUsers } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, PlusCircle, Trash2, CalendarIcon, Save, Mic, MicOff, Wand2, Pencil, Mail, Send } from "lucide-react"
import type { ImprovementAction, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { suggestAnalysisAndActions, type SuggestAnalysisOutput } from "@/ai/flows/improveAnalysis"
import { improveWriting } from "@/ai/flows/improveWriting"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "./ui/separator"
import { getEmailDetailsForStateChange, sendTestEmail, type EmailInfo } from "@/services/notification-service"


const analysisSchema = z.object({
  causes: z.string().min(1, "El análisis de causas es requerido."),
  proposedActions: z.array(
    z.object({
      id: z.string().optional(),
      description: z.string().min(1, "La descripción es requerida."),
      responsibleUserId: z.string().min(1, "El responsable es requerido."),
      dueDate: z.date({ required_error: "La fecha de vencimiento es requerida." }),
      status: z.enum(["Pendiente", "Implementada", "Implementada Parcialmente", "No Implementada"]).default("Pendiente"),
    })
  ).min(1, "Se debe proponer al menos una acción."),
  verificationResponsibleUserId: z.string().min(1, "El responsable de verificación es requerido."),
})

type AnalysisFormValues = z.infer<typeof analysisSchema>

interface AnalysisSectionProps {
  action: ImprovementAction;
  user: User;
  isAdmin: boolean;
  isSubmitting: boolean;
  onSave: (data: any) => void;
  onEditField: (field: string, label: string, value: any, options?: any, fieldType?: string) => void;
}

export function AnalysisSection({ action, user, isAdmin, isSubmitting, onSave, onEditField }: AnalysisSectionProps) {
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // States for AI and Mic functionality
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [activeMicField, setActiveMicField] = useState<string | null>(null);
  let finalTranscript = '';

  const [isImprovingText, setIsImprovingText] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [activeImproveField, setActiveImproveField] = useState<string | null>(null);

  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [analysisAiSuggestion, setAnalysisAiSuggestion] = useState<SuggestAnalysisOutput | null>(null);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [hasImprovePrompt, setHasImprovePrompt] = useState(false);
  const [hasAnalysisPrompt, setHasAnalysisPrompt] = useState(false);
  
  const [emailInfo, setEmailInfo] = useState<EmailInfo | null>(null);
  const [isEmailInfoLoading, setIsEmailInfoLoading] = useState(false);
  const [isEmailDialogVisible, setIsEmailDialogVisible] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      causes: action.analysis?.causes || "",
      proposedActions: action.analysis?.proposedActions.map(pa => ({...pa, dueDate: new Date(pa.dueDate), status: pa.status || 'Pendiente'})) || [],
      verificationResponsibleUserId: action.analysis?.verificationResponsibleUserId || "",
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "proposedActions",
  })
  
  const verificationResponsibleUserId = form.watch("verificationResponsibleUserId");

  const isEmailDialogDataValid = useMemo(() => {
    return !!verificationResponsibleUserId;
  }, [verificationResponsibleUserId]);


  useEffect(() => {
    async function loadData() {
        setIsLoadingUsers(true);
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to load users for analysis section", error);
            toast({ variant: "destructive", title: "Error", description: "No se han podido cargar los usuarios." });
        } finally {
            setIsLoadingUsers(false);
        }
    }
    loadData();
  }, [toast]);

  useEffect(() => {
    async function checkPrompts() {
      const [improvePrompt, analysisPrompt] = await Promise.all([
        getPrompt("improveWriting"),
        getPrompt("analysisSuggestion")
      ]);
      setHasImprovePrompt(!!improvePrompt);
      setHasAnalysisPrompt(!!analysisPrompt);
    }
    checkPrompts();
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event) => {
        if (!activeMicField) return;

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        form.setValue(activeMicField as any, finalTranscript + interimTranscript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setActiveMicField(null);
      };
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({ variant: "destructive", title: "Error de reconocimiento de voz" });
        setIsRecording(false);
        setActiveMicField(null);
      };
      recognitionRef.current = recognition;
    }
    return () => recognitionRef.current?.stop();
  }, [form, toast, activeMicField]);

  const toggleRecording = (fieldName: string) => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      finalTranscript = form.getValues(fieldName as any);
      setActiveMicField(fieldName);
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleImproveText = async (fieldName: string) => {
    const currentText = form.getValues(fieldName as any);
    if (!currentText?.trim()) {
      toast({ variant: "destructive", title: "Campo vacío", description: "No hay texto para mejorar." });
      return;
    }
    setIsImprovingText(true);
    setActiveImproveField(fieldName);
    try {
      const improvedText = await improveWriting({ text: currentText });
      if (improvedText) {
        setAiSuggestion(improvedText);
        setIsSuggestionDialogOpen(true);
      } else {
        toast({ variant: "destructive", title: "La IA no ha devuelto sugerencias" });
      }
    } catch (error) {
      console.error("Error improving text:", error);
      toast({ variant: "destructive", title: "Error de la IA" });
    } finally {
      setIsImprovingText(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion && activeImproveField) {
        form.setValue(activeImproveField as any, aiSuggestion, { shouldValidate: true });
    }
    setIsSuggestionDialogOpen(false);
    setAiSuggestion(null);
    setActiveImproveField(null);
  };


  const handleGenerateAnalysis = async () => {
    setIsGeneratingSuggestion(true);
    try {
      const response = await suggestAnalysisAndActions({ observations: action.description });
      setAnalysisAiSuggestion(response);
      setIsSuggestionDialogOpen(true);
    } catch (error) {
      console.error("Error generating analysis suggestion:", error);
      toast({ variant: "destructive", title: "Error de la IA", description: "No se ha podido generar la sugerencia." });
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const handleAcceptAnalysisSuggestion = () => {
    if (analysisAiSuggestion) {
      form.setValue('causes', analysisAiSuggestion.causesAnalysis, { shouldValidate: true });
      
      const newActions = analysisAiSuggestion.proposedActions.map(action => ({
        id: crypto.randomUUID(),
        description: action.description,
        responsibleUserId: '',
        dueDate: new Date(), 
        status: 'Pendiente' as const
      }));
      replace(newActions);
    }
    setIsSuggestionDialogOpen(false);
    setAnalysisAiSuggestion(null);
  };
  
  const handlePreviewEmail = async () => {
    setIsEmailInfoLoading(true);
    setIsEmailDialogVisible(true);
    setEmailInfo(null);
  
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Formulario inválido",
        description: "Por favor, complete todos los campos requeridos antes de previsualizar.",
      });
      setIsEmailInfoLoading(false);
      return;
    }
  
    const formData = form.getValues();
  
    try {
      const details = await getEmailDetailsForStateChange({
        action: action, // Pass original action
        newAnalysisData: formData, // Pass new form data
        newStatus: 'Pendiente Comprobación',
      });
      setEmailInfo(details);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error al generar la previsualización",
        description: "No se pudieron obtener los detalles del email.",
      });
    } finally {
      setIsEmailInfoLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!emailInfo) return;
    setIsSendingTestEmail(true);
    try {
        const previewUrl = await sendTestEmail(emailInfo);
        if (previewUrl) {
            toast({
                title: "Correo de prueba enviado",
                description: (<a href={previewUrl} target="_blank" rel="noopener noreferrer" className="underline">Ver previsualización</a>),
                duration: 15000,
            });
        } else {
            throw new Error("No se recibió URL de previsualización.");
        }
    } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error al enviar el correo", description: "No se pudo enviar el correo de prueba."});
    } finally {
        setIsSendingTestEmail(false);
    }
  }


  const onSubmit = (values: AnalysisFormValues) => {
    const analysisData = {
        ...values,
        proposedActions: values.proposedActions.map(pa => ({
            ...pa,
            id: pa.id || crypto.randomUUID(),
        })),
        analysisResponsible: {
            id: user.id,
            name: user.name || "Usuario desconocido",
            avatar: user.avatar || "",
        },
        analysisDate: new Date().toISOString(),
    }
    onSave(analysisData)
  }

  if (isLoadingUsers) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="h-6 w-6 animate-spin"/></div>
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Análisis de Causas y Plan de Acción</CardTitle>
            <CardDescription>Realiza el análisis de las causas raíz y define las acciones a emprender.</CardDescription>
          </div>
          {hasAnalysisPrompt && (
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateAnalysis}
              disabled={isGeneratingSuggestion}
              title="Generar Análisis con IA"
            >
              {isGeneratingSuggestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Generar Análisis con IA</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="causes"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center gap-2 mb-2 group">
                        <FormLabel className="text-lg font-semibold">Análisis de las Causas</FormLabel>
                        {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onEditField('analysis.causes', 'Análisis de Causas', action.analysis?.causes, {}, 'textarea')}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                   <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Describe el análisis realizado para identificar las causas raíz del problema..."
                        className="flex-grow resize-y border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex flex-col gap-2 p-2 self-start">
                      <Button type="button" size="icon" variant="ghost" onClick={() => toggleRecording('causes')} className={cn("h-8 w-8", isRecording && activeMicField === 'causes' && "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500")} title="Micrófono para análisis de causas"><Mic className="h-4 w-4" /></Button>
                      {hasImprovePrompt && <Button type="button" size="icon" variant="ghost" onClick={() => handleImproveText('causes')} disabled={isImprovingText && activeImproveField === 'causes'} className="h-8 w-8" title="Mejorar análisis de causas con IA">{isImprovingText && activeImproveField === 'causes' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}</Button>}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Acciones Propuestas</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 p-4 border rounded-md items-start">
                   <div className="flex-1 flex flex-col gap-4">
                     <FormField
                        control={form.control}
                        name={`proposedActions.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción de la acción {index + 1}</FormLabel>
                                <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                  <FormControl>
                                      <Textarea {...field} placeholder="p. ej., Revisar y actualizar el procedimiento P-01" rows={2} className="flex-grow resize-y border-none focus-visible:ring-0 focus-visible:ring-offset-0" />
                                  </FormControl>
                                  <div className="flex flex-col gap-2 p-2 self-start">
                                      <Button type="button" size="icon" variant="ghost" onClick={() => toggleRecording(`proposedActions.${index}.description`)} className={cn("h-8 w-8", isRecording && activeMicField === `proposedActions.${index}.description` && "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500")} title={`Micrófono para acción ${index + 1}`}><Mic className="h-4 w-4" /></Button>
                                      {hasImprovePrompt && <Button type="button" size="icon" variant="ghost" onClick={() => handleImproveText(`proposedActions.${index}.description`)} disabled={isImprovingText && activeImproveField === `proposedActions.${index}.description`} className="h-8 w-8" title={`Mejorar acción ${index + 1} con IA`}>{isImprovingText && activeImproveField === `proposedActions.${index}.description` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}</Button>}
                                  </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name={`proposedActions.${index}.responsibleUserId`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Responsable</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un usuario" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id!}>{user.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`proposedActions.${index}.dueDate`}
                        render={({ field }) => (
                            <FormItem>
                               <FormLabel>Fecha Vencimiento</FormLabel>
                               <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                        ) : (
                                        <span>Selecciona una fecha</span>
                                        )}
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                               </Popover>
                               <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                   </div>
                   <div className="flex items-center">
                     <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                   </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", responsibleUserId: "", dueDate: new Date(), status: 'Pendiente' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Acción
              </Button>
            </div>

            <FormField
              control={form.control}
              name="verificationResponsibleUserId"
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-lg font-semibold">Responsable de la Verificación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="md:max-w-sm">
                                <SelectValue placeholder="Selecciona el usuario que verificará la eficacia" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id!}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />
            
            <div className="flex items-center gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar Análisis y Avanzar
                </Button>
                <div className="border-l pl-4 space-x-2">
                    <Dialog open={isEmailDialogVisible} onOpenChange={setIsEmailDialogVisible}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="secondary" onClick={handlePreviewEmail} disabled={!isEmailDialogDataValid}>
                                {isEmailInfoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                1. Previsualizar Correo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Previsualización del Correo de Notificación</DialogTitle>
                                <DialogDescription>Este es el correo que se enviará al responsable de la verificación.</DialogDescription>
                            </DialogHeader>
                            {isEmailInfoLoading ? (
                                <div className="py-4 flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            ) : emailInfo ? (
                                <div className="space-y-4 py-4">
                                    <p><strong>Destinatario:</strong> {emailInfo.recipient}</p>
                                    <p><strong>Asunto:</strong> {emailInfo.subject}</p>
                                    <Separator />
                                    <div className="p-4 border rounded-md bg-muted/30 max-h-96 overflow-y-auto" dangerouslySetInnerHTML={{ __html: emailInfo.html }}></div>
                                </div>
                            ) : <p className="py-4">No se pudo generar la información del correo. Asegúrate de que has asignado un responsable de verificación.</p>}
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cerrar</Button></DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button type="button" variant="secondary" onClick={handleSendTestEmail} disabled={!emailInfo || isSendingTestEmail}>
                        {isSendingTestEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        2. Enviar Correo de Prueba
                    </Button>
                </div>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>

    <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sugerencia de la IA</DialogTitle>
            <DialogDescription>
              {analysisAiSuggestion
                ? "El asistente ha generado el siguiente análisis y plan de acción. ¿Quieres aceptar estos cambios?"
                : "El asistente ha generado la siguiente descripción. ¿Quieres aceptar estos cambios?"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-6">
            {analysisAiSuggestion ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="suggestion-causes" className="font-semibold text-base">Análisis de Causas Sugerido</Label>
                  <Textarea id="suggestion-causes" readOnly value={analysisAiSuggestion.causesAnalysis || ''} rows={8} className="resize-y bg-muted/50" />
                </div>
                <Separator />
                <div className="space-y-4">
                   <h4 className="font-semibold text-base">Acciones Correctivas Sugeridas</h4>
                   <ul className="space-y-2 list-disc pl-5">
                    {analysisAiSuggestion.proposedActions.map((action, index) => (
                        <li key={index}>{action.description}</li>
                    ))}
                   </ul>
                </div>
              </>
            ) : (
               <div className="space-y-2">
                  <Label htmlFor="suggestion-text">Texto mejorado</Label>
                  <Textarea id="suggestion-text" readOnly value={aiSuggestion || ''} rows={10} className="resize-y bg-muted/50" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsSuggestionDialogOpen(false); setAiSuggestion(null); setAnalysisAiSuggestion(null); setActiveImproveField(null); }}>Cancelar</Button>
            <Button onClick={analysisAiSuggestion ? handleAcceptAnalysisSuggestion : handleAcceptSuggestion}>
              {analysisAiSuggestion ? 'Aceptar y Rellenar Formulario' : 'Aceptar Sugerencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
