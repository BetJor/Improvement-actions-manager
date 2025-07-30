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
import { groups, createAction, actionTypes, categories, subcategories } from "@/lib/data"
import type { ImprovementActionType, ActionSubcategory } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useState, useMemo } from "react"
import { Loader2 } from "lucide-react"

const typeEnum = z.enum(actionTypes);

const formSchema = z.object({
  title: z.string().min(1, "El títol és requerit."), // Asunto
  category: z.string().min(1, "La categoria és requerida."),
  subcategory: z.string().min(1, "La subcategoria és requerida."),
  affectedAreas: z.string().min(1, "Les àrees implicades són requerides."),
  assignedTo: z.string().min(1, "El camp 'assignat a' és requerit."),
  description: z.string().min(1, "Les observacions són requerides."), // Observaciones
  type: typeEnum,
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
      category: "",
      subcategory: "",
      affectedAreas: "",
      assignedTo: "",
      description: "",
    },
  })

  const selectedCategoryId = form.watch("category");

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subcategories.filter(sc => sc.categoryId === selectedCategoryId);
  }, [selectedCategoryId]);

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
      // Find the name of the category, subcategory and type to store in the DB
      const categoryName = categories.find(c => c.id === values.category)?.name || values.category;
      const subcategoryName = subcategories.find(s => s.id === values.subcategory)?.name || values.subcategory;

      const actionData = {
        ...values,
        category: categoryName,
        subcategory: subcategoryName,
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assumpte</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ex., Gestió de l'assistència sanitària" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || !selectedCategoryId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una subcategoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSubcategories.map(sub => (
                           <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="affectedAreas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AA.FF. Implicades</FormLabel>
                    <FormControl>
                      <Input placeholder="p. ex., Direcció Assistència Sanitària" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignat A</FormLabel>
                    <FormControl>
                      <Input placeholder="p. ex., Direcció del Centre" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observacions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descriu la no conformitat, les evidències, referències documentals, etc."
                      className="resize-y min-h-[120px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
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
