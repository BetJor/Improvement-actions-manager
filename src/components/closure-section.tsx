
"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"

const closureSchema = z.object({
  notes: z.string().min(1, "Les observacions són requerides."),
  isCompliant: z.boolean().default(true),
})

type ClosureFormValues = z.infer<typeof closureSchema>

interface ClosureSectionProps {
  isSubmitting: boolean
  onSave: (data: ClosureFormValues) => void
}

export function ClosureSection({ isSubmitting, onSave }: ClosureSectionProps) {
  const t = useTranslations("Actions.detail.closure")

  const form = useForm<ClosureFormValues>({
    resolver: zodResolver(closureSchema),
    defaultValues: {
      notes: "",
      isCompliant: true,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">{t("notesLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder={t("notesPlaceholder")}
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
              name="isCompliant"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("isCompliantLabel")}</FormLabel>
                    <FormDescription>{t("isCompliantDescription")}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
  )
}
