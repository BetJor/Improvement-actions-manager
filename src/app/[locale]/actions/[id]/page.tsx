
"use client"

import { useEffect, useState } from "react"
import { getActionById, getActionTypes, getCategories, getSubcategories, getAffectedAreas, updateAction } from "@/lib/data"
import { notFound, useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import type { ImprovementAction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"
import { ActionForm } from "@/components/action-form"
import { AnalysisSection } from "@/components/analysis-section"
import { Button } from "@/components/ui/button"
import { FileEdit, Loader2, Microscope, ShieldCheck, Flag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { es } from "date-fns/locale"


export default function ActionDetailPage() {
  const t = useTranslations("ActionDetailPage")
  const tForm = useTranslations("NewActionPage")
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [action, setAction] = useState<ImprovementAction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [masterData, setMasterData] = useState<any>(null)


  useEffect(() => {
    const actionId = params.id as string;
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
  }, [params.id, toast])

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

  const handleSaveAnalysis = async (analysisData: any) => {
    if (!action) return;
    setIsSubmitting(true);
    try {
      await updateAction(action.id, {
        analysis: analysisData,
        status: "Pendiente Comprobación", // Move to next state
      });

      toast({
        title: "Anàlisi desada",
        description: "El pla d'acció s'ha desat correctament.",
      });

      // Refresh data
      const updatedAction = await getActionById(action.id);
      setAction(updatedAction);

    } catch (error) {
      console.error("Error saving analysis:", error);
      toast({
          variant: "destructive",
          title: "Error en desar",
          description: "No s'ha pogut desar l'anàlisi.",
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
        // The button is inside the AnalysisSection component now
        return null; 
      case "Pendiente Comprobación":
        return <Button><ShieldCheck className="mr-2 h-4 w-4" /> {t("verifyImplementation")}</Button>
      case "Pendiente de Cierre":
        return <Button><Flag className="mr-2 h-4 w-4" /> {t("closeAction")}</Button>
      default:
        return null
    }
  }
  
  const isAnalysisTabDisabled = action?.status === 'Borrador';

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

        <Tabs defaultValue="details" className="w-full">
            <TabsList>
                <TabsTrigger value="details">{t('tabs.details')}</TabsTrigger>
                <TabsTrigger value="analysis" disabled={isAnalysisTabDisabled}>{t('tabs.causesAndProposedAction')}</TabsTrigger>
                <TabsTrigger value="verification" disabled>{t('tabs.implementationVerification')}</TabsTrigger>
                <TabsTrigger value="closure" disabled>{t('tabs.actionClosure')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
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
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
                {action.status === 'Pendiente Análisis' && user ? (
                    <AnalysisSection
                      action={action}
                      user={user}
                      isSubmitting={isSubmitting}
                      onSave={handleSaveAnalysis}
                    />
                ) : action.analysis ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('causesAndProposedAction')}</CardTitle>
                            <CardDescription>
                                {t('analysisPerformedBy', { 
                                    name: action.analysis.analysisResponsible.name, 
                                    date: format(new Date(action.analysis.analysisDate), "PPP", { locale: es }) 
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{t('causesAnalysis')}</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{action.analysis.causes}</p>
                            </div>
                            <Separator />
                             <div>
                                <h3 className="font-semibold text-lg mb-4">{t('proposedAction')}</h3>
                                <div className="space-y-4">
                                    {action.analysis.proposedActions.map((pa, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <p className="font-medium">{pa.description}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Responsable: {pa.responsibleUserId} | Data Venciment: {format(new Date(pa.dueDate), "dd/MM/yyyy")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    <p>L'anàlisi es podrà realitzar un cop l'acció estigui en estat 'Pendent d'Anàlisi'.</p>
                  </div>
                )}
            </TabsContent>
        </Tabs>
    </div>
  )
}

    