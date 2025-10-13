
"use client"

import { useEffect, useState } from "react"
import { getPrompt } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface PromptsState {
  improveWritingPrompt: string;
  analysisSuggestionPrompt: string;
  correctiveActionsPrompt: string;
}

export default function AiSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [prompts, setPrompts] = useState<PromptsState>({
    improveWritingPrompt: "",
    analysisSuggestionPrompt: "",
    correctiveActionsPrompt: "",
  });

  useEffect(() => {
    async function loadPrompts() {
      setIsLoading(true)
      try {
        const [improvePrompt, analysisPrompt, correctiveActionsPrompt] = await Promise.all([
          getPrompt("improveWriting"),
          getPrompt("analysisSuggestion"),
          getPrompt("correctiveActions"),
        ]);
        setPrompts({
          improveWritingPrompt: improvePrompt,
          analysisSuggestionPrompt: analysisPrompt,
          correctiveActionsPrompt: correctiveActionsPrompt,
        });
      } catch (error) {
        console.error("Failed to load prompts:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se han podido cargar los prompts.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadPrompts()
  }, [toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de la IA</CardTitle>
        <CardDescription>Gestiona los prompts y otros parámetros de los asistentes de Inteligencia Artificial.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando configuración...
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="improveWritingPrompt">Prompt de Mejora de Observaciones</Label>
              <Textarea
                id="improveWritingPrompt"
                readOnly
                value={prompts.improveWritingPrompt}
                rows={12}
                className="resize-y bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analysisSuggestionPrompt">Prompt de Análisis de Causas</Label>
              <Textarea
                id="analysisSuggestionPrompt"
                readOnly
                value={prompts.analysisSuggestionPrompt}
                rows={12}
                className="resize-y bg-muted/50"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="correctiveActionsPrompt">Prompt de Acciones Correctivas</Label>
              <Textarea
                id="correctiveActionsPrompt"
                readOnly
                value={prompts.correctiveActionsPrompt}
                rows={12}
                className="resize-y bg-muted/50"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
