"use client"

import { useEffect, useState } from "react"
import { getPrompt } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function AiSettingsPage() {
  const { toast } = useToast()
  const [prompts, setPrompts] = useState({
    improveWriting: "",
    analysisSuggestion: "",
    correctiveActions: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      try {
        const [improvePrompt, analysisPrompt, correctiveActionsPrompt] = await Promise.all([
          getPrompt("improveWriting"),
          getPrompt("analysisSuggestion"),
          getPrompt("correctiveActions"),
        ]);
        setPrompts({
          improveWriting: improvePrompt,
          analysisSuggestion: analysisPrompt,
          correctiveActions: correctiveActionsPrompt,
        })
      } catch (error) {
        console.error("Failed to load settings:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se ha podido cargar la configuración de la IA.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de IA</CardTitle>
        <CardDescription>Gestiona los prompts que utiliza el sistema de inteligencia artificial.</CardDescription>
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
              <Label htmlFor="improveWritingPrompt">Prompt para mejorar la escritura</Label>
              <Textarea
                id="improveWritingPrompt"
                readOnly
                value={prompts.improveWriting}
                rows={8}
                className="resize-y bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analysisSuggestionPrompt">Prompt para sugerencia de análisis</Label>
              <Textarea
                id="analysisSuggestionPrompt"
                readOnly
                value={prompts.analysisSuggestion}
                rows={8}
                className="resize-y bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctiveActionsPrompt">Prompt para acciones correctivas</Label>
              <Textarea
                id="correctiveActionsPrompt"
                readOnly
                value={prompts.correctiveActions}
                rows={8}
                className="resize-y bg-muted/50"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
