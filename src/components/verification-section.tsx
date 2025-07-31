
"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { ImprovementAction, User, ProposedActionStatus } from "@/lib/types"
import { Loader2, Save } from "lucide-react"

const verificationSchema = z.object({
  notes: z.string().min(1, "Les observacions són requerides."),
  proposedActionsStatus: z.record(z.string(), z.enum(["Implementada", "Implementada Parcialment", "No Implementada"])),
})

type VerificationFormValues = z.infer<typeof verificationSchema>

interface VerificationSectionProps {
  action: ImprovementAction
  user: User
  isSubmitting: boolean
  onSave: (data: any) => void
}

export function VerificationSection({ action, user, isSubmitting, onSave }: VerificationSectionProps) {
  const t = useTranslations("ActionDetailPage.verification")

  const defaultStatuses = action.analysis?.proposedActions.reduce((acc, pa) => {
    acc[pa.id] = action.verification?.proposedActionsStatus[pa.id] || "No Implementada"
    return acc
  }, {} as Record<string, ProposedActionStatus>)

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      notes: action.verification?.notes || "",
      proposedActionsStatus: defaultStatuses,
    },
  })

  const onSubmit = (values: VerificationFormValues) => {
    const verificationData = {
      ...values,
      isEffective: true, // This could be another field in the form
      verificationResponsible: {
        id: user.uid,
        name: user.displayName || "Usuari desconegut",
        avatar: user.photoURL || undefined,
      },
      verificationDate: new Date().toISOString(),
    }
    onSave(verificationData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">{t("notesLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t("notesPlaceholder")}
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("statusOfActions")}</h3>
              {action.analysis?.proposedActions.map((pa) => (
                <FormField
                  key={pa.id}
                  control={form.control}
                  name={`proposedActionsStatus.${pa.id}`}
                  render={({ field }) => (
                    <FormItem className="p-4 border rounded-lg">
                      <FormLabel className="font-medium">{pa.description}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4 pt-2"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Implementada" id={`${pa.id}-implemented`} />
                            </FormControl>
                            <FormLabel htmlFor={`${pa.id}-implemented`} className="font-normal">{t("status.implemented")}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Implementada Parcialment" id={`${pa.id}-partial`} />
                            </FormControl>
                            <FormLabel htmlFor={`${pa.id}-partial`} className="font-normal">{t("status.partiallyImplemented")}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="No Implementada" id={`${pa.id}-not-implemented`} />
                            </FormControl>
                            <FormLabel htmlFor={`${pa.id}-not-implemented`} className="font-normal">{t("status.notImplemented")}</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

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
