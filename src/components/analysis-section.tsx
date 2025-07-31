
"use client"

import { useState, useEffect, useRef } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { users, getPrompt } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, PlusCircle, Trash2, CalendarIcon, Save, Mic, MicOff, Wand2 } from "lucide-react"
import type { ImprovementAction, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { suggestAnalysisAndActions, type SuggestAnalysisOutput } from "@/ai/flows/improveAnalysis"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "./ui/separator"


const analysisSchema = z.object({
  causes: z.string().min(1, "L'anàlisi de causes és requerit."),
  proposedActions: z.array(
    z.object({
      description: z.string().min(1, "La descripció és requerida."),
      responsibleUserId: z.string().min(1, "El responsable és requerit."),
      dueDate: z.date({ required_error: "La data de venciment és requerida." }),
    })
  ).min(1, "S'ha de proposar almenys una acció."),
  verificationResponsibleUserId: z.string().min(1, "El responsable de verificació és requerit."),
})

type AnalysisFormValues = z.infer<typeof analysisSchema>

interface AnalysisSectionProps {
  action: ImprovementAction;
  user: User;
  isSubmitting: boolean;
  onSave: (data: any) => void;
}

export function AnalysisSection({ action, user, isSubmitting, onSave }: AnalysisSectionProps) {
  const t = useTranslations("ActionDetailPage.analysis")
  const { toast } = useToast()

  // States for AI and Mic functionality
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  let finalTranscript = '';
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<SuggestAnalysisOutput | null>(null);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [hasAnalysisPrompt, setHasAnalysisPrompt] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      causes: action.analysis?.causes || "",
      proposedActions: action.analysis?.proposedActions || [],
      verificationResponsibleUserId: action.analysis?.verificationResponsibleUserId || "",
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "proposedActions",
  })

  useEffect(() => {
    async function checkPrompts() {
      const analysisPrompt = await getPrompt("analysisSuggestion");
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
      recognition.lang = 'ca-ES';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        form.setValue('causes', finalTranscript + interimTranscript);
      };

      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({ variant: "destructive", title: "Error de reconeixement de veu" });
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
      finalTranscript = form.getValues('causes');
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleGenerateSuggestion = async () => {
    setIsGeneratingSuggestion(true);
    try {
      const response = await suggestAnalysisAndActions({ observations: action.description });
      setAiSuggestion(response);
      setIsSuggestionDialogOpen(true);
    } catch (error) {
      console.error("Error generating analysis suggestion:", error);
      toast({ variant: "destructive", title: "Error de l'IA", description: "No s'ha pogut generar el suggeriment." });
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      form.setValue('causes', aiSuggestion.causesAnalysis, { shouldValidate: true });
      
      const newActions = aiSuggestion.proposedActions.map(action => ({
        description: action.description,
        responsibleUserId: '', // User must select this
        dueDate: new Date(), // Defaults to today, user must change
      }));
      replace(newActions);
    }
    setIsSuggestionDialogOpen(false);
    setAiSuggestion(null);
  };


  const onSubmit = (values: AnalysisFormValues) => {
    const analysisData = {
        ...values,
        analysisResponsible: {
            id: user.uid,
            name: user.displayName || "Usuari desconegut",
            avatar: user.photoURL || undefined,
        },
        analysisDate: new Date().toISOString(),
    }
    onSave(analysisData)
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          {hasAnalysisPrompt && (
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateSuggestion}
              disabled={isGeneratingSuggestion}
              title={t("improve.button")}
            >
              {isGeneratingSuggestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">{t("improve.button")}</span>
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
                  <FormLabel className="text-lg font-semibold">{t("causes.label")}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder={t("causes.placeholder")}
                        className="resize-y pr-12"
                        {...field}
                      />
                    </FormControl>
                    <div className="absolute right-2 top-2 flex flex-col gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={toggleRecording}
                        className={cn("h-8 w-8", isRecording && "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500")}
                        title={t("mic.toggle")}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("proposedActions.title")}</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-md">
                   <div className="flex-1 space-y-2">
                     <FormField
                        control={form.control}
                        name={`proposedActions.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("proposedActions.description")}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder={t("proposedActions.descriptionPlaceholder")} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                   </div>
                   <div className="w-full md:w-1/4 space-y-2">
                    <FormField
                      control={form.control}
                      name={`proposedActions.${index}.responsibleUserId`}
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("proposedActions.responsible")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("proposedActions.responsiblePlaceholder")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                      )}
                    />
                   </div>
                   <div className="w-full md:w-auto space-y-2">
                        <FormField
                        control={form.control}
                        name={`proposedActions.${index}.dueDate`}
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                               <FormLabel>{t("proposedActions.dueDate")}</FormLabel>
                               <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-full md:w-[240px] pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                        ) : (
                                        <span>{t("proposedActions.dueDatePlaceholder")}</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                   <div className="flex items-end">
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
                onClick={() => append({ description: "", responsibleUserId: "", dueDate: new Date() })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("proposedActions.add")}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="verificationResponsibleUserId"
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-lg font-semibold">{t("verificationResponsible.label")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="md:max-w-sm">
                                <SelectValue placeholder={t("verificationResponsible.placeholder")} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("saveButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>

    <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("suggestion.title")}</DialogTitle>
            <DialogDescription>{t("suggestion.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-6">
            <div className="space-y-2">
              <Label htmlFor="suggestion-causes" className="font-semibold text-base">{t("suggestion.suggestedAnalysis")}</Label>
              <Textarea id="suggestion-causes" readOnly value={aiSuggestion?.causesAnalysis || ''} rows={8} className="resize-y bg-muted/50" />
            </div>
            <Separator />
            <div className="space-y-4">
               <h4 className="font-semibold text-base">{t("suggestion.suggestedActions")}</h4>
               <ul className="space-y-2 list-disc pl-5">
                {aiSuggestion?.proposedActions.map((action, index) => (
                    <li key={index}>{action.description}</li>
                ))}
               </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuggestionDialogOpen(false)}>{t("suggestion.cancel")}</Button>
            <Button onClick={handleAcceptSuggestion}>{t("suggestion.accept")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
