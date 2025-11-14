
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { enrichLocationsWithResponsibles } from "@/services/master-data-service";
import { getDueDateSettings, updateDueDateSettings } from "@/ai/flows/check-due-dates-flow";
import { checkDueDates as checkDueDatesFlow } from "@/ai/flows/check-due-dates-flow";
import { Loader2, UploadCloud, Send, Settings, AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getActions } from "@/lib/data";
import type { SentEmailInfo } from "@/lib/types";

const dueDateSettingsSchema = z.object({
  daysUntilDue: z.coerce.number().int().positive(),
});

type DueDateSettingsFormValues = z.infer<typeof dueDateSettingsSchema>;

export default function DataLoadPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoadingResponsibles, setIsLoadingResponsibles] = useState(false);
  const [isCheckingDues, setIsCheckingDues] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmailInfo[]>([]);


  const form = useForm<DueDateSettingsFormValues>({
    resolver: zodResolver(dueDateSettingsSchema),
    defaultValues: {
      daysUntilDue: 10,
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getDueDateSettings();
        form.setValue("daysUntilDue", settings.daysUntilDue);
      } catch (err) {
        console.error("Error loading due date settings:", err);
      }
    }
    loadSettings();
  }, [form]);

  const handleLoadResponsibles = async () => {
    setIsLoadingResponsibles(true);
    setError(null);
    setErrorDetails([]);
    try {
      const updatedCount = await enrichLocationsWithResponsibles();
      toast({
        title: "Carga completada",
        description: `Se han actualizado ${updatedCount} centros con los datos de responsables.`,
      });
    } catch (err: any) {
      console.error("Error loading responsibles:", err);
      setError("Error al cargar los datos de responsables.");
      toast({
        variant: "destructive",
        title: "Error de carga",
        description: "No se han podido actualizar los responsables de los centros.",
      });
    } finally {
      setIsLoadingResponsibles(false);
    }
  };

  const handleCheckDues = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Error de autenticación", description: "No se ha encontrado un usuario autenticado." });
        return;
    }

    setIsCheckingDues(true);
    setError(null);
    setErrorDetails([]);
    setSentEmails([]);
    toast({
        title: "Iniciando proceso...",
        description: "Se está ejecutando la verificación de vencimientos.",
    });

    try {
        const allActions = await getActions();
        
        const result = await checkDueDatesFlow({ actions: allActions, isDryRun: true });

        if (result.errors.length > 0) {
          setError(`Se produjeron errores en ${result.errors.length} acciones.`);
          setErrorDetails(result.errors);
        }
        
        if (result.sentEmails.length > 0) {
            setSentEmails(result.sentEmails);
            toast({
              title: "Proceso finalizado",
              description: `Se simularía el envío de ${result.sentEmails.length} recordatorios.`,
            });
        } else {
             toast({
              title: "Proceso finalizado",
              description: "No se encontró ninguna acción que requiera un recordatorio.",
            });
        }

    } catch (err: any) {
        console.error("Error checking due dates:", err);
        setError("Error al ejecutar el proceso de verificación de vencimientos.");
        toast({
            variant: "destructive",
            title: "Error de Proceso",
            description: "No se ha podido completar la verificación de vencimientos.",
        });
    } finally {
        setIsCheckingDues(false);
    }
  };

  const handleSaveSettings = async (values: DueDateSettingsFormValues) => {
    setIsSavingSettings(true);
    setError(null);
    setErrorDetails([]);
    try {
        await updateDueDateSettings({ daysUntilDue: values.daysUntilDue });
        toast({
            title: "Configuración guardada",
            description: "Los ajustes de los recordatorios de vencimiento se han guardado.",
        });
    } catch (err: any) {
        console.error("Error saving due date settings:", err);
        setError("Error al guardar la configuración.");
        toast({
            variant: "destructive",
            title: "Error al guardar",
            description: "No se pudo guardar la configuración de vencimientos.",
        });
    } finally {
        setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Procesos Manuales</CardTitle>
          <CardDescription>
            Esta sección permite ejecutar procesos de carga y mantenimiento de datos en la base de datos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Alert>
                <UploadCloud className="h-4 w-4" />
                <AlertTitle>Cargar Responsables de Centros</AlertTitle>
                <AlertDescription className="flex flex-col gap-4">
                   <p>
                     Este proceso actualizará todos los centros existentes en la base de datos con la información de responsables (Dependencia, Área, Coordinadores, etc.) contenida en el fichero interno. Esta operación es segura y se puede ejecutar múltiples veces.
                   </p>
                    <Button onClick={handleLoadResponsibles} disabled={isLoadingResponsibles} className="w-fit">
                    {isLoadingResponsibles ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="mr-2 h-4 w-4" />
                    )}
                    {isLoadingResponsibles ? "Cargando..." : "Cargar Responsables de Centros"}
                  </Button>
                </AlertDescription>
            </Alert>
          
            <Alert>
                <Send className="h-4 w-4" />
                <AlertTitle>Verificación de Vencimientos</AlertTitle>
                <AlertDescription className="flex flex-col gap-4">
                    <p>
                        Ejecuta manualmente el proceso que revisa las acciones con fechas de vencimiento próximas y envía recordatorios por correo electrónico a los responsables.
                    </p>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSaveSettings)} className="flex items-end gap-4">
                             <FormField
                                control={form.control}
                                name="daysUntilDue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Avisar cuando falten (días)</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="w-32" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button type="submit" variant="secondary" disabled={isSavingSettings}>
                                {isSavingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                                Guardar Ajuste
                             </Button>
                        </form>
                    </Form>

                    <Button onClick={handleCheckDues} disabled={isCheckingDues}>
                        {isCheckingDues ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        {isCheckingDues ? "Verificando..." : "Ejecutar Verificación de Vencimientos"}
                    </Button>

                </AlertDescription>
            </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{error}</AlertTitle>
              {errorDetails.length > 0 && (
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {errorDetails.map((detail, index) => (
                      <li key={index} className="text-xs">{detail}</li>
                    ))}
                  </ul>
                </AlertDescription>
              )}
            </Alert>
          )}

          {sentEmails.length > 0 && (
             <Alert variant="default" className="border-green-500">
                <Send className="h-4 w-4" />
                <AlertTitle className="text-green-700">Recordatorios Enviados</AlertTitle>
                <AlertDescription>
                  <p>S'han enviat els següents recordatoris per correu electrònic:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    {sentEmails.map((email, index) => (
                      <li key={index} className="text-xs">
                        <strong>Acció {email.actionId}:</strong> "{email.taskDescription}" enviat a {email.recipient}.
                        {email.previewUrl && (
                          <a href={email.previewUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:underline">
                            Veure correu <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
