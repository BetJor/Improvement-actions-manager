
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTranslations } from "next-intl"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createAction, getActionTypes, getCategories, getSubcategories, getAffectedAreas, groups } from "@/lib/data"
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useState, useMemo, useEffect, useRef } from "react"
import { Loader2, Mic, MicOff, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { improveWriting } from "@/ai/flows/improveWriting"


const formSchema = z.object({
  title: z.string().min(1, "El títol és requerit."),
  category: z.string().min(1, "La categoria és requerida."),
  subcategory: z.string().min(1, "La subcategoria és requerida."),
  affectedAreas: z.string().min(1, "Les àrees implicades són requerides."),
  assignedTo: z.string().min(1, "El camp 'assignat a' és requerit."),
  description: z.string().min(1, "Les observacions són requerides."),
  type: z.string().min(1, "El tipus d'acció és requerit."),
  responsibleGroupId: z.string({ required_error: "Has de seleccionar un grup responsable." }),
})

export default function NewActionPage() {
  const t = useTranslations("NewActionPage")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [actionTypes, setActionTypes] = useState<ImprovementActionType[]>([]);
  const [categories, setCategories] = useState<ActionCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ActionSubcategory[]>([]);
  const [affectedAreas, setAffectedAreas] = useState<AffectedArea[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  let finalTranscript = '';

  const [isImprovingText, setIsImprovingText] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      subcategory: "",
      affectedAreas: "",
      assignedTo: "",
      description: "",
      type: "",
      responsibleGroupId: "",
    },
  })

  useEffect(() => {
    async function loadMasterData() {
      try {
        setIsLoadingData(true);
        const [types, cats, subcats, areas] = await Promise.all([
          getActionTypes(),
          getCategories(),
          getSubcategories(),
          getAffectedAreas(),
        ]);
        setActionTypes(types);
        setCategories(cats);
        setSubcategories(subcats);
        setAffectedAreas(areas);
      } catch (error) {
        console.error("Failed to load master data", error);
        toast({
          variant: "destructive",
          title: "Error de càrrega",
          description: "No s'han pogut carregar les dades mestres. Si us plau, recarrega la pàgina.",
        })
      } finally {
        setIsLoadingData(false);
      }
    }
    loadMasterData();
  }, [toast]);


  const selectedCategoryId = form.watch("category");

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subcategories.filter(sc => sc.categoryId === selectedCategoryId);
  }, [selectedCategoryId, subcategories]);
  
  useEffect(() => {
    form.resetField("subcategory", { defaultValue: "" });
  }, [selectedCategoryId, form]);

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
        form.setValue('description', response.improvedText);
        toast({
            title: "Text millorat",
            description: "La redacció ha estat millorada per la IA.",
        });
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


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error d'autenticació",
        description: "Has d'haver iniciat sessió per a crear una acció.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const actionData = {
        ...values,
        creator: {
          id: user.uid,
          name: user.displayName || "Usuari desconegut",
          avatar: user.photoURL || undefined,
        },
        allCategories: categories,
        allSubcategories: subcategories,
        allAffectedAreas: affectedAreas,
        allActionTypes: actionTypes,
      };
      await createAction(actionData);
      
      toast({
        title: t("form.toast.title"),
        description: t("form.toast.description"),
      });
      
      router.push("/actions");
      router.refresh();
    } catch (error) {
      console.error("Error creating action:", error);
      toast({
        variant: "destructive",
        title: "Error en crear l'acció",
        description: "Hi ha hagut un problema en desar l'acció. Si us plau, torna-ho a provar.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const disableForm = isSubmitting || isLoadingData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingData && <div className="flex items-center gap-2"> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregant dades...</div>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" style={{ display: isLoadingData ? 'none' : 'block' }}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assumpte</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ex., Gestió de l'assistència sanitària" {...field} disabled={disableForm} />
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
                        {categories.map(cat => (
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
                        {filteredSubcategories.map(sub => (
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
                name="affectedAreas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AA.FF. Implicades</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={disableForm}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una àrea implicada" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {affectedAreas.map(area => (
                          <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignat A</FormLabel>
                    <FormControl>
                      <Input placeholder="p. ex., Direcció del Centre" {...field} disabled={disableForm} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observacions</FormLabel>
                   <div className="relative">
                    <FormControl>
                        <Textarea
                        placeholder="Descriu la no conformitat, les evidències, referències documentals, etc."
                        className="resize-y min-h-[120px] pr-24"
                        {...field}
                        disabled={disableForm}
                        />
                    </FormControl>
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
                    </div>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
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
                        {actionTypes.map(type => (
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
                name="responsibleGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.responsible.label")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={disableForm}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.responsible.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
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
            </div>
            
            <Button type="submit" disabled={disableForm}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creant...' : t("form.submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
