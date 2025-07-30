"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { groups, createAction } from "@/lib/data"
import type { ImprovementActionType } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const actionTypes: ImprovementActionType[] = [
  'Correctiva', 'IV DAS-DP', 'IV', 'ACM', 'AMSGP', 'SAU', 'AC', 'ACSGSI', 'ACPSI', 'ACRSC'
]

const formSchema = z.object({
  title: z.string().min(10, "El títol ha de tenir almenys 10 caràcters."),
  description: z.string().min(20, "La descripció ha de tenir almenys 20 caràcters."),
  type: z.enum(actionTypes, { required_error: "Has de seleccionar un tipus."}),
  responsibleGroupId: z.string({ required_error: "Has de seleccionar un grup responsable." }),
})

export default function NewActionPage() {
  const t = useTranslations("NewActionPage")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error d'autenticació",
        description: "Has d'haver iniciat sessió per a crear una acció.",
      })
      return;
    }

    setIsSubmitting(true)

    try {
      const actionData = {
        ...values,
        creator: {
          id: user.uid,
          name: user.displayName || "Usuari desconegut",
          avatar: user.photoURL || undefined,
        }
      }
      const newActionId = await createAction(actionData);
      console.log(`New action created with Firestore ID: ${newActionId}`);
      
      toast({
        title: t("form.toast.title"),
        description: t("form.toast.description"),
      })
      router.push("/actions")
      // Force a refresh of the actions page to show the new one
      router.refresh(); 

    } catch (error) {
      console.error("Error creating action:", error);
      toast({
        variant: "destructive",
        title: "Error en crear l'acció",
        description: "Hi ha hagut un problema en desar l'acció. Si us plau, torna-ho a provar.",
      })
    } finally {
      setIsSubmitting(false)
    }
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.title.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.title.placeholder")} {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>
                    {t("form.title.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.description.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form.description.placeholder")}
                      className="resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("form.description.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.type.label")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.type.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {actionTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("form.type.description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsibleGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.responsible.label")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("form.responsible.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("form.responsible.description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creant...' : t("form.submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
