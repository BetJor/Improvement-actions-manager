
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
  improveWritingPrompt: z.string().min(10, "El prompt ha de tenir almenys 10 caràcters."),
})

export default function AiSettingsPage() {
  const t = useTranslations("AiSettingsPage")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      improveWritingPrompt: "",
    },
  })

  useEffect(() => {
    async function loadPrompt() {
      setIsLoading(true)
      try {
        const prompt = await getPrompt("improveWriting")
        form.setValue("improveWritingPrompt", prompt)
      } catch (error) {
        console.error("Failed to load prompt:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No s'ha pogut carregar el prompt.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadPrompt()
  }, [form, toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true)
    try {
      await updatePrompt("improveWriting", values.improveWritingPrompt)
      toast({
        title: "Desat!",
        description: "El prompt s'ha guardat correctament.",
      })
    } catch (error) {
      console.error("Failed to save prompt:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No s'ha pogut desar el prompt.",
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="improveWritingPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.improvePrompt.label")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={15}
                        placeholder={t("form.improvePrompt.placeholder")}
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
