
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getPrompt, updatePrompt, getWorkflowSettings, updateWorkflowSettings } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

const settingsSchema = z.object({
  // Prompts
  improveWritingPrompt: z.string(),
  analysisSuggestionPrompt: z.string(),
  correctiveActionsPrompt: z.string(),
  // Workflow
  analysisDueDays: z.coerce.number().int().positive(),
  implementationDueDays: z.coerce.number().int().positive(),
  closureDueDays: z.coerce.number().int().positive(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AiSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      improveWritingPrompt: "",
      analysisSuggestionPrompt: "",
      correctiveActionsPrompt: "",
      analysisDueDays: 30,
      implementationDueDays: 75,
      closureDueDays: 90,
    },
  })

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      try {
        const [improvePrompt, analysisPrompt, correctiveActionsPrompt, workflowSettings] = await Promise.all([
          getPrompt("improveWriting"),
          getPrompt("analysisSuggestion"),
          getPrompt("correctiveActions"),
          getWorkflowSettings(),
        ]);
        form.setValue("improveWritingPrompt", improvePrompt);
        form.setValue("analysisSuggestionPrompt", analysisPrompt);
        form.setValue("correctiveActionsPrompt", correctiveActionsPrompt);
        form.setValue("analysisDueDays", workflowSettings.analysisDueDays);
        form.setValue("implementationDueDays", workflowSettings.implementationDueDays);
        form.setValue("closureDueDays", workflowSettings.closureDueDays);
      } catch (error) {
        console.error("Failed to load settings:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se ha podido cargar la configuración.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [form, toast])

  const onSubmit = async (values: SettingsFormValues) => {
    setIsSaving(true)
    try {
      await Promise.all([
        updatePrompt("improveWriting", values.improveWritingPrompt),
        updatePrompt("analysisSuggestion", values.analysisSuggestionPrompt),
        updatePrompt("correctiveActions", values.correctiveActionsPrompt),
        updateWorkflowSettings({
            analysisDueDays: values.analysisDueDays,
            implementationDueDays: values.implementationDueDays,
            closureDueDays: values.closureDueDays,
        })
      ]);
      toast({
        title: "¡Guardado!",
        description: "La configuración se ha guardado correctamente.",
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se ha podido guardar la configuración.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Sistema</CardTitle>
        <CardDescription>Gestiona los prompts de la IA y otros parámetros generales del sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando configuración...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <Card>
                  <CardHeader>
                      <CardTitle>Configuración de Vencimientos</CardTitle>
                      <CardDescription>Define los plazos en días que se aplicarán a todas las nuevas acciones de mejora.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                          control={form.control}
                          name="analysisDueDays"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Días para Análisis</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="implementationDueDays"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Días para Implantación</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="closureDueDays"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Días para Cierre</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>Configuración de Prompts de IA</CardTitle>
                      <CardDescription>Gestiona los prompts que utiliza el sistema de inteligencia artificial.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <FormField
                          control={form.control}
                          name="improveWritingPrompt"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Prompt para mejorar la escritura</FormLabel>
                              <FormControl>
                              <Textarea
                                  rows={8}
                                  placeholder="Introduce el prompt para mejorar la escritura..."
                                  className="resize-y"
                                  {...field}
                              />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="analysisSuggestionPrompt"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Prompt para sugerencia de análisis</FormLabel>
                              <FormControl>
                              <Textarea
                                  rows={8}
                                  placeholder="Introduce el prompt para la sugerencia de análisis..."
                                  className="resize-y"
                                  {...field}
                              />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="correctiveActionsPrompt"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Prompt para acciones correctivas</FormLabel>
                              <FormControl>
                              <Textarea
                                  rows={8}
                                  placeholder="Introduce el prompt para las acciones correctivas..."
                                  className="resize-y"
                                  {...field}
                              />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  </CardContent>
              </Card>

              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Configuración
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}

    