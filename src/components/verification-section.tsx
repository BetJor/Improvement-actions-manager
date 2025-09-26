"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { ImprovementAction, User, ProposedActionVerificationStatus } from "@/lib/types"
import { Loader2, Save } from "lucide-react"

const verificationSchema = z.object({
  notes: z.string().min(1, "Las observaciones son requeridas."),
  proposedActionsVerificationStatus: z.record(z.string(), z.enum(["Verificada", "No Verificada"])),
})

type VerificationFormValues = z.infer<typeof verificationSchema>

interface VerificationSectionProps {
  action: ImprovementAction
  user: User
  isSubmitting: boolean
  onSave: (data: any) => void
}

export function VerificationSection({ action, user, isSubmitting, onSave }: VerificationSectionProps) {

  const defaultStatuses = action.analysis?.proposedActions.reduce((acc, pa) => {
    acc[pa.id] = action.verification?.proposedActionsVerificationStatus?.[pa.id] || "No Verificada";
    return acc
  }, {} as Record<string, ProposedActionVerificationStatus>)

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      notes: action.verification?.notes || "",
      proposedActionsVerificationStatus: defaultStatuses,
    },
  })

  const onSubmit = (values: VerificationFormValues) => {
    const verificationData = {
      ...values,
      isEffective: true, // This could be another field in the form
      verificationResponsible: {
        id: user.id,
        name: user.name || "Usuario desconocido",
        avatar: user.avatar || undefined,
      },
      verificationDate: new Date().toISOString(),
    }
    onSave(verificationData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación de la Implantación</CardTitle>
        <CardDescription>Comprueba si las acciones propuestas se han implantado y si han sido eficaces.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Observaciones Generales</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Añade aquí tus observaciones sobre el proceso de verificación..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Estado de las Acciones Propuestas</h3>
              {action.analysis?.proposedActions.map((pa) => (
                <FormField
                  key={pa.id}
                  control={form.control}
                  name={`proposedActionsVerificationStatus.${pa.id}`}
                  render={({ field }) => (
                    <FormItem className="p-4 border rounded-lg">
                      <FormLabel className="font-medium">{pa.description}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col sm:flex-row gap-4 pt-2"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Verificada" id={`${pa.id}-verified`} />
                            </FormControl>
                            <FormLabel htmlFor={`${pa.id}-verified`} className="font-normal">Verificada</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="No Verificada" id={`${pa.id}-not-verified`} />
                            </FormControl>
                            <FormLabel htmlFor={`${pa.id}-not-verified`} className="font-normal">No Verificada</FormLabel>
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
              Guardar Verificación y Avanzar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
