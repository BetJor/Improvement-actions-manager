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
import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Loader2, Mic, MicOff, Wand2, Save, Send, Ban, ChevronsUpDown, Check, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { improveWriting } from "@/ai/flows/improveWriting"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Label } from "@/components/ui/label"
import type { ImprovementAction, ImprovementActionType, ResponsibilityRole, AffectedArea, Center, ActionCategory, ActionSubcategory } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { evaluatePattern } from "@/lib/pattern-evaluator"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Badge } from "./ui/badge"


const formSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  categoryId: z.string().min(1, "El origen es requerido."),
  subcategoryId: z.string().optional(),
  affectedAreasIds: z.array(z.string()).min(1, "Debes seleccionar al menos un área implicada."),
  affectedCentersIds: z.array(z.string()).optional(),
  centerId: z.string().optional(),
  assignedTo: z.string({ required_error: "Debes seleccionar un grupo responsable." }).min(1, "Debes seleccionar un grupo responsable."),
  description: z.string().min(1, "Las observaciones son requeridas."),
  typeId: z.string().min(1, "El ámbito es requerido."),
})

interface ActionFormProps {
    mode: 'create' | 'edit' | 'view';
    initialData?: ImprovementAction;
    masterData: any;
    isSubmitting: boolean;
    onSubmit: (values: any, status?: 'Borrador' | 'Pendiente Análisis') => void;
    onCancel?: () => void;
    editButton?: React.ReactNode;
    key?: string;
    isAdmin: boolean;
    onEditField: (field: string, label: string, value: any, options?: any, fieldType?: string) => void;
}


const ReadOnlyField = ({ label, value }: { label: string; value?: string | React.ReactNode; }) => {
  if (!value) return null;
  return (
    <div className="grid gap-1.5">
      <Label className="text-primary">{label}</Label>
      <div className="text-sm font-medium break-words">
        {value}
      </div>
    </div>
  );
};


export function ActionForm({
    mode,
    initialData,
    masterData,
    isSubmitting,
    onSubmit,
    onCancel,
    editButton,
    isAdmin,
    onEditField
}: ActionFormProps) {
  const { toast } = useToast()
  const { user, userRoles } = useAuth()
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  let finalTranscript = '';

  const [isImprovingText, setIsImprovingText] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
  const [hasImprovePrompt, setHasImprovePrompt] = useState(false);
  
  const [isCenterPopoverOpen, setIsCenterPopoverOpen] = useState(false);
  const [isAffectedCentersPopoverOpen, setIsAffectedCentersPopoverOpen] = useState(false);

 const initialFormValues = useMemo(() => {
    if (initialData) {
      return {
        title: initialData.title || "",
        description: initialData.description || "",
        assignedTo: initialData.assignedTo || "",
        categoryId: initialData.categoryId || "",
        subcategoryId: initialData.subcategoryId || "",
        affectedAreasIds: initialData.affectedAreasIds || [],
        affectedCentersIds: initialData.affectedCentersIds || [],
        centerId: initialData.centerId || "",
        typeId: initialData.typeId || "",
      };
    }
    return {
      title: "",
      categoryId: "",
      subcategoryId: "",
      affectedAreasIds: [],
      affectedCentersIds: [],
      centerId: "",
      assignedTo: "",
      description: "",
      typeId: "",
    };
  }, [initialData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const { reset } = form;

  useEffect(() => {
      reset(initialFormValues);
  }, [initialData, reset, initialFormValues]);

  
  const selectedActionTypeId = form.watch("typeId");
  const selectedCategoryId = form.watch("categoryId");
  const selectedCenterId = form.watch("centerId");
  const selectedAffectedAreasIds = form.watch("affectedAreasIds");
  const selectedAffectedCentersIds = form.watch("affectedCentersIds");

  const filteredAmbits = useMemo(() => {
    if (!masterData?.ambits?.data) return [];
    if (isAdmin) {
        return masterData.ambits.data;
    }
    return masterData.ambits.data.filter((ambit: ImprovementActionType) => {
        if (!ambit.possibleCreationRoles || ambit.possibleCreationRoles.length === 0) return false;
        return ambit.possibleCreationRoles.some(roleId => userRoles.includes(roleId));
    });
  }, [masterData, isAdmin, userRoles]);

  const filteredCategories = useMemo(() => {
    if (!selectedActionTypeId || !masterData?.origins?.data) return [];
    return masterData.origins.data.filter((c: ActionCategory) => 
        !c.actionTypeIds || c.actionTypeIds.length === 0 || c.actionTypeIds.includes(selectedActionTypeId)
    );
  }, [selectedActionTypeId, masterData]);

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategoryId || !masterData?.classifications?.data) return [];
    return masterData.classifications.data.filter((sc: ActionSubcategory) => sc.categoryId === selectedCategoryId);
  }, [selectedCategoryId, masterData]);
  
  const responsibleOptions = useMemo(() => {
    if (!selectedActionTypeId || !masterData || !user) return [];
    const actionType: ImprovementActionType | undefined = masterData.ambits?.data.find((t: any) => t.id === selectedActionTypeId);
    if (!actionType?.possibleAnalysisRoles) return [];

    const options: { value: string, label: string }[] = [];
    
    actionType.possibleAnalysisRoles.forEach(roleId => {
        const role: ResponsibilityRole | undefined = masterData.responsibilityRoles?.data.find((r: any) => r.id === roleId);
        if (role) {
            if (role.type === 'Fixed' && role.email) {
                options.push({ value: role.email, label: `${role.name} (${role.email})` });
            } else if (role.type === 'Pattern' && role.emailPattern) {
                const center: Center | undefined = masterData.centers?.data.find((c: any) => c.id === selectedCenterId);
                const context = { action: { creator: user, center: center, affectedAreasIds: selectedAffectedAreasIds } };
                const resolvedEmails = evaluatePattern(role.emailPattern, context);
                resolvedEmails.forEach(email => {
                    if (email && !email.includes('{')) options.push({ value: email, label: `${role.name} (${email})` });
                });
            }
        }
    });

    if ((mode === 'edit' || mode === 'view') && initialData?.assignedTo && !options.some(opt => opt.value === initialData.assignedTo)) {
        options.push({ value: initialData.assignedTo, label: initialData.assignedTo });
    }

    return options.filter((option, index, self) => index === self.findIndex((t) => (t.value === option.value)));
  }, [selectedActionTypeId, selectedCenterId, selectedAffectedAreasIds, masterData, user, initialData, mode]);
  

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
        form.setValue('description', finalTranscript + interimTranscript);
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
      finalTranscript = form.getValues('description');
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleImproveText = async () => {
    const currentDescription = form.getValues('description');
    if (!currentDescription.trim()) {
      toast({ variant: "destructive", title: "Campo vacío" });
      return;
    }
    setIsImprovingText(true);
    try {
      const improvedText = await improveWriting({ text: currentDescription });
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
      form.setValue('description', aiSuggestion, { shouldValidate: true });
    }
    setIsSuggestionDialogOpen(false);
    setAiSuggestion(null);
  };

  const handleFormSubmit = (status: 'Borrador' | 'Pendiente Análisis') => {
      // Manual validation before submitting
      const values = form.getValues();
      let isValid = true;
      let valuesToSubmit = { ...values };
      
      // Check if categoryId is valid for the selected typeId
      if (valuesToSubmit.categoryId) {
        const categoryIsValid = filteredCategories.some(c => c.id === valuesToSubmit.categoryId);
        if (!categoryIsValid) {
          form.setError('categoryId', { type: 'manual', message: 'El origen ya no es válido para el ámbito seleccionado.' });
          isValid = false;
        }
      }

      // If category is valid, check subcategory.
      // If subcategory is no longer valid for the new category, just clear it as it's not required.
      if (isValid && valuesToSubmit.subcategoryId) {
        const subcategoryIsValid = filteredSubcategories.some(sc => sc.id === valuesToSubmit.subcategoryId);
        if (!subcategoryIsValid) {
           valuesToSubmit.subcategoryId = ''; // Clear the invalid subcategory ID
           (valuesToSubmit as any).subcategory = ''; // Clear the invalid subcategory name
        }
      }

      if (isValid) {
        form.handleSubmit(() => onSubmit(valuesToSubmit, status))();
      } else {
        // Trigger validation to show all other errors
        form.trigger();
      }
  };

  const disableForm = isSubmitting || mode === 'view';

  return (
    <>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
           <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>Detalles de la Acción</CardTitle>
                        {mode === 'edit' && <CardDescription>Estás editando los detalles de esta acción.</CardDescription>}
                    </div>
                    {editButton}
                </CardHeader>
                <CardContent>
                    {mode === 'view' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <ReadOnlyField label="Ámbito" value={initialData?.type} />
                            <ReadOnlyField label="Origen" value={initialData?.category} />
                            <ReadOnlyField label="Clasificación" value={initialData?.subcategory} />
                            <ReadOnlyField 
                                label="Áreas Funcionales Implicadas" 
                                value={
                                    initialData?.affectedAreas && initialData.affectedAreas.length > 0 ? (
                                        <ul className="list-disc pl-5">
                                            {initialData.affectedAreas.map(area => <li key={area}>{area}</li>)}
                                        </ul>
                                    ) : "N/A"
                                }
                            />
                            <ReadOnlyField label="Centro Principal" value={initialData?.center} />
                            <ReadOnlyField 
                                label="Centros afectados" 
                                value={
                                    initialData?.affectedCenters && initialData.affectedCenters.length > 0 ? (
                                       <ul className="list-disc pl-5">
                                            {initialData.affectedCenters.map(center => <li key={center}>{center}</li>)}
                                        </ul>
                                    ) : "N/A"
                                } 
                            />
                            <ReadOnlyField label="Asignado A (Responsable Análisis)" value={initialData?.assignedTo} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asunto</FormLabel>
                                    <FormControl>
                                    <Input placeholder="p. ej., Optimización del proceso de facturación" {...field} disabled={disableForm} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="typeId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ámbito</FormLabel>
                                        <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            form.setValue('categoryId', '');
                                            form.setValue('subcategoryId', '');
                                        }} value={field.value} disabled={disableForm || !filteredAmbits || filteredAmbits.length === 0}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un ámbito" /></SelectTrigger></FormControl>
                                        <SelectContent>{filteredAmbits?.map((opt: any) => (<SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Origen</FormLabel>
                                        <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            form.setValue('subcategoryId', '');
                                        }} value={field.value} disabled={disableForm || !filteredCategories || filteredCategories.length === 0}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un origen" /></SelectTrigger></FormControl>
                                        <SelectContent>{filteredCategories?.map((opt: any) => (<SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            
                            <FormField
                                control={form.control}
                                name="subcategoryId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Clasificación</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={disableForm || !filteredSubcategories || filteredSubcategories.length === 0}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una clasificación" /></SelectTrigger></FormControl>
                                    <SelectContent>{filteredSubcategories?.map((opt: any) => (<SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="centerId"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel>Centro Principal</FormLabel>
                                        <Popover open={isCenterPopoverOpen} onOpenChange={setIsCenterPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                            <Button variant="outline" role="combobox" disabled={disableForm} className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                {field.value && masterData?.centers?.data ? masterData.centers.data.find((center: Center) => center.id === field.value)?.name : "Selecciona un centre"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Cerca un centre..." />
                                                <CommandList className="max-h-72">
                                                    <CommandEmpty>No se ha trobat cap centre.</CommandEmpty>
                                                    <CommandGroup>
                                                        {masterData?.centers?.data?.map((center: Center) => (
                                                        <CommandItem value={center.name} key={center.id} onSelect={() => { form.setValue("centerId", center.id!); setIsCenterPopoverOpen(false); }}>
                                                            <Check className={cn("mr-2 h-4 w-4", center.id === field.value ? "opacity-100" : "opacity-0")} />
                                                            {center.name}
                                                        </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                <FormField
                                control={form.control}
                                name="affectedAreasIds"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel>Áreas Funcionales Implicadas</FormLabel>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" disabled={disableForm} className={cn("w-full justify-start text-left font-normal", !field.value?.length && "text-muted-foreground")}>
                                                        <span className="truncate">{field.value?.length > 0 ? `${field.value.length} área(s) seleccionada(s)` : "Selecciona áreas"}</span>
                                                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]" align="start">
                                                <DropdownMenuLabel>Áreas Afectadas</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {masterData?.affectedAreas?.map((area: AffectedArea) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={area.id}
                                                        checked={field.value?.includes(area.id!)}
                                                        onSelect={(e) => e.preventDefault()}
                                                        onCheckedChange={(checked) => {
                                                            const currentSelection = field.value || [];
                                                            const newSelection = checked
                                                                ? [...currentSelection, area.id!]
                                                                : currentSelection.filter(id => id !== area.id);
                                                            field.onChange(newSelection);
                                                        }}
                                                    >
                                                        {area.name}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {selectedAffectedAreasIds && selectedAffectedAreasIds.length > 0 && (
                                            <div className="p-2 border rounded-md text-sm text-muted-foreground space-y-1">
                                                {selectedAffectedAreasIds.map(id => (
                                                    <div key={id}>{masterData.affectedAreas.find((a: AffectedArea) => a.id === id)?.name}</div>
                                                ))}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="affectedCentersIds"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel>Centros afectados</FormLabel>
                                        <Popover open={isAffectedCentersPopoverOpen} onOpenChange={setIsAffectedCentersPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" disabled={disableForm} className={cn("w-full justify-start text-left font-normal", !field.value?.length && "text-muted-foreground")}>
                                                        <span className="truncate">
                                                            {field.value?.length > 0 ? `${field.value.length} centro(s) seleccionado(s)` : "Selecciona centros"}
                                                        </span>
                                                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Busca un centro..." />
                                                    <CommandList className="max-h-72">
                                                        <CommandEmpty>No se encontraron centros.</CommandEmpty>
                                                        <CommandGroup>
                                                            {masterData?.centers?.data?.map((center: Center) => (
                                                                <CommandItem
                                                                    key={center.id}
                                                                    value={center.name}
                                                                    onSelect={() => {
                                                                        const currentSelection = field.value || [];
                                                                        const newSelection = currentSelection.includes(center.id!)
                                                                            ? currentSelection.filter(id => id !== center.id)
                                                                            : [...currentSelection, center.id!];
                                                                        field.onChange(newSelection);
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", field.value?.includes(center.id!) ? "opacity-100" : "opacity-0")} />
                                                                    {center.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {selectedAffectedCentersIds && selectedAffectedCentersIds.length > 0 && (
                                            <div className="p-2 border rounded-md text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                                                {selectedAffectedCentersIds.map(id => (
                                                    <div key={id}>{masterData.centers.data.find((c: Center) => c.id === id)?.name}</div>
                                                ))}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                                <FormField
                                    control={form.control}
                                    name="assignedTo"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asignado A (Responsable Análisis)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={disableForm || !responsibleOptions || responsibleOptions.length === 0}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una persona responsable" /></SelectTrigger></FormControl>
                                        <SelectContent>{responsibleOptions?.map((opt: any) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                        </div>
                    )}
                </CardContent>
           </Card>

            
           <Card>
                <CardHeader>
                    <CardTitle>Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    {mode === 'view' ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{initialData?.description}</p>
                    ) : (
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                <FormControl>
                                    <Textarea placeholder="Describe la no conformidad o el área de mejora..." className="flex-grow resize-y min-h-[120px] border-none focus-visible:ring-0 focus-visible:ring-offset-0" {...field} disabled={disableForm} />
                                </FormControl>
                                {mode !== 'view' && (
                                    <div className="flex flex-col gap-2 p-2 self-start">
                                        <Button type="button" size="icon" variant="ghost" onClick={toggleRecording} disabled={disableForm} className={cn("h-8 w-8", isRecording && "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500")} title="Activar/desactivar el micrófono"><Mic className="h-4 w-4" /><span className="sr-only">{isRecording ? "Detener grabación" : "Iniciar grabación"}</span></Button>
                                        {hasImprovePrompt && (<Button type="button" size="icon" variant="ghost" onClick={handleImproveText} disabled={disableForm || isImprovingText} className="h-8 w-8" title="Mejorar texto con IA">{isImprovingText ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}<span className="sr-only">Mejorar texto con IA</span></Button>)}
                                    </div>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    )}
                </CardContent>
            </Card>

          {mode === 'create' && (
              <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => handleFormSubmit('Borrador')} disabled={disableForm}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Guardar Borrador
                  </Button>
                  <Button type="button" onClick={() => handleFormSubmit('Pendiente Análisis')} disabled={disableForm}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Enviar para Análisis
                  </Button>
              </div>
          )}

          {mode === 'edit' && (
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}><Ban className="mr-2 h-4 w-4" />Cancelar</Button>
                <Button type="button" onClick={() => handleFormSubmit('Borrador')} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Guardar Borrador</Button>
                <Button type="button" onClick={() => onSubmit(form.getValues(), 'Pendiente Análisis')} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Enviar para Análisis</Button>
            </div>
          )}
        </form>
      </Form>

      <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sugerencia de la IA</DialogTitle>
            <DialogDescription>El asistente ha generado la siguiente descripción. ¿Quieres aceptar estos cambios?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="suggestion-description">Descripción mejorada</Label>
              <Textarea id="suggestion-description" readOnly value={aiSuggestion || ''} rows={10} className="resize-y" />
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
