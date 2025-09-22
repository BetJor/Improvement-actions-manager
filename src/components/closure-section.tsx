
"use client"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save } from "lucide-react"

const closureSchema = z.object({
  notes: z.string().min(1, "Las observaciones son requeridas."),
  isCompliant: z.boolean().default(true),
})

type ClosureFormValues = z.infer<typeof closureSchema>

interface ClosureSectionProps {
  isSubmitting: boolean
  onSave: (data: ClosureFormValues) => void
}

export function ClosureSection({ isSubmitting, onSave }: ClosureSectionProps) {

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
        <CardTitle>Cierre de la Acción</CardTitle>
        <CardDescription>Finaliza la acción de mejora registrando las conclusiones finales.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Observaciones del Cierre</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Describe el resultado final, lecciones aprendidas, etc."
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
                    <FormLabel className="text-base">¿El resultado final es conforme?</FormLabel>
                    <FormDescription>Si se marca como 'No Conforme', se generará automáticamente una nueva acción (BIS) para continuar el seguimiento.</FormDescription>
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
              Guardar y Cerrar Acción
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
