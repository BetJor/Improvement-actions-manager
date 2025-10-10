import type { ImprovementAction } from './types';
import { addDays, subDays } from 'date-fns';

// Aquest fitxer ara només conté les dades mínimes per a la creació.
// El actionId, dates, workflowPlan, etc., seran generats per la funció createAction.

// We use a 'seedId' to link actions (like BIS actions) before we know the final Firestore ID.
interface SeedAction extends Partial<Omit<ImprovementAction, 'id'>> {
    seedId: string;
    title: string;
    description: string;
    typeId: string;
    status: ImprovementActionStatus;
    categoryId: string;
    subcategoryId: string;
    affectedAreasIds: string[];
    centerId: string;
    creator: { id: string; name: string; email: string; };
    assignedTo: string;
    originalActionId?: string; // This will reference another seedId
    originalActionTitle?: string;
    closure?: { notes: string; isCompliant: boolean; };
}


export const seedActionsData: SeedAction[] = [
    // 1. Finalizada (Conforme) - Rápida
    {
        seedId: "seed-01",
        title: "Incidencia puntual con el software de citaciones",
        description: "El día 15/07/2024 el software de citaciones 'CitaMed' estuvo inoperativo durante 1 hora. Se resolvió reiniciando el servidor. El impacto fue menor, afectando a 5 pacientes que fueron re-citados telefónicamente.",
        typeId: "type-i",
        status: "Finalizada",
        categoryId: "cat-5",
        subcategoryId: "sub-5-1",
        affectedAreasIds: ["area-admin", "area-it"],
        centerId: "0885",
        creator: { id: "user-8", name: "Miguel Perez", email: "miguel.perez@example.com" },
        assignedTo: "it-legacy-systems@example.com",
    },
    // 2. Finalizada (No Conforme) -> Genera la #3
    {
        seedId: "seed-02",
        title: "Errores en el consentimiento informado para pruebas de esfuerzo",
        description: "Se han detectado varios casos en los que los pacientes firman el consentimiento para pruebas de esfuerzo utilizando una versión desactualizada del documento.",
        typeId: "type-nc",
        status: "Finalizada",
        categoryId: "cat-6",
        subcategoryId: "sub-6-1",
        affectedAreasIds: ["area-cardio", "area-admin"],
        centerId: "0101",
        creator: { id: "user-4", name: "Javier López", email: "javier.lopez@example.com" },
        assignedTo: "quality-management@example.com",
        closure: {
            notes: "Cierre no conforme. La acción formativa es crucial y no se ha realizado. Se genera acción BIS para asegurar su cumplimiento.",
            isCompliant: false,
        }
    },
    // 3. Pendiente Análisis (BIS de la #2)
    {
        seedId: "seed-03",
        title: "Errores en el consentimiento informado para pruebas de esfuerzo BIS",
        description: "Acción creada a partir del cierre no conforme de la AM-24002. El objetivo es asegurar la impartición de la formación al personal de admisión sobre el nuevo protocolo de consentimiento informado.",
        typeId: "type-nc",
        status: "Pendiente Análisis",
        categoryId: "cat-6",
        subcategoryId: "sub-6-1",
        affectedAreasIds: ["area-cardio", "area-admin"],
        centerId: "0101",
        creator: { id: "user-4", name: "Javier López", email: "javier.lopez@example.com" },
        assignedTo: "quality-management@example.com",
        originalActionId: "seed-02",
        originalActionTitle: "AM-24002: Errores en el consentimiento informado para pruebas de esfuerzo",
    },
    // 4. Pendiente Comprobación
    {
        seedId: "seed-04",
        title: "Optimización del proceso de facturación a mutuas",
        description: "El proceso actual de facturación a las mutuas colaboradoras es manual y propenso a errores, generando retrasos en los cobros. Se propone evaluar e implantar una solución de automatización.",
        typeId: "type-om",
        status: "Pendiente Comprobación",
        categoryId: "cat-2",
        subcategoryId: "sub-2-1",
        affectedAreasIds: ["area-admin", "area-finance"],
        centerId: "1601",
        creator: { id: "user-1", name: "Ana García", email: "ana.garcia@example.com" },
        assignedTo: "finance@example.com",
    },
    // 5. Pendiente de Cierre
    {
        seedId: "seed-05",
        title: "Falta de EPIs en almacén para personal de limpieza",
        description: "El personal de limpieza ha reportado en varias ocasiones la falta de guantes y mascarillas FFP2 en el almacén, teniendo que reutilizar material.",
        typeId: "type-r",
        status: "Pendiente de Cierre",
        categoryId: "cat-3",
        subcategoryId: "sub-3-1",
        affectedAreasIds: ["area-prl", "area-cleaning"],
        centerId: "0702",
        creator: { id: "user-7", name: "Elena Gomez", email: "elena.gomez@example.com" },
        assignedTo: "risk-management@example.com",
    },
    // 6. Borrador
    {
        seedId: "seed-06",
        title: "Mejora del protocolo de rehabilitación para lesiones de hombro",
        description: "Los fisioterapeutas sugieren revisar y actualizar el protocolo de rehabilitación para manguito rotador, incorporando nuevas técnicas de terapia manual y ejercicios isométricos.",
        typeId: "type-s",
        status: "Borrador",
        categoryId: "cat-4",
        subcategoryId: "sub-4-1",
        affectedAreasIds: ["area-physio"],
        centerId: "0302",
        creator: { id: "user-2", name: "Carlos Rodríguez", email: "carlos.rodriguez@example.com" },
        assignedTo: "quality-management@example.com",
    },
    // 7. Pendiente Análisis
    {
        seedId: "seed-07",
        title: "Retraso en la notificación de bajas por IT",
        description: "Se ha detectado un retraso sistemático en la comunicación de las bajas por Incapacidad Temporal por parte de los trabajadores, lo que dificulta la gestión de sustituciones y la planificación de recursos humanos.",
        typeId: "type-nc",
        status: "Pendiente Análisis",
        categoryId: "cat-1",
        subcategoryId: "sub-1-1",
        affectedAreasIds: ["area-hr"],
        centerId: "0885",
        creator: { id: "user-3", name: "Laura Martinez", email: "laura.martinez@example.com" },
        assignedTo: "customer-support@example.com",
    },
    // 8. Finalizada (Antigua)
    {
        seedId: "seed-08",
        title: "Revisión anual de extintores",
        description: "Revisión anual obligatoria de todos los extintores del centro de Manacor, según normativa de seguridad.",
        typeId: "type-m",
        status: "Finalizada",
        categoryId: "cat-3",
        subcategoryId: "sub-3-2",
        affectedAreasIds: ["area-maint"],
        centerId: "0702",
        creator: { id: "user-admin", name: "Admin User", email: "admin@example.com" },
        assignedTo: "risk-management@example.com",
    },
    // 9. Pendiente Análisis - Riesgos Psicosociales
    {
        seedId: "seed-09",
        title: "Aumento de quejas por estrés en el área de Admisión",
        description: "En la última encuesta de clima laboral, el personal de admisión ha reportado un notable aumento del estrés debido a la carga de trabajo y a situaciones conflictivas con pacientes. Se requiere un análisis de riesgos psicosociales.",
        typeId: "type-nc",
        status: "Pendiente Análisis",
        categoryId: "cat-1",
        subcategoryId: "sub-1-2",
        affectedAreasIds: ["area-hr", "area-admin"],
        centerId: "0302",
        creator: { id: "user-3", name: "Laura Martinez", email: "laura.martinez@example.com" },
        assignedTo: "risk-management@example.com",
    },
    // 10. Pendiente Comprobación - Formación
    {
        seedId: "seed-10",
        title: "Formación en nuevo software de gestión para Fisioterapia",
        description: "Se ha adquirido un nuevo software para la gestión de pacientes en el área de fisioterapia. Es necesario planificar y ejecutar la formación para todo el personal del departamento.",
        typeId: "type-om",
        status: "Pendiente Comprobación",
        categoryId: "cat-7",
        subcategoryId: "sub-7-1",
        affectedAreasIds: ["area-physio", "area-it"],
        centerId: "1601",
        creator: { id: "user-5", name: "Sofía Hernandez", email: "sofia.hernandez@example.com" },
        assignedTo: "it-legacy-systems@example.com",
    },
    // 11. Borrador - Sugerencia de un usuario
    {
        seedId: "seed-11",
        title: "Instalación de más dispensadores de gel hidroalcohólico",
        description: "He notado que en la sala de espera de Traumatología solo hay un dispensador de gel y a menudo se forman colas. Sugiero instalar al menos dos más para mejorar la higiene y agilizar el flujo de pacientes.",
        typeId: "type-s",
        status: "Borrador",
        categoryId: "cat-8",
        subcategoryId: "sub-8-1",
        affectedAreasIds: ["area-maint", "area-qual"],
        centerId: "0101",
        creator: { id: "user-9", name: "Elisabet Jordana", email: "elisabet.jordana@example.com" },
        assignedTo: "risk-management@example.com",
    },
    // 12. Finalizada (Conforme) - Larga
    {
        seedId: "seed-12",
        title: "Implantación de sistema de encuestas de satisfacción post-alta",
        description: "Para cumplir con la ISO 9001:2015, se decide implantar un sistema automatizado para enviar encuestas de satisfacción a los pacientes 48h después del alta.",
        typeId: "type-om",
        status: "Finalizada",
        categoryId: "cat-6",
        subcategoryId: "sub-6-2",
        affectedAreasIds: ["area-qual", "area-it"],
        centerId: "0885",
        creator: { id: "user-1", name: "Ana García", email: "ana.garcia@example.com" },
        assignedTo: "quality-management@example.com",
    },
    // 13. Pendiente Análisis - Reclamación de paciente
    {
        seedId: "seed-13",
        title: "Reclamación por tiempo de espera excesivo en Urgencias",
        description: "Un paciente ha presentado una reclamación formal por haber esperado más de 4 horas para ser atendido en el servicio de urgencias por una torcedura de tobillo.",
        typeId: "type-r",
        status: "Pendiente Análisis",
        categoryId: "cat-6",
        subcategoryId: "sub-6-3",
        affectedAreasIds: ["area-urg", "area-trauma"],
        centerId: "0101",
        creator: { id: "user-admin", name: "Admin User", email: "admin@example.com" },
        assignedTo: "quality-management@example.com",
    },
    // 14. Pendiente Comprobación - Oportunidad de Mejora
    {
        seedId: "seed-14",
        title: "Digitalización de archivos de RRHH",
        description: "El departamento de RRHH propone digitalizar los expedientes antiguos para reducir el espacio físico de archivadores y agilizar las consultas.",
        typeId: "type-om",
        status: "Pendiente Comprobación",
        categoryId: "cat-9",
        subcategoryId: "sub-9-1",
        affectedAreasIds: ["area-hr"],
        centerId: "1601",
        creator: { id: "user-3", name: "Laura Martinez", email: "laura.martinez@example.com" },
        assignedTo: "customer-support@example.com",
    },
    // 15. Pendiente de Cierre - Incidencia
    {
        seedId: "seed-15",
        title: "Error en el cálculo de la nómina de julio",
        description: "Se ha detectado un error en el cálculo de las retenciones del IRPF en la nómina de julio para 15 trabajadores, lo que ha generado un pago incorrecto.",
        typeId: "type-i",
        status: "Pendiente de Cierre",
        categoryId: "cat-2",
        subcategoryId: "sub-2-2",
        affectedAreasIds: ["area-finance", "area-hr"],
        centerId: "0885",
        creator: { id: "user-6", name: "David Fernandez", email: "david.fernandez@example.com" },
        assignedTo: "finance@example.com",
    }
];
