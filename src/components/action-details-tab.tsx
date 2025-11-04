

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getActionById, updateAction, getUsers, getActionTypes, getCategories, getSubcategories, getAffectedAreas, getCenters, getResponsibilityRoles } from "@/lib/data"
import type { ImprovementAction, ProposedActionVerificationStatus, User, ProposedAction } from "@/lib/types"
import { ActionForm } from "@/components/action-form"
import { Button } from "@/components/ui/button"
import { AnalysisSection } from "@/components/analysis-section"
import { VerificationSection } from "@/components/verification-section"
import { ClosureSection } from "@/components/closure-section"
import { ActionDetailsPanel } from "@/components/action-details-panel"
import { Loader2, FileEdit, Edit, Star, Printer, FileSpreadsheet, ChevronDown, CheckCircle2, Ban, MoreVertical, Pencil } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { cn, safeParseDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import type { ProposedActionStatus } from "@/lib/types"
import { useRouter } from "next/navigation"
import { UpdateActionStatusDialog } from "./update-action-status-dialog"
import { useFollowAction } from "@/hooks/use-follow-action"
import { useActionState } from "@/hooks/use-action-state"
import { useTabs } from "@/hooks/use-tabs"
import { ActionStatusBadge } from "./action-status-badge"
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminEditDialog } from "./admin-edit-dialog"
import { ProposedActionEditDialog } from "./proposed-action-edit-dialog"


interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}


interface ActionDetailsTabProps {
    initialAction: ImprovementAction;
    masterData: any;
}


export function ActionDetailsTab({ initialAction, masterData: initialMasterData }: ActionDetailsTabProps) {
    const { toast } = useToast()
    const router = useRouter();
    const { closeCurrentTab } = useTabs();
    const { user, isAdmin } = useAuth()
    const { actions, setActions } = useActionState();

    const [action, setAction] = useState<ImprovementAction | null>(initialAction);
    const [isEditing, setIsEditing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [users, setUsers] = useState<User[]>([]);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedProposedAction, setSelectedProposedAction] = useState<any>(null);
    const [editingProposedAction, setEditingProposedAction] = useState<ProposedAction | null>(null);
    const [masterData, setMasterData] = useState<any>(null);
    const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);
    const [cancellationReason, setCancellationReason] = useState("");
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingField, setEditingField] = useState<{ field: string; label: string; value: any; options?: any, fieldType?: string } | null>(null);

    
    const { handleToggleFollow, isFollowing } = useFollowAction();

     useEffect(() => {
        const loadAllMasterData = async () => {
            setIsLoadingMasterData(true);
            try {
                const [types, cats, subcats, areas, centers, roles] = await Promise.all([
                    getActionTypes(),
                    getCategories(),
                    getSubcategories(),
                    getAffectedAreas(),
                    getCenters(),
                    getResponsibilityRoles(),
                ]);
                setMasterData({
                    ambits: { data: types },
                    origins: { data: cats },
                    classifications: { data: subcats },
                    affectedAreas: areas,
                    centers: { data: centers },
                    responsibilityRoles: { data: roles },
                });
            } catch (error) {
                console.error("Failed to load master data in ActionDetailsTab:", error);
                toast({
                    variant: "destructive",
                    title: "Error de carga",
                    description: "No se pudieron cargar los datos maestros necesarios para esta acción.",
                });
            } finally {
                setIsLoadingMasterData(false);
            }
        };
        loadAllMasterData();
    }, [toast]);


    useEffect(() => {
      async function loadUsers() {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      }
      loadUsers();
    }, []);

    useEffect(() => {
        const updatedAction = actions.find(a => a.id === initialAction.id);
        setAction(updatedAction || initialAction);
    }, [actions, initialAction]);
    
    const handleActionUpdate = async () => {
        if (!action) return;
        const updatedActionData = await getActionById(action.id);
        if (updatedActionData) {
            setActions(prev => prev.map(a => a.id === updatedActionData.id ? updatedActionData : a));
        }
    }

    const handleEditSubmit = async (formData: any, status?: 'Borrador' | 'Pendiente Análisis') => {
        if (!action) return;
        setIsSubmitting(true);
        try {
            
            await updateAction(action.id, formData, masterData, status); 
            
            toast({
                title: "Acción guardada",
                description: "Los cambios se han guardado correctamente.",
            });

            if (status === 'Pendiente Análisis') {
                closeCurrentTab();
            } else {
                setIsEditing(false);
                await handleActionUpdate();
            }
        } catch (error) {
            console.error("Error updating action:", error);
            toast({
                variant: "destructive",
                title: "Error al guardar",
                description: "No se ha podido actualizar la acción.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleAdminEditSave = async (field: string, newValue: any) => {
        if (!action || !user || !isAdmin) return;
        
        setIsSubmitting(true);
        try {
            const oldValue = field.split('.').reduce((o, i) => o?.[i], action);

            const { bisActionTitle } = await updateAction(action.id, { [field]: newValue });
            
            toast({
                title: "Campo actualizado",
                description: "El cambio se ha guardado correctamente.",
            });
    
            // DEBUGGING TOAST
            toast({
                title: "Comprobación BIS",
                description: bisActionTitle 
                    ? `Se ha encontrado un BIS: ${bisActionTitle}` 
                    : "No se ha encontrado ningún BIS.",
                duration: 10000,
            });

            if (bisActionTitle) {
                toast({
                    title: "Aviso: Acción BIS existente",
                    description: `El resultado se ha cambiado a 'Conforme'. Por favor, revise la acción BIS que se generó anteriormente (${bisActionTitle}) y anúlela si lo considera necesario.`,
                    duration: 10000,
                });
            }
    
            await handleActionUpdate();
    
        } catch (error) {
            console.error(`Error updating field ${field}:`, error);
            toast({
                variant: "destructive",
                title: "Error al actualizar",
                description: "No se ha podido guardar el cambio.",
            });
        } finally {
            setIsSubmitting(false);
            setIsEditDialogOpen(false);
            setEditingField(null);
        }
    };
    

    const handleAnalysisSave = async (analysisData: any) => {
        if (!action) return;
        setIsSubmitting(true);
        try {
          await updateAction(action.id, {
            analysis: analysisData,
            status: "Pendiente Comprobación",
          });
          
          toast({
            title: "Análisis guardado",
            description: "El análisis de causas se ha guardado y el estado ha avanzado.",
          });
    
          await handleActionUpdate();
    
        } catch (error) {
          console.error("Error saving analysis:", error);
          toast({
              variant: "destructive",
              title: "Error al guardar",
              description: "No se pudo guardar el análisis.",
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
            status: "Pendiente de Cierre",
          });
          
          toast({
            title: "Verificación guardada",
            description: "La verificación se ha guardado y el estado ha avanzado.",
          });
    
          await handleActionUpdate();
    
        } catch (error) {
          console.error("Error saving verification:", error);
          toast({
              variant: "destructive",
              title: "Error al guardar",
              description: "No se pudo guardar la verificación.",
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
                        avatar: user.avatar || "",
                    },
                    date: new Date().toISOString(),
                },
                status: 'Finalizada',
            });
            
            toast({
                title: "Acción cerrada",
                description: "La acción de mejora se ha cerrado correctamente.",
            });
            closeCurrentTab();
            router.push("/actions");
            router.refresh();
    
        } catch (error) {
            console.error("Error saving closure:", error);
            toast({
                variant: "destructive",
                title: "Error al cerrar",
                description: "No se pudo cerrar la acción.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUpdateProposedActionStatus = async (proposedActionId: string, newStatus: ProposedActionStatus) => {
        if (!action) return;
        setIsSubmitting(true);
        try {
            await updateAction(action.id, {
                updateProposedActionStatus: {
                    proposedActionId,
                    status: newStatus,
                }
            });
            toast({
                title: "Estado actualizado",
                description: "El estado de la acción propuesta se ha actualizado.",
            });
            await handleActionUpdate();
        } catch (error) {
            console.error("Error updating proposed action status:", error);
            toast({ variant: "destructive", title: "Error al actualizar el estado." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCancelAction = async () => {
        if (!action || !user || !isAdmin || !cancellationReason.trim()) return;
        
        setIsSubmitting(true);
        try {
            const cancellationComment = `Acción anulada por ${user.name} el ${new Date().toLocaleDateString()}. Motivo: ${cancellationReason}`;
            
            await updateAction(action.id, {
                status: 'Anulada',
                newComment: {
                    id: crypto.randomUUID(),
                    author: { id: 'system', name: 'Sistema' },
                    date: new Date().toISOString(),
                    text: cancellationComment,
                },
            });

            toast({
                title: "Acción Anulada",
                description: "La acción de mejora ha sido marcada como anulada.",
            });
            
            setCancellationReason("");
            setIsCancelDialogOpen(false); // Close dialog on success
            await handleActionUpdate();

        } catch (error) {
            console.error("Error cancelling action:", error);
            toast({
                variant: "destructive",
                title: "Error al anular",
                description: "No se ha podido anular la acción.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProposedActionSave = async (updatedProposedAction: ProposedAction) => {
        if (!action || !user || !isAdmin || !editingProposedAction) return;

        const actionIndex = action.analysis?.proposedActions.findIndex(pa => pa.id === updatedProposedAction.id) ?? -1;
        
        let changes: string[] = [];
        if (editingProposedAction.description !== updatedProposedAction.description) changes.push("la descripción");
        if (editingProposedAction.responsibleUserId !== updatedProposedAction.responsibleUserId) changes.push("el responsable");
        if (safeParseDate(editingProposedAction.dueDate)?.getTime() !== safeParseDate(updatedProposedAction.dueDate)?.getTime()) changes.push("la fecha de vencimiento");
        if (editingProposedAction.status !== updatedProposedAction.status) changes.push("el estado");
        
        if (changes.length === 0) {
            setEditingProposedAction(null);
            return;
        }

        const commentText = `El administrador ${user.name} ha modificado ${changes.join(', ')} de la acción propuesta ${actionIndex + 1}.`;

        setIsSubmitting(true);
        try {
            await updateAction(action.id, {
                updateProposedAction: updatedProposedAction,
                newComment: {
                    id: crypto.randomUUID(),
                    author: { id: 'system', name: 'Sistema' },
                    date: new Date().toISOString(),
                    text: commentText,
                }
            });
            
            toast({
                title: "Acción Propuesta Actualizada",
                description: "Los cambios se han guardado correctamente.",
            });
    
            await handleActionUpdate();
        } catch (error) {
            console.error("Error updating proposed action:", error);
            toast({
                variant: "destructive",
                title: "Error al Guardar",
                description: "No se ha podido actualizar la acción propuesta.",
            });
        } finally {
            setIsSubmitting(false);
            setEditingProposedAction(null);
        }
    };

    const generatePdf = async () => {
        if (!action) return;

        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const margin = 15;
        let y = 20;

        // --- COLORS & STYLES ---
        const primaryColor = '#00529B'; // Dark Blue
        const grayColor = '#555555'; // Medium Gray
        const lightGrayColor = '#888888'; // Lighter Gray
        const blackColor = '#222222'; // Almost Black
        const greenColor = '#28a745'; // Green for status
        
        doc.setFont('helvetica', 'normal');

        // --- HEADER ---
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text(`Acción de Mejora: ${action.actionId}`, margin, y);
        
        const statusText = action.status === 'Finalizada' && action.closure?.isCompliant === false ? 'Finalizada (No Conforme)' : action.status;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(action.status === 'Finalizada' ? (action.closure?.isCompliant === false ? '#DC2626' : greenColor) : grayColor);
        const statusWidth = doc.getStringUnitWidth(statusText) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.text(statusText, pageWidth - margin - statusWidth, y);


        y += 5;
        doc.setDrawColor(lightGrayColor);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;

        // --- HELPER FUNCTIONS ---
        const addSectionTitle = (title: string, number: number) => {
            if (y > pageHeight - 30) { doc.addPage(); y = 20; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor);
            doc.text(`${number}. ${title}`, margin, y);
            y += 5;
            doc.setDrawColor(primaryColor);
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;
        };
        
        const addAuditInfo = (text: string | undefined) => {
            if (!text || text.includes('N/D')) return;
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(lightGrayColor);
            doc.text(text, margin, y);
            y += 8;
        };
        
        const addTextBlock = (title: string, text: string | undefined) => {
            if (!text) return;
            if (y > pageHeight - 30) { doc.addPage(); y = 20; }
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(blackColor);
            doc.text(title, margin, y);
            y += 6;
        
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(grayColor);
            const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2));
            doc.text(splitText, margin, y);
            y += doc.getTextDimensions(splitText, { maxWidth: pageWidth - (margin * 2) }).h + 8;
        };

        const addTwoColumnRow = (label1: string, value1: string | undefined, label2: string | undefined, value2: string | undefined) => {
            if (!value1 && !value2) return;
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            
            const col1X = margin;
            const col2X = margin + (pageWidth / 2.5);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(blackColor);
            doc.text(label1, col1X, y);
            if (label2) doc.text(label2, col2X, y);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(grayColor);
            
            const value1Height = value1 ? doc.getTextDimensions(value1, { maxWidth: (pageWidth / 2.5) - 30 }).h : 0;
            if(value1) doc.text(value1, col1X + 30, y, { maxWidth: (pageWidth / 2.5) - 30 });
            
            const value2Height = value2 ? doc.getTextDimensions(value2, { maxWidth: (pageWidth - col2X - margin) }).h : 0;
            if(value2) doc.text(value2, col2X + 40, y, { maxWidth: (pageWidth - col2X - margin - 40) });

            y += Math.max(value1Height, value2Height) + 6;
        };

        const addProposedActionBlock = (pa: any, index: number) => {
            const paTitle = `Acción Propuesta ${index + 1}`;
            const paDescription = pa.description;
            const responsibleName = users.find(u => u.id === pa.responsibleUserId)?.name || 'N/D';
            const dueDate = safeParseDate(pa.dueDate) ? format(safeParseDate(pa.dueDate)!, 'dd/MM/yyyy') : 'N/D';
            const statusText = pa.status ? `${pa.status}${pa.statusUpdateDate ? ' (el ' + format(safeParseDate(pa.statusUpdateDate)!, "dd/MM/yyyy") + ')' : ''}` : 'Pendiente';

            if (y > pageHeight - 60) { doc.addPage(); y = 20; }
            
            const blockStartY = y;

            // Title
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(blackColor);
            doc.text(paTitle, margin + 5, y);
            y += 8;
            
            const descLines = doc.splitTextToSize(paDescription, pageWidth - (margin * 2) - 10);
            const descHeight = doc.getTextDimensions(descLines).h;
            
            y += 4;
            
            // Dotted separator line
            doc.setLineDashPattern([1, 1], 0);
            doc.setDrawColor(lightGrayColor);
            doc.line(margin + 5, y + descHeight, pageWidth - margin - 5, y + descHeight);
            doc.setLineDashPattern([], 0); // Reset dash pattern
            
            // Metadata Footer
            doc.setFontSize(8);
            doc.setTextColor(lightGrayColor);
            
            const metadataLine = `Responsable: ${responsibleName} | Fecha Vencimiento: ${dueDate} | `;
            doc.text(metadataLine, margin + 5, y + descHeight + 4);
            
            const metadataPrefixWidth = doc.getStringUnitWidth(metadataLine) * doc.getFontSize() / doc.internal.scaleFactor;
            doc.setFont('helvetica', 'bold');
            doc.text('Estado:', margin + 5 + metadataPrefixWidth, y + descHeight + 4);
            const estatLabelWidth = doc.getStringUnitWidth('Estado:') * doc.getFontSize() / doc.internal.scaleFactor;
            doc.setFont('helvetica', 'normal');
            doc.text(` ${statusText}`, margin + 5 + metadataPrefixWidth + estatLabelWidth, y + descHeight + 4);

            const blockHeight = (y + descHeight + 12) - blockStartY;

            // Background and side bar
            doc.setFillColor(243, 244, 246); // light gray background
            doc.rect(margin, blockStartY - 4, pageWidth - (margin * 2), blockHeight, 'F');
            doc.setFillColor(primaryColor);
            doc.rect(margin, blockStartY - 4, 2.5, blockHeight, 'F');

            // Re-draw text on top of background
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(blackColor);
            doc.text(paTitle, margin + 5, blockStartY);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(grayColor);
            doc.text(descLines, margin + 5, blockStartY + 8);
            
            doc.setFontSize(8);
            doc.setTextColor(lightGrayColor);
            doc.text(metadataLine, margin + 5, blockStartY + 8 + descHeight + 8);
            doc.setFont('helvetica', 'bold');
            doc.text('Estado:', margin + 5 + metadataPrefixWidth, blockStartY + 8 + descHeight + 8);
            doc.setFont('helvetica', 'normal');
            doc.text(` ${statusText}`, margin + 5 + metadataPrefixWidth + estatLabelWidth, blockStartY + 8 + descHeight + 8);

            y = blockStartY + blockHeight + 6;
        };
        
        // --- SECTION 1: DETALLES DE LA ACCIÓN ---
        addSectionTitle('Detalles de la Acción', 1);
        addAuditInfo(`Creado por ${action.creator.name} el ${safeParseDate(action.creationDate) ? format(safeParseDate(action.creationDate)!, 'dd/MM/yyyy HH:mm') : 'N/D'}`);
        addTwoColumnRow('Título:', action.title, 'Centro:', action.center);
        addTwoColumnRow('Ámbito:', action.type, 'Áreas Implicadas:', action.affectedAreas.join(', '));
        addTwoColumnRow('Origen:', action.category, undefined, undefined);
        addTwoColumnRow('Clasificación:', action.subcategory, undefined, undefined);

        y += 2;
        addTextBlock('Observaciones:', action.description);
        y += 5;
        
        // --- SECTION 2: CAUSAS Y ACCIÓN PROPOSTA ---
        if (action.analysis) {
            addSectionTitle('Causas y Acción Propuesta', 2);
            addAuditInfo(`Análisis realizado por ${action.analysis.analysisResponsible.name} el ${safeParseDate(action.analysis.analysisDate) ? format(safeParseDate(action.analysis.analysisDate)!, 'dd/MM/yyyy') : 'N/D'}`);
            addTextBlock('Análisis de Causa Raíz:', action.analysis.causes);

            if(action.analysis.proposedActions && action.analysis.proposedActions.length > 0) {
                action.analysis.proposedActions.forEach((pa, index) => {
                    addProposedActionBlock(pa, index);
                });
            }
            y += 2;
            doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(blackColor);
            doc.text('Responsable Verificación:', margin, y);
            doc.setFont('helvetica', 'normal').setTextColor(grayColor);
            doc.text(users.find(u => u.id === action.analysis?.verificationResponsibleUserId)?.name || 'N/A', margin + 50, y);
            y += 10;
        }
        
        // --- SECTION 3: VERIFICACIÓN DE IMPLANTACIÓN ---
        if (action.verification) {
            addSectionTitle('Verificación de Implantación', 3);
            addAuditInfo(`Verificación realizada por ${action.verification.verificationResponsible.name} el ${safeParseDate(action.verification.verificationDate) ? format(safeParseDate(action.verification.verificationDate)!, 'dd/MM/yyyy') : 'N/D'}`);
            addTextBlock('Comentarios Generales de Verificación:', action.verification.notes);

            if (action.analysis?.proposedActions?.length) {
                doc.autoTable({
                    startY: y + 5,
                    head: [['Acción Propuesta', 'Estado Verificación']],
                    body: action.analysis.proposedActions.map(pa => [
                        pa.description,
                        action.verification!.proposedActionsVerificationStatus[pa.id] || 'Pendiente'
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                    styles: { fontSize: 9 },
                    margin: { left: margin, right: margin }
                });
                y = (doc as any).lastAutoTable.finalY + 10;
            }

            y += 5;
        }

        // --- SECTION 4: CIERRE DE LA ACCIÓN ---
        if (action.closure) {
            addSectionTitle('Cierre de la Acción', 4);
            addAuditInfo(`Cerrado por ${action.closure.closureResponsible.name} el ${safeParseDate(action.closure.date) ? format(safeParseDate(action.closure.date)!, 'dd/MM/yyyy') : 'N/D'}`);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(blackColor);
            doc.text("Resultado Final:", margin, y);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(action.closure.isCompliant ? greenColor : '#DC2626');
            doc.text(action.closure.isCompliant ? 'Conforme' : 'No Conforme', margin + 35, y);
            y += 10;

            addTextBlock('Observaciones de Cierre:', action.closure.notes);
        }

        // --- SECTION 5: ADJUNTOS ---
        if (action.attachments && action.attachments.length > 0) {
            addSectionTitle('Adjuntos', 5);
            doc.autoTable({
                startY: y,
                head: [['Nombre Archivo', 'Descripción', 'Subido Por', 'Fecha Subida']],
                body: action.attachments.map(file => [
                    file.fileName,
                    file.description || '',
                    file.uploadedBy.name,
                    safeParseDate(file.uploadedAt) ? format(safeParseDate(file.uploadedAt)!, 'dd/MM/yyyy HH:mm') : 'N/D'
                ]),
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 9 },
                margin: { left: margin, right: margin }
            });
            y = (doc as any).lastAutoTable.finalY + 10;
        }

        // --- FOOTER ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(lightGrayColor);
            const dateStr = `Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
            const actionIdStr = `Acción: ${action.actionId}`;
            const pageStr = `Página ${i} de ${pageCount}`;
            doc.text(dateStr, margin, pageHeight - 10);
            doc.text(actionIdStr, (pageWidth / 2), pageHeight - 10, { align: 'center' });
            doc.text(pageStr, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }
        
        doc.save(`Accion_Mejora_${action.actionId}.pdf`);
    };

    const generateExcel = () => {
        if (!action) return;
    
        const wb = XLSX.utils.book_new();
    
        // --- DETAILS WORKSHEET ---
        const detailsData = [
            ["ID Acción", action.actionId],
            ["Título", action.title],
            ["Estado", action.status === 'Finalizada' && action.closure?.isCompliant === false ? 'Finalizada (No Conforme)' : action.status],
            ["Creador", action.creator.name],
            ["Fecha Creación", safeParseDate(action.creationDate) ? format(safeParseDate(action.creationDate)!, 'dd/MM/yyyy HH:mm') : 'N/D'],
            ["Ámbito", action.type],
            ["Origen", action.category],
            ["Clasificación", action.subcategory],
            ["Centro", action.center],
            ["Áreas Afectadas", action.affectedAreas.join(', ')],
            ["Responsable Análisis", action.assignedTo],
            ["Fecha Vto. Análisis", safeParseDate(action.analysisDueDate) ? format(safeParseDate(action.analysisDueDate)!, 'dd/MM/yyyy') : 'N/D'],
            ["Fecha Vto. Implantación", safeParseDate(action.implementationDueDate) ? format(safeParseDate(action.implementationDueDate)!, 'dd/MM/yyyy') : 'N/D'],
            ["Fecha Vto. Cierre", safeParseDate(action.closureDueDate) ? format(safeParseDate(action.closureDueDate)!, 'dd/MM/yyyy') : 'N/D'],
            [], // Spacer
            ["Observaciones"],
            [action.description],
            [],
        ];
    
        if (action.analysis) {
            detailsData.push(["ANÁLISIS DE CAUSAS Y PLAN DE ACCIÓN"]);
            detailsData.push(["Análisis realizado por", action.analysis.analysisResponsible.name]);
            detailsData.push(["Fecha de Análisis", safeParseDate(action.analysis.analysisDate) ? format(safeParseDate(action.analysis.analysisDate)!, 'dd/MM/yyyy') : 'N/D']);
            detailsData.push(["Análisis de Causa Raíz"]);
            detailsData.push([action.analysis.causes]);
            detailsData.push(["Responsable Verificación", users.find(u => u.id === action.analysis?.verificationResponsibleUserId)?.name || 'N/D']);
            detailsData.push([]);
        }
    
        if (action.verification) {
            detailsData.push(["VERIFICACIÓN DE IMPLANTACIÓN"]);
            detailsData.push(["Verificado por", action.verification.verificationResponsible.name]);
            detailsData.push(["Fecha de Verificación", safeParseDate(action.verification.verificationDate) ? format(safeParseDate(action.verification.verificationDate)!, 'dd/MM/yyyy') : 'N/D']);
            detailsData.push(["Comentarios Generales"]);
            detailsData.push([action.verification.notes]);
            detailsData.push([]);
        }
    
        if (action.closure) {
            detailsData.push(["CIERRE DE LA ACCIÓN"]);
            detailsData.push(["Cerrado por", action.closure.closureResponsible.name]);
            detailsData.push(["Fecha de Cierre", safeParseDate(action.closure.date) ? format(safeParseDate(action.closure.date)!, 'dd/MM/yyyy') : 'N/D']);
            detailsData.push(["Resultado Final", action.closure.isCompliant ? 'Conforme' : 'No Conforme']);
            detailsData.push(["Observaciones de Cierre"]);
            detailsData.push([action.closure.notes]);
        }
    
        const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);
        wsDetails['!cols'] = [{ wch: 30 }, { wch: 80 }];
        XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalles');
    
        // --- PROPOSED ACTIONS WORKSHEET ---
        if (action.analysis?.proposedActions?.length) {
            const proposedActionsData = action.analysis.proposedActions.map(pa => ({
                'Descripción': pa.description,
                'Responsable': users.find(u => u.id === pa.responsibleUserId)?.name || 'N/D',
                'Fecha Límite': safeParseDate(pa.dueDate as string) ? format(safeParseDate(pa.dueDate as string)!, 'dd/MM/yyyy') : 'N/D',
                'Estado': pa.status || 'Pendiente',
                'Fecha Estado': pa.statusUpdateDate ? format(safeParseDate(pa.statusUpdateDate)!, 'dd/MM/yyyy HH:mm') : 'N/D',
                'Verificación': action.verification?.proposedActionsVerificationStatus?.[pa.id] || 'Pendiente',
            }));
            const wsProposedActions = XLSX.utils.json_to_sheet(proposedActionsData);
            wsProposedActions['!cols'] = [{ wch: 60 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, wsProposedActions, 'Acciones Propuestas');
        }
    
        // --- COMMENTS WORKSHEET ---
        if (action.comments?.length) {
            const commentsData = action.comments.map(c => ({
                'Autor': c.author.name,
                'Fecha': safeParseDate(c.date) ? format(safeParseDate(c.date)!, 'dd/MM/yyyy HH:mm') : 'N/D',
                'Comentario': c.text,
            }));
            const wsComments = XLSX.utils.json_to_sheet(commentsData);
            wsComments['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 80 }];
            XLSX.utils.book_append_sheet(wb, wsComments, 'Comentarios');
        }
    
        // --- ATTACHMENTS WORKSHEET ---
        if (action.attachments?.length) {
            const attachmentsData = action.attachments.map(a => ({
                'Nombre Archivo': a.fileName,
                'Descripción': a.description || '',
                'Subido Por': a.uploadedBy.name,
                'Fecha Subida': safeParseDate(a.uploadedAt) ? format(safeParseDate(a.uploadedAt)!, 'dd/MM/yyyy HH:mm') : 'N/D',
                'URL': a.fileUrl,
            }));
            const wsAttachments = XLSX.utils.json_to_sheet(attachmentsData);
            wsAttachments['!cols'] = [{ wch: 40 }, { wch: 50 }, { wch: 25 }, { wch: 20 }, { wch: 100 }];
            XLSX.utils.book_append_sheet(wb, wsAttachments, 'Adjuntos');
        }
    
        XLSX.writeFile(wb, `Accion_Mejora_${action.actionId}.xlsx`);
    };

    if (isLoadingMasterData || !action || !masterData) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }
    
    const showCancelButton = isAdmin && action.status !== 'Finalizada' && action.status !== 'Anulada';

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
        case "Pendiente":
          return "border-gray-400";
        case "Implementada":
          return "border-green-500";
        case "Implementada Parcialmente":
          return "border-yellow-500";
        case "No Implementada":
          return "border-red-500";
        default:
          return "border-gray-300";
      }
    };

    const handleEditClick = (field: string, label: string, value: any, options?: any, fieldType?: string) => {
        setEditingField({ field, label, value, options, fieldType });
        setIsEditDialogOpen(true);
    };

    const ALL_STATUSES: ImprovementAction['status'][] = ['Borrador', 'Pendiente Análisis', 'Pendiente Comprobación', 'Pendiente de Cierre', 'Finalizada', 'Anulada'];


    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
            <div className="lg:col-span-3 flex flex-col gap-6">
                <header className="flex items-start gap-4">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleToggleFollow(action.id, e)}
                        title={isFollowing(action.id) ? "Dejar de seguir" : "Seguir acción"}
                        className="h-8 w-8 mt-1"
                      >
                        <Star className={cn("h-5 w-5", isFollowing(action.id) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                      </Button>
                    <div className="flex-1">
                        <div className="group relative">
                            <h1 className="text-3xl font-bold tracking-tight pr-8">{action.actionId}: {action.title}</h1>
                            {isAdmin && (
                                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick('title', 'Título', action.title)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 group relative">
                        <ActionStatusBadge status={action.status} isCompliant={action.closure?.isCompliant} />
                         {isAdmin && (
                             <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick('status', 'Estado', action.status, { statuses: ALL_STATUSES })}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {showCancelButton ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Más opciones</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={generatePdf}>
                                        <Printer className="mr-2 h-4 w-4" />
                                        <span>Exportar a PDF</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem 
                                                onSelect={(e) => e.preventDefault()}
                                                className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                            >
                                                <Ban className="mr-2 h-4 w-4" />
                                                Anular Acción
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro de que quieres anular esta acción?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. La acción quedará marcada como "Anulada" y no se podrá editar.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <div className="grid gap-2 py-4">
                                                <Label htmlFor="cancellation-reason">Motivo de la anulación</Label>
                                                <Textarea
                                                    id="cancellation-reason"
                                                    placeholder="Introduce aquí el motivo de la anulación..."
                                                    value={cancellationReason}
                                                    onChange={(e) => setCancellationReason(e.target.value)}
                                                />
                                            </div>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setCancellationReason("")}>Cancelar</AlertDialogCancel>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleCancelAction}
                                                    disabled={!cancellationReason.trim() || isSubmitting}
                                                >
                                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Sí, anular acción
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                             <Button variant="outline" onClick={generatePdf}>
                                <Printer className="mr-2 h-4 w-4" />
                                <span>Exportar a PDF</span>
                            </Button>
                        )}
                    </div>
                </header>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList>
                        <TabsTrigger value="details">Detalles</TabsTrigger>
                        <TabsTrigger value="analysis" disabled={isAnalysisTabDisabled}>Causas y Acción Propuesta</TabsTrigger>
                        <TabsTrigger value="verification" disabled={isVerificationTabDisabled}>Verificación de Implantación</TabsTrigger>
                        <TabsTrigger value="closure" disabled={isClosureTabDisabled}>Cierre de la Acción</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="mt-4">
                       <div className="space-y-6">
                            <ActionForm
                                key={isEditing ? 'edit' : 'view'}
                                mode={isEditing ? 'edit' : 'view'}
                                initialData={action}
                                masterData={masterData}
                                isSubmitting={isSubmitting}
                                onSubmit={handleEditSubmit}
                                onCancel={() => setIsEditing(false)}
                                editButton={
                                     action.status === 'Borrador' && !isEditing && (
                                        <Button onClick={() => setIsEditing(true)} disabled={isLoadingMasterData}>
                                            <FileEdit className="mr-2 h-4 w-4" /> Editar Borrador
                                        </Button>
                                    )
                                }
                                isAdmin={isAdmin}
                                onEditField={handleEditClick}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-4">
                        {action.status === 'Pendiente Análisis' && isUserAuthorizedForCurrentStep && user ? (
                            <AnalysisSection
                                action={action}
                                user={user}
                                isAdmin={isAdmin}
                                isSubmitting={isSubmitting}
                                onSave={handleAnalysisSave}
                                onEditField={handleEditClick}
                            />
                        ) : action.analysis ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Causas y Acción Propuesta</CardTitle>
                                    <CardDescription>
                                        Análisis realizado por {action.analysis.analysisResponsible?.name} el {safeParseDate(action.analysis.analysisDate) ? format(safeParseDate(action.analysis.analysisDate)!, "PPP", { locale: es }) : ''}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="group relative">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">Análisis de las Causas</h3>
                                            {isAdmin && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick('analysis.causes', 'Análisis de Causas', action.analysis?.causes, {}, 'textarea')}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{action.analysis.causes}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Acción Propuesta</h3>
                                        <div className="space-y-4">
                                            {action.analysis.proposedActions.map((pa) => (
                                                <div key={pa.id} className={cn("p-4 border-l-4 rounded-lg bg-muted/30", getStatusColorClass(pa.status))}>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1 space-y-3">
                                                            <p className="font-medium whitespace-pre-wrap">{pa.description}</p>
                                                            <Separator />
                                                            <div className="text-sm text-muted-foreground">
                                                              <p>Responsable: {users.find(u => u.id === pa.responsibleUserId)?.name || pa.responsibleUserId}</p>
                                                              <p>Fecha Vencimiento: {safeParseDate(pa.dueDate) ? format(safeParseDate(pa.dueDate)!, "dd/MM/yyyy") : ''}</p>
                                                              <p>Estado: <span className="font-semibold">{pa.status || 'Pendiente'}</span> 
                                                                {pa.statusUpdateDate && ` (el ${format(safeParseDate(pa.statusUpdateDate)!, "dd/MM/yyyy HH:mm")})`}
                                                              </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
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
                                                                Actualizar Estado
                                                            </Button>
                                                            )}
                                                            {isAdmin && (
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() => setEditingProposedAction(pa)}
                                                                >
                                                                    <Pencil className="mr-2 h-3 w-3" />
                                                                    Editar Acción
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                     <Separator />
                                     <div className="group relative">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">Responsable de la Verificación</h3>
                                            {isAdmin && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick('analysis.verificationResponsibleUserId', 'Responsable de Verificación', action.analysis?.verificationResponsibleUserId, { users: users })}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground">
                                            {users.find(u => u.id === action.analysis?.verificationResponsibleUserId)?.name || action.analysis?.verificationResponsibleUserId || 'No asignado'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                            <p>El análisis se podrá realizar una vez la acción esté en estado 'Pendiente de Análisis' y seas el responsable asignado.</p>
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
                                isAdmin={isAdmin}
                                onEditField={handleEditClick}
                            />
                        ) : action.verification ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Comprobación de la Implantación</CardTitle>
                                    <CardDescription>
                                        Verificación realizada por {action.verification.verificationResponsible?.name} el {safeParseDate(action.verification.verificationDate) ? format(safeParseDate(action.verification.verificationDate)!, "PPP", { locale: es }) : ''}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="group relative">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">Observaciones Generales</h3>
                                             {isAdmin && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick('verification.notes', 'Observaciones de Verificación', action.verification?.notes, {}, 'textarea')}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{action.verification.notes}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-4">Estado de las Acciones Propuestas</h3>
                                        <div className="space-y-4">
                                            {action.analysis?.proposedActions.map((pa, index) => {
                                                const verificationStatus = action.verification?.proposedActionsVerificationStatus?.[pa.id] || 'Pendiente de Verificación';
                                                const statusUpdateDate = pa.statusUpdateDate ? format(safeParseDate(pa.statusUpdateDate)!, "dd/MM/yyyy HH:mm") : 'N/D';
                                                return (
                                                    <div key={`${pa.id}-${index}`} className="p-4 border rounded-lg space-y-4">
                                                        <p className="font-medium whitespace-pre-wrap">{pa.description}</p>
                                                        <Separator />
                                                        <p className="text-sm text-muted-foreground">
                                                            Estado: <span className="font-semibold">{pa.status}</span> (act. el {statusUpdateDate})
                                                        </p>
                                                        <div className="flex items-center gap-2 group relative">
                                                          <p className="text-sm text-muted-foreground">
                                                              Verificación: <span className="font-semibold">{verificationStatus}</span>
                                                          </p>
                                                          {isAdmin && (
                                                            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick(`verification.proposedActionsVerificationStatus.${pa.id}`, `Verificación de acción ${index + 1}`, verificationStatus, {}, 'verificationStatus')}>
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                          )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>La verificación se podrá realizar una vez se haya completado el análisis de causas y seas el responsable asignado.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="closure" className="mt-4">
                        {action.status === 'Pendiente de Cierre' && isUserAuthorizedForCurrentStep && user ? (
                            <ClosureSection
                                isSubmitting={isSubmitting}
                                onSave={handleClosureSave}
                                isAdmin={isAdmin}
                                onEditField={handleEditClick}
                            />
                        ) : action.closure ? (
                            <Card>
                            <CardHeader>
                                <CardTitle>Cierre de la Acción</CardTitle>
                                <CardDescription>
                                    Cerrada por {action.closure.closureResponsible.name} el {safeParseDate(action.closure.date) ? format(safeParseDate(action.closure.date)!, "PPP", { locale: es }) : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="group relative">
                                    <h3 className="font-semibold text-base mb-2">Resultado del Cierre</h3>
                                    <div className="flex items-center gap-2">
                                        <p className={cn("font-medium", action.closure.isCompliant ? "text-green-600" : "text-red-600")}>
                                            {action.closure.isCompliant ? "Conforme" : "No Conforme"}
                                        </p>
                                         {isAdmin && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick('closure.isCompliant', 'Resultado del Cierre', action.closure?.isCompliant, {}, 'isCompliant')}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="group relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-base">Observaciones Finales</h3>
                                        {isAdmin && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditClick('closure.notes', 'Observaciones Finales', action.closure?.notes, {}, 'textarea')}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{action.closure.notes}</p>
                                </div>
                            </CardContent>
                            </Card>
                        ) : (
                             <div className="text-center text-muted-foreground py-10">
                                <p>El cierre se podrá realizar una vez se haya completado la verificación y seas el responsable asignado.</p>
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>

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

            {isEditDialogOpen && editingField && (
                 <AdminEditDialog
                    isOpen={isEditDialogOpen}
                    setIsOpen={setIsEditDialogOpen}
                    fieldInfo={editingField}
                    onSave={handleAdminEditSave}
                    isSubmitting={isSubmitting}
                />
            )}

            {editingProposedAction && (
                <ProposedActionEditDialog
                    isOpen={!!editingProposedAction}
                    setIsOpen={() => setEditingProposedAction(null)}
                    proposedAction={editingProposedAction}
                    users={users}
                    onSave={handleProposedActionSave}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
