
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getPrompt } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useState, useMemo, useEffect, useRef } from "react"
import { Loader2, Mic, MicOff, Wand2, Save, Send, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import { improveWriting, type ImproveWritingOutput } from "@/ai/flows/improveWriting"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { ImprovementAction, ImprovementActionType, ResponsibilityRole, AffectedArea, Center } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"

const formSchema = z.object({
  title: z.string().min(1, "El títol és requerit."),
  category: z.string().min(1, "La categoria és requerida."),
  subcategory: z.string().min(1, "La subcategoria és requerida."),
  affectedAreasId: z.string().min(1, "L'àrea implicada és requerida."),
  centerId: z.string().optional(),
  assignedTo: z.string({ required_error: "Has de seleccionar un grup responsable." }).min(1, "Has de seleccionar un grup responsable."),
  description: z.string().min(1, "Les observacions són requerides."),
  typeId: z.string().min(1, "El tipus d'acció és requerit."),
})

interface ActionFormProps {
    mode: 'create' | 'edit' | 'view';
    initialData?: ImprovementAction;
    masterData: any;
    isSubmitting: boolean;
    onSubmit: (values: any, status?: 'Borrador' | 'Pendiente Análisis') => void;
    onCancel?: () => void;
    t: (key: string, ...args: any) => string;
}

export function ActionForm({
    mode,
    initialData,
    masterData,
    isSubmitting,
    onSubmit,
    onCancel,
    t
}: ActionFormProps) {
  const { toast } = useToast()
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  let finalTranscript = '';

  const [isImprovingText, setIsImprovingText] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<ImproveWritingOutput | null>(null);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [hasImprovePrompt, setHasImprovePrompt] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      subcategory: "",
      affectedAreasId: "",
      centerId: "",
      assignedTo: "",
      description: "",
      typeId: "",
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
    if (mode !== 'create' && initialData && masterData) {
        form.reset({
            title: initialData.title,
            description: initialData.description,
            assignedTo: initialData.assignedTo,
            category: initialData.categoryId,
            subcategory: initialData.subcategoryId,
            affectedAreasId: initialData.affectedAreasId,
            centerId: initialData.centerId,
            typeId: initialData.typeId,
        });
    }
  }, [initialData, masterData, form, mode]);


  const selectedCategoryId = form.watch("category");
  const selectedActionTypeId = form.watch("typeId");
  const selectedAffectedAreaId = form.watch("affectedAreasId");

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategoryId || !masterData?.subcategories) return [];
    return masterData.subcategories.filter((sc: any) => sc.categoryId === selectedCategoryId);
  }, [selectedCategoryId, masterData]);
  
  useEffect(() => {
    if (form.getValues("category") !== initialData?.categoryId) {
       form.resetField("subcategory", { defaultValue: "" });
    }
  }, [selectedCategoryId, form, initialData]);

  // Dynamic responsible options logic
  const responsibleOptions = useMemo(() => {
    if (!selectedActionTypeId || !selectedAffectedAreaId || !masterData) return [];
    
    const actionType: ImprovementActionType | undefined = masterData.actionTypes.find((t: any) => t.id === selectedActionTypeId);
    if (!actionType?.possibleAnalysisRoles) return [];

    const affectedArea: AffectedArea | undefined = masterData.affectedAreas.find((a: any) => a.id === selectedAffectedAreaId);
    if (!affectedArea) return [];

    const options: { value: string, label: string }[] = [];
    
    actionType.possibleAnalysisRoles.forEach(roleId => {
      const role: ResponsibilityRole | undefined = masterData.responsibilityRoles.find((r: any) => r.id === roleId);
      if (role) {
        if (role.type === 'Fixed' && role.email) {
          options.push({ value: role.email, label: `${role.name} (${role.email})` });
        } else if (role.type === 'Pattern' && role.emailPattern) {
          // Replace placeholder with the actual ID from the affected area
          const resolvedEmail = role.emailPattern.replace('{{affectedArea.id}}', affectedArea.id!.toLowerCase());
          options.push({ value: resolvedEmail, label: `${role.name} (${resolvedEmail})` });
        }
      }
    });

    return options;
  }, [selectedActionTypeId, selectedAffectedAreaId, masterData]);

  useEffect(() => {
    // Reset responsible person if the options change and the current value is not valid anymore
    const currentResponsible = form.getValues("assignedTo");
    if (responsibleOptions.length > 0 && !responsibleOptions.some(opt => opt.value === currentResponsible)) {
        form.resetField("assignedTo", { defaultValue: "" });
    }
  }, [responsibleOptions, form]);



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
        form.setValue('description', finalTranscript + interimTranscript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({
            variant: "destructive",
            title: "Error de reconeixement de veu",
            description: "No s'ha pogut accedir al micròfon o ha ocorregut un error.",
        })
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
       console.warn("Speech Recognition not supported in this browser.");
    }
    
    return () => {
        recognitionRef.current?.stop();
    }
  }, [form, toast, finalTranscript]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
        toast({
            variant: "destructive",
            title: "Navegador no compatible",
            description: "El teu navegador no suporta el reconeixement de veu.",
        })
        return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      finalTranscript = form.getValues('description');
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleImproveText = async () => {
    const currentDescription = form.getValues('description');
    if (!currentDescription.trim()) {
        toast({
            variant: "destructive",
            title: "Camp buit",
            description: "No hi ha text per a millorar.",
        });
        return;
    }

    setIsImprovingText(true);
    try {
        const response = await improveWriting({ text: currentDescription });
        setAiSuggestion(response);
        setIsSuggestionDialogOpen(true);
    } catch (error) {
        console.error("Error improving text:", error);
        toast({
            variant: "destructive",
            title: "Error de l'IA",
            description: "No s'ha pogut millorar el text.",
        });
    } finally {
        setIsImprovingText(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
        form.setValue('description', aiSuggestion, { shouldValidate: true });
    }
    setIsSuggestionDialogOpen(false);
    setAiSuggestion(null);
  };

  const handleCreateFormSubmit = (status: 'Borrador' | 'Pendiente Análisis') => {
      form.handleSubmit((values) => onSubmit(values, status))();
  };

  const handleEditFormSubmit = (status?: 'Borrador' | 'Pendiente Análisis') => {
    form.handleSubmit((values) => onSubmit(values, status))();
  }
  
  const disableForm = isSubmitting || mode === 'view';

  // View mode only shows the description
  if (mode === 'view' && initialData) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>{t("form.description.label")}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
                {initialData.description}
            </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          
          <FormField
            control={form.control}
            name="typeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.type.label")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={disableForm}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.type.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {masterData?.actionTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("form.type.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.title.label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.title.placeholder")} {...field} disabled={disableForm} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={disableForm}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {masterData?.categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={disableForm || !selectedCategoryId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una subcategoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSubcategories.map((sub: any) => (
                         <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
             <FormField
              control={form.control}
              name="centerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centre</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={disableForm}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un centre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {masterData?.centers.map((center: any) => (
                        <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="affectedAreasId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Àrea Funcional Implicada</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={disableForm}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una àrea implicada" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {masterData?.affectedAreas.map((area: any) => (
                        <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignat A</FormLabel>
                  <Select 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  disabled={disableForm || responsibleOptions.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.responsible.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {responsibleOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t("form.responsible.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.description.label")}</FormLabel>
                 <div className="relative">
                  <FormControl>
                      <Textarea
                      placeholder={t("form.description.placeholder")}
                      className="resize-y min-h-[120px] pr-24"
                      {...field}
                      disabled={disableForm}
                      />
                  </FormControl>
                  {mode !== 'view' && (
                    <div className="absolute right-2 top-2 flex flex-col gap-2">
                        <Button 
                            type="button" 
                            size="icon" 
                            variant="ghost" 
                            onClick={toggleRecording}
                            disabled={disableForm}
                            className={cn("h-8 w-8", isRecording && "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500")}
                            title={t("form.mic.toggle")}
                        >
                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            <span className="sr-only">{isRecording ? "Aturar enregistrament" : "Iniciar enregistrament"}</span>
                        </Button>
                        {hasImprovePrompt && (
                          <Button 
                              type="button" 
                              size="icon" 
                              variant="ghost" 
                              onClick={handleImproveText}
                              disabled={disableForm || isImprovingText}
                              className="h-8 w-8"
                              title={t("form.improve.button")}
                          >
                              {isImprovingText ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                              <span className="sr-only">{t("form.improve.button")}</span>
                          </Button>
                        )}
                    </div>
                  )}
                 </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {mode === 'create' && (
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => handleCreateFormSubmit('Borrador')} disabled={disableForm}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {t("form.saveAsDraft")}
                </Button>
                <Button type="button" onClick={() => handleCreateFormSubmit('Pendiente Análisis')} disabled={disableForm}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {t("form.sendForAnalysis")}
                </Button>
            </div>
          )}

          {mode === 'edit' && (
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    <Ban className="mr-2 h-4 w-4" />
                    {t("form.cancel")}
                </Button>
                <Button type="button" onClick={() => handleEditFormSubmit('Borrador')} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {t("form.saveAsDraft")}
                </Button>
                 <Button type="button" onClick={() => handleEditFormSubmit('Pendiente Análisis')} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {t("form.sendForAnalysis")}
                </Button>
            </div>
          )}
        </form>
      </Form>

      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("form.suggestion.title")}</DialogTitle>
            <DialogDescription>{t("form.suggestion.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="suggestion-description">{t("form.suggestion.improvedDescription")}</Label>
              <Textarea id="suggestion-description" readOnly value={aiSuggestion || ''} rows={10} className="resize-y" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuggestionDialogOpen(false)}>{t("form.suggestion.cancel")}</Button>
            <Button onClick={handleAcceptSuggestion}>{t("form.suggestion.accept")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
