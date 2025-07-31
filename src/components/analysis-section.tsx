
"use client"

import { useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { users } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, PlusCircle, Trash2, CalendarIcon, Save } from "lucide-react"
import type { ImprovementAction, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const analysisSchema = z.object({
  causes: z.string().min(1, "L'anàlisi de causes és requerit."),
  proposedActions: z.array(
    z.object({
      description: z.string().min(1, "La descripció és requerida."),
      responsibleUserId: z.string().min(1, "El responsable és requerit."),
      dueDate: z.date({ required_error: "La data de venciment és requerida." }),
    })
  ).min(1, "S'ha de proposar almenys una acció."),
  verificationResponsibleUserId: z.string().min(1, "El responsable de verificació és requerit."),
})

type AnalysisFormValues = z.infer<typeof analysisSchema>

interface AnalysisSectionProps {
  action: ImprovementAction;
  user: User;
  isSubmitting: boolean;
  onSave: (data: any) => void;
}

export function AnalysisSection({ action, user, isSubmitting, onSave }: AnalysisSectionProps) {
  const t = useTranslations("ActionDetailPage.analysis")

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      causes: action.analysis?.causes || "",
      proposedActions: action.analysis?.proposedActions || [{ description: "", responsibleUserId: "", dueDate: new Date() }],
      verificationResponsibleUserId: action.analysis?.verificationResponsibleUserId || "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "proposedActions",
  })

  const onSubmit = (values: AnalysisFormValues) => {
    const analysisData = {
        ...values,
        analysisResponsible: {
            id: user.uid,
            name: user.displayName || "Usuari desconegut",
            avatar: user.photoURL || undefined,
        },
        analysisDate: new Date().toISOString(),
    }
    onSave(analysisData)
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
              name="causes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">{t("causes.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder={t("causes.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("proposedActions.title")}</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-md">
                   <div className="flex-1 space-y-2">
                     <FormField
                        control={form.control}
                        name={`proposedActions.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("proposedActions.description")}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder={t("proposedActions.descriptionPlaceholder")} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                   </div>
                   <div className="w-full md:w-1/4 space-y-2">
                    <FormField
                      control={form.control}
                      name={`proposedActions.${index}.responsibleUserId`}
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("proposedActions.responsible")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("proposedActions.responsiblePlaceholder")} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                      )}
                    />
                   </div>
                   <div className="w-full md:w-auto space-y-2">
                        <FormField
                        control={form.control}
                        name={`proposedActions.${index}.dueDate`}
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                               <FormLabel>{t("proposedActions.dueDate")}</FormLabel>
                               <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-full md:w-[240px] pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                        ) : (
                                        <span>{t("proposedActions.dueDatePlaceholder")}</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                               </Popover>
                               <FormMessage />
                            </FormItem>
                        )}
                        />
                   </div>
                   <div className="flex items-end">
                     <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                   </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", responsibleUserId: "", dueDate: new Date() })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("proposedActions.add")}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="verificationResponsibleUserId"
              render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-lg font-semibold">{t("verificationResponsible.label")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="md:max-w-sm">
                                <SelectValue placeholder={t("verificationResponsible.placeholder")} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
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

