
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { getPrompt, updatePrompt } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  improveWritingPrompt: z.string(),
  analysisPrompt: z.string(),
  correctiveActionsPrompt: z.string(),
})

type PromptId = "improveWriting" | "analysis" | "correctiveActions";

export default function AiSettingsPage() {
  const t = useTranslations("AiSettingsPage")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      improveWritingPrompt: "",
      analysisPrompt: "",
      correctiveActionsPrompt: "",
    },
  })

  useEffect(() => {
    async function loadPrompts() {
      setIsLoading(true)
      try {
        const [improvePrompt, analysisPrompt, correctiveActionsPrompt] = await Promise.all([
          getPrompt("improveWriting"),
          getPrompt("analysis"),
          getPrompt("correctiveActions"),
        ]);
        form.setValue("improveWritingPrompt", improvePrompt);
        form.setValue("analysisPrompt", analysisPrompt);
        form.setValue("correctiveActionsPrompt", correctiveActionsPrompt);
      } catch (error) {
        console.error("Failed to load prompts:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No s'han pogut carregar els prompts.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadPrompts()
  }, [form, toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true)
    try {
      await Promise.all([
        updatePrompt("improveWriting", values.improveWritingPrompt),
        updatePrompt("analysis", values.analysisPrompt),
        updatePrompt("correctiveActions", values.correctiveActionsPrompt),
      ]);
      toast({
        title: "Desat!",
        description: "Els prompts s'han guardat correctament.",
      })
    } catch (error) {
      console.error("Failed to save prompts:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'han pogut desar els prompts.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregant configuració...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="improveWritingPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.improvePrompt.label")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={12}
                        placeholder={t("form.improvePrompt.placeholder")}
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
                name="analysisPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.analysisPrompt.label")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={12}
                        placeholder={t("form.analysisPrompt.placeholder")}
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
                    <FormLabel>{t("form.correctiveActionsPrompt.label")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={12}
                        placeholder={t("form.correctiveActionsPrompt.placeholder")}
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("form.save")}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
