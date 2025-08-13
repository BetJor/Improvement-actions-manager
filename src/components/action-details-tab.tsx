

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { getActionById, updateAction, getUsers } from "@/lib/data"
import type { ImprovementAction, User } from "@/lib/types"
import { ActionForm } from "@/components/action-form"
import { Button } from "@/components/ui/button"
import { AnalysisSection } from "@/components/analysis-section"
import { VerificationSection } from "@/components/verification-section"
import { ClosureSection } from "@/components/closure-section"
import { ActionDetailsPanel } from "@/components/action-details-panel"
import { Loader2, FileEdit, Edit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import type { ProposedActionStatus } from "@/lib/types"
import { useRouter } from "next/navigation"
import { UpdateActionStatusDialog } from "./update-action-status-dialog"


interface ActionDetailsTabProps {
    initialAction: ImprovementAction;
    masterData: any;
}

export function ActionDetailsTab({ initialAction, masterData }: ActionDetailsTabProps) {
    const t = useTranslations("Actions.detail")
    const tForm = useTranslations("Actions.new")
    const { toast } = useToast()
    const router = useRouter();
    const { user } = useAuth()

    const [action, setAction] = useState<ImprovementAction>(initialAction);
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [users, setUsers] = useState<User[]>([]);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedProposedAction, setSelectedProposedAction] = useState<any>(null);


    useEffect(() => {
      async function loadUsers() {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      }
      loadUsers();
    }, []);

    // Aquest efecte assegura que si la propietat inicial canvia (p.ex. per una navegació SPA),
    // l'estat local s'actualitza.
    useEffect(() => {
        setAction(initialAction);
    }, [initialAction]);
    
    const handleActionUpdate = async () => {
        const updatedAction = await getActionById(action.id);
        if (updatedAction) {
            setAction(updatedAction);
        }
    }

    const handleEditSubmit = async (formData: any, status?: 'Borrador' | 'Pendiente Análisis') => {
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
            setIsEditing(false); // Exit edit mode
            await handleActionUpdate(); // Refresh data
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

    const handleAnalysisSave = async (analysisData: any) => {
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
    
          await handleActionUpdate();
    
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

    const handleVerificationSave = async (verificationData: any) => {
        if (!action) return;
        setIsSubmitting(true);
        try {
          await updateAction(action.id, {
            verification: verificationData,
            status: "Pendiente de Cierre", // Move to next state
          });
    
          toast({
            title: "Verificació desada",
            description: "La verificació de la implantació s'ha desat correctament.",
          });
    
          await handleActionUpdate();
    
        } catch (error) {
          console.error("Error saving verification:", error);
          toast({
              variant: "destructive",
              title: "Error en desar",
              description: "No s'ha pogut desar la verificació.",
          });
        } finally {
          setIsSubmitting(false);
        }
    };

    const handleClosureSave = async (closureData: any) => {
        if (!action || !user) return;
        setIsSubmitting(true);
        try {
            await updateAction(action.id, {
                closure: {
                    ...closureData,
                    closureResponsible: {
                        id: user.id,
                        name: user.name || 'Unknown User',
                        avatar: user.avatar || undefined,
                    },
                    date: new Date().toISOString(),
                },
                status: 'Finalizada',
            });
            
            toast({
                title: 'Acció Tancada',
                description: closureData.isCompliant 
                    ? "L'acció s'ha tancat correctament." 
                    : "S'ha tancat l'acció i s'ha generat una nova acció BIS.",
            });
    
            // Redirect or refresh
            router.push('/actions');
            router.refresh();
    
        } catch (error) {
            console.error("Error saving closure:", error);
            toast({
                variant: "destructive",
                title: "Error en tancar",
                description: "No s'ha pogut tancar l'acció.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUpdateProposedActionStatus = async (proposedActionId: string, newStatus: ProposedActionStatus) => {
        setIsSubmitting(true);
        try {
            await updateAction(action.id, {
                updateProposedActionStatus: {
                    proposedActionId,
                    status: newStatus,
                }
            });
            toast({
                title: "Estat actualitzat",
                description: "L'estat de l'acció proposada s'ha actualitzat.",
            });
            await handleActionUpdate();
        } catch (error) {
            console.error("Error updating proposed action status:", error);
            toast({ variant: "destructive", title: "Error en actualitzar l'estat." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAnalysisTabDisabled = action?.status === 'Borrador';
    const isVerificationTabDisabled = action?.status === 'Borrador' || action?.status === 'Pendiente Análisis';
    const isClosureTabDisabled = action?.status === 'Borrador' || action?.status === 'Pendiente Análisis' || action?.status === 'Pendiente Comprobación';
  
    const isUserAuthorizedForCurrentStep = (() => {
        if (!user || !action) return false;
        
        switch (action.status) {
            case 'Pendiente Análisis':
                return user.email === action.responsibleGroupId;
            case 'Pendiente Comprobación':
                return user.id === action.analysis?.verificationResponsibleUserId;
            case 'Pendiente de Cierre':
                return user.id === action.creator.id;
            default:
                return false;
        }
    })();

    const getStatusColorClass = (status?: ProposedActionStatus) => {
      if (!status) return "border-gray-300";
      switch (status) {
        case "Pendent":
          return "border-gray-400";
        case "Implementada":
          return "border-green-500";
        case "Implementada Parcialment":
          return "border-yellow-500";
        case "No Implementada":
          return "border-red-500";
        default:
          return "border-gray-300";
      }
    };

    const renderReadOnlyContent = (titleKey: string, descriptionKey: string, content: React.ReactNode) => (
        <Card>
            <CardHeader>
                <CardTitle>{titleKey}</CardTitle>
                <CardDescription>{descriptionKey}</CardDescription>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
            {/* Main Content */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight">{action.actionId}: {action.title}</h1>
                </header>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList>
                        <TabsTrigger value="details">{t('tabs.details')}</TabsTrigger>
                        <TabsTrigger value="analysis" disabled={isAnalysisTabDisabled}>{t('tabs.causesAndProposedAction')}</TabsTrigger>
                        <TabsTrigger value="verification" disabled={isVerificationTabDisabled}>{t('tabs.implementationVerification')}</TabsTrigger>
                        <TabsTrigger value="closure" disabled={isClosureTabDisabled}>{t('tabs.actionClosure')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="mt-4">
                       <div className="space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">{isEditing ? t("editingTitle") : action.title}</h2>
                                    <p className="text-muted-foreground mt-1">{isEditing ? t("editingDescription") : t("viewingDescription")}</p>
                                </div>
                                {!isEditing && action.status === "Borrador" && (
                                    <Button onClick={() => setIsEditing(true)}>
                                        <FileEdit className="mr-2 h-4 w-4" /> {t("editDraft")}
                                    </Button>
                                )}
                            </div>

                            <ActionForm 
                                mode={isEditing ? 'edit' : 'view'}
                                initialData={action}
                                masterData={masterData}
                                isSubmitting={isSubmitting}
                                onSubmit={handleEditSubmit}
                                onCancel={() => setIsEditing(false)}
                                t={tForm}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-4">
                        {action.status === 'Pendiente Análisis' && isUserAuthorizedForCurrentStep && user ? (
                            <AnalysisSection
                                action={action}
                                user={user}
                                isSubmitting={isSubmitting}
                                onSave={handleAnalysisSave}
                            />
                        ) : action.analysis ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('causesAndProposedAction')}</CardTitle>
                                    <CardDescription>
                                        {t('analysisPerformedBy', { 
                                            name: action.analysis.analysisResponsible?.name, 
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
                                            {action.analysis.proposedActions.map((pa) => (
                                                <div key={pa.id} className={cn("p-4 border-l-4 rounded-lg bg-muted/30", getStatusColorClass(pa.status))}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{pa.description}</p>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Responsable: {users.find(u => u.id === pa.responsibleUserId)?.name || pa.responsibleUserId} | Data Venciment: {format(new Date(pa.dueDate), "dd/MM/yyyy")}
                                                            </p>
                                                             <p className="text-sm text-muted-foreground mt-1">
                                                                Estat: <span className="font-semibold">{pa.status || 'Pendent'}</span>
                                                            </p>
                                                        </div>
                                                        {user?.id === pa.responsibleUserId && action.status !== 'Finalizada' && (
                                                          <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                              setSelectedProposedAction(pa);
                                                              setIsStatusDialogOpen(true);
                                                            }}
                                                          >
                                                            <Edit className="mr-2 h-3 w-3" />
                                                            Actualitzar Estat
                                                          </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                     <Separator />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">{t('analysis.verificationResponsible.label')}</h3>
                                        <p className="text-muted-foreground">
                                            {users.find(u => u.id === action.analysis?.verificationResponsibleUserId)?.name || action.analysis?.verificationResponsibleUserId || 'No assignat'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                            <p>L'anàlisi es podrà realitzar un cop l'acció estigui en estat 'Pendent d'Anàlisi' i siguis el responsable assignat.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="verification" className="mt-4">
                        {action.status === 'Pendiente Comprobación' && isUserAuthorizedForCurrentStep && user && action.analysis ? (
                            <VerificationSection
                                action={action}
                                user={user}
                                isSubmitting={isSubmitting}
                                onSave={handleVerificationSave}
                            />
                        ) : action.verification ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('implementationVerification')}</CardTitle>
                                    <CardDescription>
                                        {t('verificationPerformedBy', { 
                                            name: action.verification.verificationResponsible?.name, 
                                            date: format(new Date(action.verification.verificationDate), "PPP", { locale: es }) 
                                        })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">{t('verification.notesLabel')}</h3>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{action.verification.notes}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">{t('verification.statusOfActions')}</h3>
                                        <div className="space-y-4">
                                            {action.analysis?.proposedActions.map((pa, index) => (
                                                <div key={`${pa.id}-${index}`} className={cn("p-4 border rounded-lg", getStatusColorClass(action.verification?.proposedActionsStatus[pa.id]))}>
                                                    <p className="font-medium">{pa.description}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Estat: <span className="font-semibold">{action.verification?.proposedActionsStatus[pa.id]}</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>La verificació es podrà realitzar un cop s'hagi completat l'anàlisi de causes i siguis el responsable assignat.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="closure" className="mt-4">
                        {action.status === 'Pendiente de Cierre' && isUserAuthorizedForCurrentStep && user ? (
                            <ClosureSection
                            isSubmitting={isSubmitting}
                            onSave={handleClosureSave}
                            />
                        ) : action.closure ? (
                            <Card>
                            <CardHeader>
                                <CardTitle>{t('actionClosure')}</CardTitle>
                                <CardDescription>
                                    Tancada per {action.closure.closureResponsible.name} el {format(new Date(action.closure.date), "PPP", { locale: es })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Resultat del Tancament</h3>
                                    <p className={cn("font-medium", action.closure.isCompliant ? "text-green-600" : "text-red-600")}>
                                        {action.closure.isCompliant ? "Conforme" : "No Conforme"}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Observacions Finals</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{action.closure.notes}</p>
                                </div>
                            </CardContent>
                            </Card>
                        ) : (
                             <div className="text-center text-muted-foreground py-10">
                                <p>El tancament es podrà realitzar un cop s'hagi completat la verificació i siguis el responsable assignat.</p>
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>

            {/* Right Sidebar */}
            <aside className="lg:col-span-1">
                <ActionDetailsPanel action={action} onActionUpdate={handleActionUpdate} />
            </aside>

            {isStatusDialogOpen && selectedProposedAction && (
                <UpdateActionStatusDialog
                    isOpen={isStatusDialogOpen}
                    setIsOpen={setIsStatusDialogOpen}
                    proposedAction={selectedProposedAction}
                    onSave={handleUpdateProposedActionStatus}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
