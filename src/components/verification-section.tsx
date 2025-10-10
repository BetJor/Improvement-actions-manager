
"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { ImprovementAction, User, ProposedActionVerificationStatus } from "@/lib/types"
import { Loader2, Save, Mic, Wand2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { improveWriting } from "@/ai/flows/improveWriting"
import { useToast } from "@/hooks/use-toast"
import { getPrompt } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"


const verificationSchema = z.object({
  notes: z.string().min(1, "Las observaciones son requeridas."),
  proposedActionsVerificationStatus: z.record(z.string(), z.enum(["Verificada", "No Verificada"])),
})

type VerificationFormValues = z.infer<typeof verificationSchema>

interface VerificationSectionProps {
  action: ImprovementAction
  user: User
  isSubmitting: boolean
  onSave: (data: any) => void
}

export function VerificationSection({ action, user, isSubmitting, onSave }: VerificationSectionProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isImprovingText, setIsImprovingText] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [hasImprovePrompt, setHasImprovePrompt] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  let finalTranscript = '';

  const defaultStatuses = action.analysis?.proposedActions.reduce((acc, pa) => {
    acc[pa.id] = action.verification?.proposedActionsVerificationStatus?.[pa.id] || "No Verificada";
    return acc
  }, {} as Record<string, ProposedActionVerificationStatus>)

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      notes: action.verification?.notes || "",
      proposedActionsVerificationStatus: defaultStatuses,
    },
  })

  useEffect(() => {
    async function checkPrompts() {
      const improvePrompt = await getPrompt("improveWriting");
      setHasImprovePrompt(!!improvePrompt);
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
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        form.setValue('notes', finalTranscript + interimTranscript);
      };

      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({ variant: "destructive", title: "Error de reconocimiento de voz" });
        setIsRecording(false);
      };
      recognitionRef.current = recognition;
    }
    return () => recognitionRef.current?.stop();
  }, [form, toast, finalTranscript]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      finalTranscript = form.getValues('notes');
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleImproveText = async () => {
    const currentText = form.getValues('notes');
    if (!currentText?.trim()) {
      toast({ variant: "destructive", title: "Campo vacío" });
      return;
    }
    setIsImprovingText(true);
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
    if (aiSuggestion) {
      form.setValue('notes', aiSuggestion, { shouldValidate: true });
    }
    setIsSuggestionDialogOpen(false);
    setAiSuggestion(null);
  };

  const onSubmit = (values: VerificationFormValues) => {
    const verificationData = {
      ...values,
      isEffective: true, // This could be another field in the form
      verificationResponsible: {
        id: user.id,
        name: user.name || "Usuario desconocido",
        avatar: user.avatar || undefined,
      },
      verificationDate: new Date().toISOString(),
    }
    onSave(verificationData)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Verificación de la Implantación</CardTitle>
          <CardDescription>Comprueba si las acciones propuestas se han implantado y si han sido eficaces.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Observaciones Generales</FormLabel>
                    <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                        <FormControl>
                           <Textarea
                            rows={4}
                            placeholder="Añade aquí tus observaciones sobre el proceso de verificación..."
                            className="flex-grow resize-y border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex flex-col gap-2 p-2 self-start">
                          <Button type="button" size="icon" variant="ghost" onClick={toggleRecording} className={cn("h-8 w-8", isRecording && "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500")} title="Micrófono"><Mic className="h-4 w-4" /></Button>
                          {hasImprovePrompt && <Button type="button" size="icon" variant="ghost" onClick={handleImproveText} disabled={isImprovingText} className="h-8 w-8" title="Mejorar con IA">{isImprovingText ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}</Button>}
                        </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estado de las Acciones Propuestas</h3>
                {action.analysis?.proposedActions.map((pa) => (
                  <FormField
                    key={pa.id}
                    control={form.control}
                    name={`proposedActionsVerificationStatus.${pa.id}`}
                    render={({ field }) => (
                      <FormItem className="p-4 border rounded-lg">
                        <FormLabel className="font-medium">{pa.description}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col sm:flex-row gap-4 pt-2"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Verificada" id={`${pa.id}-verified`} />
                              </FormControl>
                              <FormLabel htmlFor={`${pa.id}-verified`} className="font-normal">Verificada</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="No Verificada" id={`${pa.id}-not-verified`} />
                              </FormControl>
                              <FormLabel htmlFor={`${pa.id}-not-verified`} className="font-normal">No Verificada</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Verificación y Avanzar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sugerencia de la IA</DialogTitle>
            <DialogDescription>El asistente ha generado la siguiente descripción. ¿Quieres aceptar estos cambios?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="suggestion-text">Texto mejorado</Label>
              <Textarea id="suggestion-text" readOnly value={aiSuggestion || ''} rows={10} className="resize-y bg-muted/50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuggestionDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAcceptSuggestion}>Aceptar Sugerencia</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

    