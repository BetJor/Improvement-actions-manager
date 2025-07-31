
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createAction, getActionTypes, getCategories, getSubcategories, getAffectedAreas, getPrompt } from "@/lib/data"
import type { ImprovementActionType, ActionCategory, ActionSubcategory, AffectedArea } from "@/lib/types"
import { ActionForm } from "@/components/action-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"


export default function NewActionPage() {
  const t = useTranslations("NewActionPage")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  
  const [masterData, setMasterData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false)


  useEffect(() => {
    async function loadMasterData() {
      try {
        setIsLoadingData(true);
        const [types, cats, subcats, areas] = await Promise.all([
          getActionTypes(),
          getCategories(),
          getSubcategories(),
          getAffectedAreas(),
        ]);
        setMasterData({
            actionTypes: types,
            categories: cats,
            subcategories: subcats,
            affectedAreas: areas,
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
          id: user.uid,
          name: user.displayName || "Usuari desconegut",
          avatar: user.photoURL || undefined,
        },
      };
      await createAction(actionData, masterData);
      
      toast({
        title: t("form.toast.title"),
        description: t("form.toast.description"),
      });
      
      router.push("/actions");
      router.refresh();
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
            <ActionForm
                mode="create"
                masterData={masterData}
                isLoadingMasterData={isLoadingData}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                t={t}
            />
        </CardContent>
      </Card>
  )
}
