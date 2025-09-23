"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createAction, getActionTypes, getCategories, getSubcategories, getAffectedAreas, getResponsibilityRoles, getCenters } from "@/lib/data"
import { ActionForm } from "@/components/action-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useTabs } from "@/hooks/use-tabs"
import { useActionState } from "@/hooks/use-action-state"
import { useLocale } from "next-intl"


export default function NewActionPage() {
  const t = useTranslations("Actions.new")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const locale = useLocale()
  const { closeCurrentTab } = useTabs();
  const { setActions } = useActionState();
  
  const [masterData, setMasterData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false)


  useEffect(() => {
    async function loadMasterData() {
      try {
        setIsLoadingData(true);
        const [types, cats, subcats, areas, roles, centers] = await Promise.all([
          getActionTypes(),
          getCategories(),
          getSubcategories(),
          getAffectedAreas(),
          getResponsibilityRoles(),
          getCenters(),
        ]);
        setMasterData({
            actionTypes: types,
            categories: cats,
            subcategories: subcats,
            affectedAreas: areas,
            responsibilityRoles: roles,
            centers: centers,
        })
      } catch (error) {
        console.error("Failed to load master data", error);
        toast({
          variant: "destructive",
          title: "Error de càrrega",
          description: "No s'han pogut carregar les dades mestres. Si us plau, recarrega la pàgina.",
        })
      } finally {
        setIsLoadingData(false);
      }
    }
    loadMasterData();
  }, [toast]);


  const onSubmit = async (values: any, status: 'Borrador' | 'Pendiente Análisis') => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error d'autenticació",
        description: "Has d'haver iniciat sessió per a crear una acció.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const actionData = {
        ...values,
        status,
        creator: {
          id: user.id,
          name: user.name || "Usuari desconegut",
          avatar: user.avatar || undefined,
        },
        locale: locale, // Pass the current locale
      };
      const newAction = await createAction(actionData, masterData);
      
      // Optimistic update of the global state
      setActions(prevActions => [newAction, ...prevActions]);

      toast({
        title: t("form.toast.title"),
        description: t("form.toast.description"),
      });
      
      closeCurrentTab();
      router.push("/actions");

    } catch (error) {
      console.error("Error creating action:", error);
      toast({
        variant: "destructive",
        title: "Error en crear l'acció",
        description: "Hi ha hagut un problema en desar l'acció. Si us plau, torna-ho a provar.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoadingData ? (
             <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
           ) : (
            <ActionForm
                mode="create"
                masterData={masterData}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                t={t}
            />
           )}
        </CardContent>
      </Card>
  )
}
