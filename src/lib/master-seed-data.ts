import type { ActionCategory, ActionSubcategory, AffectedArea, Center, ImprovementActionType } from './types';

// Add ambitName to seed interface
interface SeedCategory extends Omit<ActionCategory, 'id' | 'actionTypeIds'> {
  ambitName: string;
}

interface SeedSubcategory extends Omit<ActionSubcategory, 'id' | 'categoryId'> {
  ambitName: string;
  originName: string;
}

export const seedActionTypes: Omit<ImprovementActionType, 'id'>[] = [
    { name: 'Calidad', order: 0 },
    { name: 'Medioambiente', order: 1 },
    { name: 'Responsabilidad social', order: 2 },
    { name: 'Seguridad de la Información', order: 3 },
    { name: 'ENS', order: 4 },
    { name: 'Seguridad y Salud Laboral', order: 5 },
    { name: 'Riesgos de Seguridad del Paciente', order: 6 },
];


export const seedCategories: SeedCategory[] = [
    // Calidad
    { name: 'ISO 9001 - Auditoría Interna', order: 0, ambitName: 'Calidad' },
    { name: 'ISO 9001 - Auditoría Externa', order: 1, ambitName: 'Calidad' },
    { name: 'Planes de acción de gestión de riesgos', order: 2, ambitName: 'Calidad' },
    { name: 'Otros', order: 3, ambitName: 'Calidad' },

    // Medioambiente
    { name: 'ISO 14001 - Auditoría Interna', order: 0, ambitName: 'Medioambiente' },
    { name: 'ISO 14001 - Auditoría Externa', order: 1, ambitName: 'Medioambiente' },
    { name: 'Huella de carbono', order: 2, ambitName: 'Medioambiente' },
    { name: 'Otros', order: 3, ambitName: 'Medioambiente' },

    // Responsabilidad social
    { name: 'SR10 - Auditoría Interna', order: 0, ambitName: 'Responsabilidad social' },
    { name: 'SR10 - Auditoría Externa', order: 1, ambitName: 'Responsabilidad social' },
    { name: 'Planes de mejora de gestión de Riesgos Penales', order: 2, ambitName: 'Responsabilidad social' },
    { name: 'Auditoría interna', order: 3, ambitName: 'Responsabilidad social' },
    { name: 'Otros', order: 4, ambitName: 'Responsabilidad social' },

    // Seguridad de la Información
    { name: 'ISO 27001 - Auditoría Interna', order: 0, ambitName: 'Seguridad de la Información' },
    { name: 'ISO 27001 - Auditoría Externa', order: 1, ambitName: 'Seguridad de la Información' },
    { name: 'Planes de acción de gestión de riesgos', order: 2, ambitName: 'Seguridad de la Información' },
    { name: 'Otros', order: 3, ambitName: 'Seguridad de la Información' },

    // ENS
    { name: 'ENS - Auditoría Interna', order: 0, ambitName: 'ENS' },
    { name: 'ENS - Auditoría Externa', order: 1, ambitName: 'ENS' },
    { name: 'Planes de acción de gestión de riesgos', order: 2, ambitName: 'ENS' },
    { name: 'Otros', order: 3, ambitName: 'ENS' },

    // Seguridad y Salud Laboral
    { name: 'ISO 45001 - Auditoría Interna', order: 0, ambitName: 'Seguridad y Salud Laboral' },
    { name: 'ISO 45001 - Auditoría Externa', order: 1, ambitName: 'Seguridad y Salud Laboral' },
    { name: 'Planes de acción de gestión de riesgos', order: 2, ambitName: 'Seguridad y Salud Laboral' },
    { name: 'Otros', order: 3, ambitName: 'Seguridad y Salud Laboral' },

    // Riesgos de Seguridad del Paciente
    { name: 'ISO 179003 - Auditoría Interna', order: 0, ambitName: 'Riesgos de Seguridad del Paciente' },
    { name: 'ISO 179003 - Auditoría Externa', order: 1, ambitName: 'Riesgos de Seguridad del Paciente' },
    { name: 'Planes de acción de gestión de riesgos', order: 2, ambitName: 'Riesgos de Seguridad del Paciente' },
    { name: 'Otros', order: 3, ambitName: 'Riesgos de Seguridad del Paciente' },
];

const calidadClassifications = [
    "4.1 Comprensión de la organización",
    "4.2 Comprensión de las necesidades y expectativas de las partes interesadas",
    "4.3 Determinación del alcance del sistema de gestión de la calidad",
    "4.4 Sistema de gestión de la calidad y sus procesos",
    "5.1 Liderazgo y compromiso",
    "5.2 Política",
    "5.3 Roles, responsabilidades y autoridades en la organización",
    "6.1 Acciones para abordar riesgos y oportunidades",
    "6.2 Objetivos de la calidad y planificación para lograrlos",
    "6.3 Planificación de los cambios",
    "7.1 Recursos",
    "7.2 Competencia",
    "7.3 Toma de conciencia",
    "7.4 Comunicación",
    "7.5 Información documentada",
    "8.1 Planificación y control operacional",
    "8.2 Requisitos para los productos y servicios",
    "8.3 Diseño y desarrollo de los productos y servicios",
    "8.4 Control de los procesos, productos y servicios suministrados externamente",
    "8.5 Producción y provisión del servicio",
    "8.6 Liberación de los productos y servicios",
    "8.7 Control de las salidas no conformes",
    "9.1 Seguimiento, medición, análisis y evaluación",
    "9.2 Auditoria interna",
    "9.3 Revisión por la dirección",
    "10.2 No conformidad y acción correctiva"
];

const medioambienteClassifications = [
    "Política Ambiental",
    "2. Aspectos Ambientales",
    "3. Requisitos legales y otros requisitos - Evaluación del cumplimiento de la legislación",
    "4. Objetivos,metas y programas",
    "5. Recursos, funciones, responsabilidad y autoridad - Competencia, formación",
    "6. Comunicación",
    "7. Documentación - Control de la documentación",
    "8. Control operacional",
    "9. Preparación y respuesta antes emergencias",
    "10. Seguimiento y medición",
    "11. No conformidad, acción correctiva",
    "12. Control de los registros",
    "13. Auditoría interna",
    "14. Revisión por la Dirección",
];

const responsabilidadSocialInternaClassifications = [
    "4.1 Comprensión de la organización",
    "4.2 Comprensión de las necesidades y expectativas de las partes interesadas",
    "4.3 Determinación del alcance del sistema de gestión de respoonsabilidad social",
    "4.4 Sistema de gestión de la responsabilidad social",
    "4.5 Obligaciones de responsabilidad social",
    "5.1 Liderazgo y compromiso",
    "5.2 Política de responsabilidad social",
    "5.3 Roles, responsabilidades y autoridades en la organización",
    "5.4 Código de conducta",
    "6.1 Acciones para abordar riesgos y oportunidades",
    "6.2 Identificación y evaluación de asuntos",
    "6.3 Objetivos y planificación para lograrlos",
    "6.3 Planificación de los cambios",
    "7.1 Recursos",
    "7.2 Competencia",
    "7.3 Toma de conciencia",
    "7.4 Comunicaciones",
    "7.5 Información documentada",
    "8.1 Planificación y control operativo",
    "8.2 Propietarios y accionistas",
    "8.3 Empleados",
    "8.4 Clientes, usuarios y consumidores",
    "8.5 Proveedores de productos y servicios, colaboradores y aliados",
    "8.6 Gobiernos, Administraciones Publicas y organismos reguladores",
    "8.7 Comunidad, sociedad y organizaciones sociales",
    "8.8 Medio ambiente",
    "8.9 Competidores",
    "9.1 Seguimiento, medición, análisis y evaluación",
    "9.2 Expectativas de los grupos de interés",
    "9.3 Auditoria interna",
    "9.4 Revisión por la dirección",
    "10.1 No conformidad y acción correctiva",
    "10.2 Mejora continua"
];

const responsabilidadSocialExternaClassifications = [
    "4.1 Comprensión de la organización",
    "4.2 Comprensión de las necesidades y expectativas de las partes interesadas",
    "4.3 Determinación del alcance del sistema de gestión de respoonsabilidad social",
    "4.4 Sistema de gestión de la responsabilidad social",
    "4.5 Obligaciones de responsabilidad social",
    "5.1 Liderazgo y compromiso",
    "5.2 Política de responsabilidad social",
    "5.3 Roles, responsabilidades y autoridades en la organización",
    "5.4 Código de conducta",
    "6.1 Acciones para abordar riesgos y oportunidades",
    "6.2 Identificación y evaluación de asuntos",
    "6.3 Objetivos y planificación para lograrlos",
    "6.3 Planificación de los cambios",
    "7.1 Recursos",
    "7.2 Competencia",
    "7.3 Toma de conciencia",
    "7.4 Comunicaciones",
    "7.5 Información documentada",
    "8.1 Planificación y control operativo",
    "8.2 Propietarios y accionistas",
    "8.3 Empleados",
    "8.4 Clientes, usuarios y consumidores",
    "8.5 Proveedores de productos y servicios, colaboradores y aliados",
    "8.6 Gobiernos, Administraciones Publicas y organismos reguladores",
    "8.7 Comunidad, sociedad y organizaciones sociales",
    "8.8 Medio ambiente",
    "8.9 Competidores",
    "9.1 Seguimiento, medición, análisis y evaluación",
    "9.2 Expectativas de los grupos de interés",
    "9.3 Auditoria interna",
    "9.4 Revisión por la dirección",
    "10.1 No conformidad y acción correctiva",
    "10.2 Mejora continua"
];

const riesgosPenalesClassifications = [
    "Formación Cumplimiento",
    "Mejoras de controles",
    "Mejoras en los procesos",
    "Mejoras en cumpliento"
];

const auditoriaInternaRiesgosClassifications = [
    "Auditoría interna de riesgos penales"
];

export const seedSubcategories: SeedSubcategory[] = [
    // Calidad -> ISO 9001 - Auditoría Interna
    ...calidadClassifications.map((name, index) => ({
        name: name,
        order: index,
        ambitName: 'Calidad',
        originName: 'ISO 9001 - Auditoría Interna'
    })),
    // Calidad -> ISO 9001 - Auditoría Externa
    ...calidadClassifications.map((name, index) => ({
        name: name,
        order: index,
        ambitName: 'Calidad',
        originName: 'ISO 9001 - Auditoría Externa'
    })),
    // Medioambiente -> ISO 14001 - Auditoría Interna
    ...medioambienteClassifications.map((name, index) => ({
        name: name,
        order: index,
        ambitName: 'Medioambiente',
        originName: 'ISO 14001 - Auditoría Interna'
    })),
    // Medioambiente -> ISO 14001 - Auditoría Externa
    ...medioambienteClassifications.map((name, index) => ({
        name: name,
        order: index,
        ambitName: 'Medioambiente',
        originName: 'ISO 14001 - Auditoría Externa'
    })),
    // Responsabilidad Social -> SR10 - Auditoría Interna
    ...responsabilidadSocialInternaClassifications.map((name, index) => ({
        name: name,
        order: index,
        ambitName: 'Responsabilidad social',
        originName: 'SR10 - Auditoría Interna'
    })),
    // Responsabilidad Social -> SR10 - Auditoría Externa
    ...responsabilidadSocialExternaClassifications.map((name, index) => ({
        name: name,
        order: index,
        ambitName: 'Responsabilidad social',
        originName: 'SR10 - Auditoría Externa'
    })),
    // Responsabilidad Social -> Planes de mejora de gestión de Riesgos Penales
    ...riesgosPenalesClassifications.map((name, index) => ({
        name: name,
        order: index,
        ambitName: 'Responsabilidad social',
        originName: 'Planes de mejora de gestión de Riesgos Penales'
    })),
    // Responsabilidad Social -> Auditoría interna
    ...auditoriaInternaRiesgosClassifications.map((name, index) => ({
        name: name,
        order: index,
        ambitName: 'Responsabilidad social',
        originName: 'Auditoría interna'
    })),
];


export const seedAffectedAreas: AffectedArea[] = [
    { id: 'area-1', name: 'Admisión' },
    { id: 'area-2', name: 'IT' },
    { id: 'area-3', name: 'Cardiología' },
    { id: 'area-4', name: 'Finanzas' },
    { id: 'area-5', name: 'Prevención de Riesgos' },
    { id: 'area-6', name: 'Limpieza' },
    { id: 'area-7', name: 'Fisioterapia' },
    { id: 'area-8', name: 'Recursos Humanos' },
    { id: 'area-9', name: 'Mantenimiento' },
    { id: 'area-10', name: 'Calidad Asistencial' },
    { id: 'area-11', name: 'Urgencias' },
    { id: 'area-12', name: 'Traumatología' },
];
