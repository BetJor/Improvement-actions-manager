
import type { ImprovementAction } from './types';
import { format, addDays, parseISO, parse } from 'date-fns';

const today = new Date();
const formatDateISO = (date: Date) => date.toISOString();

// Helper to handle the old 'dd/MM/yyyy' format and convert to ISO string
const parseAndFormatISO = (dateString: string) => {
    if (!dateString) return '';
    try {
        // Try parsing as dd/MM/yyyy first for backward compatibility with the seed file
        const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
        return parsedDate.toISOString();
    } catch {
        // If that fails, assume it's already in a parsable format (like ISO)
        try {
            return new Date(dateString).toISOString();
        } catch {
            return dateString; // Return original if all parsing fails
        }
    }
}

export const seedActions: Omit<ImprovementAction, 'id'>[] = [
  {
    actionId: "AM-24001",
    title: "Retraso en la notificación de bajas por IT",
    description: "Se ha detectado un retraso sistemático en la comunicación de las bajas por Incapacidad Temporal por parte de los trabajadores, lo que dificulta la gestión de sustituciones y la planificación de recursos humanos.",
    creator: { id: "user-3", name: "Laura Martinez", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d", email: "laura.martinez@example.com" },
    responsibleGroupId: "customer-support@example.com",
    creationDate: formatDateISO(addDays(today, -30)),
    category: "Gestión de Personal",
    categoryId: "cat-1",
    subcategory: "Control de Ausentismo",
    subcategoryId: "sub-1-1",
    type: "No Conformidad",
    typeId: "type-nc",
    affectedAreas: ["Recursos Humanos"],
    affectedAreasIds: ["area-hr"],
    center: "08017001 - Acció Preventiva",
    centerId: "center-1",
    assignedTo: "customer-support@example.com",
    status: "Pendiente Análisis",
    readers: ["laura.martinez@example.com", "customer-support@example.com"],
    authors: ["customer-support@example.com"],
    analysisDueDate: formatDateISO(addDays(today, 0)),
    implementationDueDate: formatDateISO(addDays(today, 45)),
    closureDueDate: formatDateISO(addDays(today, 60)),
    followers: ["user-1"],
  },
  {
    actionId: "AM-24002",
    title: "Optimización del proceso de facturación a mutuas",
    description: "El proceso actual de facturación a las mutuas colaboradoras es manual y propenso a errores, generando retrasos en los cobros. Se propone evaluar e implantar una solución de automatización.",
    creator: { id: "user-1", name: "Ana García", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d", email: "ana.garcia@example.com" },
    responsibleGroupId: "finance@example.com",
    creationDate: formatDateISO(addDays(today, -20)),
    category: "Procesos Financieros",
    categoryId: "cat-2",
    subcategory: "Facturación",
    subcategoryId: "sub-2-1",
    type: "Oportunidad de Mejora",
    typeId: "type-om",
    affectedAreas: ["Administración", "Finanzas"],
    affectedAreasIds: ["area-admin", "area-finance"],
    center: "08018001 - Centre Mèdic de Cotxeres",
    centerId: "center-2",
    assignedTo: "finance@example.com",
    status: "Pendiente Comprobación",
    readers: ["ana.garcia@example.com", "finance@example.com", "user-6@example.com"],
    authors: ["user-6@example.com"],
    analysisDueDate: formatDateISO(addDays(today, -10)),
    implementationDueDate: formatDateISO(addDays(today, 25)),
    closureDueDate: formatDateISO(addDays(today, 40)),
    followers: ["user-5"],
    analysis: {
        causes: "El proceso depende de la introducción manual de datos en hojas de cálculo, sin validaciones automáticas. La falta de integración entre el sistema de gestión de pacientes y el de facturación obliga a duplicar la información.",
        proposedActions: [
            { id: "pa-1", description: "Evaluar 3 herramientas de software para la automatización de facturas.", responsibleUserId: "user-2", dueDate: formatDateISO(addDays(today, 5)), status: "Implementada" },
            { id: "pa-2", description: "Realizar una prueba de concepto con la herramienta seleccionada.", responsibleUserId: "user-6", dueDate: formatDateISO(addDays(today, 20)), status: "Implementada Parcialment" }
        ],
        verificationResponsibleUserId: "user-6",
        analysisResponsible: { id: "user-2", name: "Carlos Rodríguez", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
        analysisDate: formatDateISO(addDays(today, -15))
    },
  },
  {
    actionId: "AM-24003",
    title: "Falta de EPIs en almacén para personal de limpieza",
    description: "El personal de limpieza del centro de Cornellà ha reportado en varias ocasiones la falta de guantes y mascarillas FFP2 en el almacén, teniendo que reutilizar material o utilizar EPIs de categoría inferior.",
    creator: { id: "user-7", name: "Elena Gomez", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702e", email: "elena.gomez@example.com" },
    responsibleGroupId: "risk-management@example.com",
    creationDate: formatDateISO(addDays(today, -10)),
    category: "Seguridad y Salud",
    categoryId: "cat-3",
    subcategory: "Equipos de Protección Individual (EPI)",
    subcategoryId: "sub-3-1",
    type: "Reclamación",
    typeId: "type-r",
    affectedAreas: ["Prevención de Riesgos", "Limpieza"],
    affectedAreasIds: ["area-prl", "area-cleaning"],
    center: "08073001 - Centre Mèdic de Cornellà",
    centerId: "center-3",
    assignedTo: "risk-management@example.com",
    status: "Pendiente de Cierre",
    readers: ["elena.gomez@example.com", "risk-management@example.com", "user-1@example.com"],
    authors: ["elena.gomez@example.com"],
    analysisDueDate: formatDateISO(addDays(today, 5)),
    implementationDueDate: formatDateISO(addDays(today, 20)),
    closureDueDate: formatDateISO(addDays(today, 35)),
    followers: ["user-admin"],
    analysis: {
        causes: "El proveedor de EPIs ha tenido roturas de stock. El sistema de inventario no generó alertas de stock mínimo a tiempo.",
        proposedActions: [
            { id: "pa-3", description: "Contratar un segundo proveedor homologado para EPIs críticos.", responsibleUserId: "user-4", dueDate: formatDateISO(addDays(today, 10)), status: "Implementada" },
            { id: "pa-4", description: "Configurar alertas automáticas de stock mínimo en el sistema de gestión.", responsibleUserId: "user-5", dueDate: formatDateISO(addDays(today, 15)), status: "Implementada" }
        ],
        verificationResponsibleUserId: "user-1",
        analysisResponsible: { id: "user-5", name: "Sofía Hernandez", avatar: "https://i.pravatar.cc/150?u=a0425e8ff4e29026704d" },
        analysisDate: formatDateISO(addDays(today, -5))
    },
    verification: {
        notes: "Se ha comprobado que el segundo proveedor está dado de alta y se han recibido los primeros pedidos. Las alertas de stock funcionan correctamente.",
        isEffective: true,
        verificationDate: formatDateISO(addDays(today, -2)),
        verificationResponsible: { id: "user-1", name: "Ana García", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
        proposedActionsStatus: { "pa-3": "Implementada", "pa-4": "Implementada" }
    }
  },
  {
    actionId: "AM-24004",
    title: "Mejora del protocolo de rehabilitación para lesiones de hombro",
    description: "Los fisioterapeutas sugieren revisar y actualizar el protocolo de rehabilitación para manguito rotador, incorporando nuevas técnicas de terapia manual y ejercicios isométricos que han demostrado mayor eficacia en estudios recientes.",
    creator: { id: "user-2", name: "Carlos Rodríguez", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", email: "carlos.rodriguez@example.com" },
    responsibleGroupId: "quality-management@example.com",
    creationDate: formatDateISO(addDays(today, -5)),
    category: "Asistencia Sanitaria",
    categoryId: "cat-4",
    subcategory: "Protocolos Clínicos",
    subcategoryId: "sub-4-1",
    type: "Sugerencia",
    typeId: "type-s",
    affectedAreas: ["Fisioterapia"],
    affectedAreasIds: ["area-physio"],
    center: "08073001 - Centre Mèdic de Cornellà",
    centerId: "center-3",
    assignedTo: "quality-management@example.com",
    status: "Borrador",
    readers: ["carlos.rodriguez@example.com"],
    authors: ["carlos.rodriguez@example.com"],
    analysisDueDate: formatDateISO(addDays(today, 25)),
    implementationDueDate: formatDateISO(addDays(today, 70)),
    closureDueDate: formatDateISO(addDays(today, 85)),
    followers: [],
  },
  {
    actionId: "AM-24005",
    title: "Incidencia con el software de citaciones",
    description: "El día 15/07/2024 el software de citaciones 'CitaMed' estuvo inoperativo durante 3 horas, provocando la cancelación de 25 visitas y la reasignación manual de otras 40. Los pacientes mostraron su descontento.",
    creator: { id: "user-8", name: "Miguel Perez", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d", email: "miguel.perez@example.com" },
    responsibleGroupId: "it-legacy-systems@example.com",
    creationDate: formatDateISO(addDays(today, -45)),
    category: "Sistemas de Información",
    categoryId: "cat-5",
    subcategory: "Software de Gestión",
    subcategoryId: "sub-5-1",
    type: "Incidencia",
    typeId: "type-i",
    affectedAreas: ["Admisión", "IT"],
    affectedAreasIds: ["area-admin", "area-it"],
    center: "08018001 - Centre Mèdic de Cotxeres",
    centerId: "center-2",
    assignedTo: "it-legacy-systems@example.com",
    status: "Finalizada",
    readers: ["miguel.perez@example.com", "it-legacy-systems@example.com", "user-admin@example.com"],
    authors: ["user-admin@example.com"],
    analysisDueDate: formatDateISO(addDays(today, -30)),
    implementationDueDate: formatDateISO(addDays(today, -15)),
    closureDueDate: formatDateISO(addDays(today, -5)),
    followers: ["user-admin", "user-8"],
    analysis: {
        causes: "La caída del servicio se debió a una saturación de la base de datos por un proceso nocturno de backup mal configurado que no liberaba la memoria.",
        proposedActions: [
            { id: "pa-5", description: "Reprogramar y optimizar el script de backup para que se ejecute en horas de baja concurrencia.", responsibleUserId: "user-5", dueDate: formatDateISO(addDays(today, -20)), status: "Implementada" }
        ],
        verificationResponsibleUserId: "user-5",
        analysisResponsible: { id: "user-5", name: "Sofía Hernandez", avatar: "https://i.pravatar.cc/150?u=a0425e8ff4e29026704d" },
        analysisDate: formatDateISO(addDays(today, -35))
    },
    verification: {
        notes: "El script se ha modificado y monitorizado durante 2 semanas. No se han vuelto a producir picos de consumo de memoria y el servicio ha estado estable.",
        isEffective: true,
        verificationDate: formatDateISO(addDays(today, -10)),
        verificationResponsible: { id: "user-5", name: "Sofía Hernandez", avatar: "https://i.pravatar.cc/150?u=a0425e8ff4e29026704d" },
        proposedActionsStatus: { "pa-5": "Implementada" }
    },
    closure: {
        notes: "Se da por cerrada la incidencia. El problema de software ha sido resuelto y se han tomado medidas para que no vuelva a ocurrir.",
        isCompliant: true,
        date: formatDateISO(addDays(today, -5)),
        closureResponsible: { id: "user-admin", name: "Admin User", avatar: "https://i.pravatar.cc/150?u=admin", email: "admin@example.com" }
    }
  },
  {
    actionId: "AM-24006",
    title: "Errores en el consentimiento informado para pruebas de esfuerzo",
    description: "Se han detectado varios casos en los que los pacientes firman el consentimiento para pruebas de esfuerzo sin que se les explique adecuadamente los riesgos, o utilizando una versión desactualizada del documento.",
    creator: { id: "user-4", name: "Javier López", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708c", email: "javier.lopez@example.com" },
    responsibleGroupId: "quality-management@example.com",
    creationDate: formatDateISO(addDays(today, -60)),
    category: "Calidad Asistencial",
    categoryId: "cat-6",
    subcategory: "Documentación Clínica",
    subcategoryId: "sub-6-1",
    type: "No Conformidad",
    typeId: "type-nc",
    affectedAreas: ["Cardiología", "Admisión"],
    affectedAreasIds: ["area-cardio", "area-admin"],
    center: "08018001 - Centre Mèdic de Cotxeres",
    centerId: "center-2",
    assignedTo: "quality-management@example.com",
    status: "Finalizada",
    readers: ["javier.lopez@example.com", "quality-management@example.com", "user-admin@example.com"],
    authors: ["user-admin@example.com"],
    analysisDueDate: formatDateISO(addDays(today, -45)),
    implementationDueDate: formatDateISO(addDays(today, -20)),
    closureDueDate: formatDateISO(addDays(today, -10)),
    followers: ["user-admin"],
    analysis: {
        causes: "Falta de un procedimiento estandarizado para la entrega y explicación del consentimiento. El personal de admisión no ha recibido formación específica sobre este documento. La versión digital del documento no estaba actualizada en el sistema.",
        proposedActions: [
            { id: "pa-6", description: "Actualizar el documento de consentimiento informado en el sistema y destruir las copias físicas antiguas.", responsibleUserId: "user-5", dueDate: formatDateISO(addDays(today, -30)), status: "Implementada" },
            { id: "pa-7", description: "Realizar una sesión formativa obligatoria para todo el personal de admisión sobre el protocolo de consentimiento.", responsibleUserId: "user-1", dueDate: formatDateISO(addDays(today, -25)), status: "No Implementada" }
        ],
        verificationResponsibleUserId: "user-4",
        analysisResponsible: { id: "user-1", name: "Ana García", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
        analysisDate: formatDateISO(addDays(today, -50))
    },
    verification: {
        notes: "La actualización del documento se ha realizado correctamente. Sin embargo, la sesión formativa no se ha llevado a cabo por problemas de agenda del personal, por lo que el riesgo de que el problema persista es alto.",
        isEffective: false,
        verificationDate: formatDateISO(addDays(today, -15)),
        verificationResponsible: { id: "user-4", name: "Javier López", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708c" },
        proposedActionsStatus: { "pa-6": "Implementada", "pa-7": "No Implementada" }
    },
    closure: {
        notes: "La acción no ha sido eficaz, ya que la medida formativa, considerada clave, no se ha implantado. Se procede a cerrar esta acción como 'No Conforme' y se abre una acción BIS para gestionar la formación pendiente.",
        isCompliant: false,
        date: formatDateISO(addDays(today, -10)),
        closureResponsible: { id: "user-admin", name: "Admin User", avatar: "https://i.pravatar.cc/150?u=admin", email: "admin@example.com" }
    }
  },
  {
    actionId: "AM-24007",
    title: "Errores en el consentimiento informado para pruebas de esfuerzo BIS",
    description: "Esta acción es una continuación de la AM-24006. El objetivo es asegurar la impartición de la formación al personal de admisión sobre el nuevo protocolo de consentimiento informado.\n\n--- \nObservaciones de cierre no conforme:\nLa acción no ha sido eficaz, ya que la medida formativa, considerada clave, no se ha implantado. Se procede a cerrar esta acción como 'No Conforme' y se abre una acción BIS para gestionar la formación pendiente.",
    creator: { id: "user-admin", name: "Admin User", avatar: "https://i.pravatar.cc/150?u=admin", email: "admin@example.com" },
    responsibleGroupId: "quality-management@example.com",
    creationDate: formatDateISO(addDays(today, -10)),
    category: "Calidad Asistencial",
    categoryId: "cat-6",
    subcategory: "Documentación Clínica",
    subcategoryId: "sub-6-1",
    type: "No Conformidad",
    typeId: "type-nc",
    affectedAreas: ["Cardiología", "Admisión"],
    affectedAreasIds: ["area-cardio", "area-admin"],
    center: "08018001 - Centre Mèdic de Cotxeres",
    centerId: "center-2",
    assignedTo: "quality-management@example.com",
    status: "Pendiente Análisis",
    readers: ["admin@example.com", "quality-management@example.com"],
    authors: ["quality-management@example.com"],
    analysisDueDate: formatDateISO(addDays(today, 20)),
    implementationDueDate: formatDateISO(addDays(today, 35)),
    closureDueDate: formatDateISO(addDays(today, 50)),
    followers: ["user-admin"],
    originalActionId: "firestore-doc-id-of-am-24006", // This would be the real Firestore ID
    originalActionTitle: "AM-24006: Errores en el consentimiento informado para pruebas de esfuerzo"
  }
];
