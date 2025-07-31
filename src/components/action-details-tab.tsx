
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useToast } from "@/hooks/use-toast"
import { getActionById, updateAction } from "@/lib/data"
import type { ImprovementAction } from "@/lib/types"
import { ActionForm } from "@/components/action-form"
import { Button } from "@/components/ui/button"
import { FileEdit } from "lucide-react"

interface ActionDetailsTabProps {
    action: ImprovementAction;
    masterData: any;
    onActionUpdate: (updatedAction: ImprovementAction) => void;
}

export function ActionDetailsTab({ action, masterData, onActionUpdate }: ActionDetailsTabProps) {
    const t = useTranslations("ActionDetailPage")
    const tForm = useTranslations("NewActionPage")
    const { toast } = useToast()

    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
            // Refresh data after update
            const updatedAction = await getActionById(action.id);
            if(updatedAction) onActionUpdate(updatedAction);
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

    return (
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
                isLoadingMasterData={!masterData}
                isSubmitting={isSubmitting}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditing(false)}
                t={tForm}
            />
        </div>
    )
}

    