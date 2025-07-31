
"use client"

import { useEffect, useState } from "react"
import { getActionById, getActionTypes, getCategories, getSubcategories, getAffectedAreas, updateAction } from "@/lib/data"
import { notFound, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import type { ImprovementAction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"
import { ActionForm } from "@/components/action-form"
import { Button } from "@/components/ui/button"
import { FileEdit, Loader2, Microscope, ShieldCheck, Flag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DetailPageProps {
  params: { id: string }
}

export default function ActionDetailPage({ params }: DetailPageProps) {
  const t = useTranslations("ActionDetailPage")
  const tForm = useTranslations("NewActionPage")
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [action, setAction] = useState<ImprovementAction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)


  useEffect(() => {
    // Correct way to get actionId from params in a Client Component
    const actionId = params.id;
    if (!actionId) return;

    async function loadData() {
      setIsLoading(true)
      try {
        const [
          actionData, 
          types, 
          cats, 
          subcats, 
          areas
        ] = await Promise.all([
          getActionById(actionId),
          getActionTypes(),
          getCategories(),
          getSubcategories(),
          getAffectedAreas(),
        ]);

        if (!actionData) {
          notFound()
          return
        }
        setAction(actionData)
        setMasterData({
            actionTypes: types,
            categories: cats,
            subcategories: subcats,
            affectedAreas: areas,
        })

      } catch (error) {
        console.error("Error loading action details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No s'ha pogut carregar l'acció.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [params, toast])

  const handleEdit = async (formData: any, status?: 'Borrador' | 'Pendiente Análisis') => {
    if (!action) return;
    setIsSubmitting(true);
    try {
        const dataToUpdate = { ...formData };
        if (status) {
          dataToUpdate.status = status;
        }
        
        await updateAction(action.id, dataToUpdate, masterData, status);
        toast({
            title: "Acció actualitzada",
            description: "L'acció s'ha desat correctament.",
        });
        // Refresh data after update
        const updatedAction = await getActionById(action.id);
        setAction(updatedAction);
        setIsEditing(false); // Exit edit mode
    } catch (error) {
        console.error("Error updating action:", error);
        toast({
            variant: "destructive",
            title: "Error en desar",
            description: "No s'ha pogut actualitzar l'acció.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const getActionButtons = (status: string) => {
    if (isEditing) return null; // No show buttons in edit mode

    switch (status) {
      case "Borrador":
        return <Button onClick={() => setIsEditing(true)}><FileEdit className="mr-2 h-4 w-4" /> {t("editDraft")}</Button>
      case "Pendiente Análisis":
        return <Button><Microscope className="mr-2 h-4 w-4" /> {t("performAnalysis")}</Button>
      case "Pendiente Comprobación":
        return <Button><ShieldCheck className="mr-2 h-4 w-4" /> {t("verifyImplementation")}</Button>
      case "Pendiente de Cierre":
        return <Button><Flag className="mr-2 h-4 w-4" /> {t("closeAction")}</Button>
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Carregant...</div>
  }

  if (!action) {
    return null; // or a not found component
  }

  return (
    <div className="flex flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">{action.actionId}: {isEditing ? t("editingTitle") : action.title}</h1>
            <p className="text-muted-foreground mt-1">{isEditing ? t("editingDescription") : t("viewingDescription")}</p>
            </div>
            <div className="flex-shrink-0">
                {getActionButtons(action.status)}
            </div>
        </header>

        <ActionForm 
            mode={isEditing ? 'edit' : 'view'}
            initialData={action}
            masterData={masterData}
            isLoadingMasterData={!masterData}
            isSubmitting={isSubmitting}
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
            t={tForm}
        />

        {/* TODO: We can add other info cards here later, like workflow, analysis, etc. */}
    </div>
  )
}
