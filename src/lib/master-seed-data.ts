
import type { ActionCategory, ActionSubcategory, AffectedArea, Center, ImprovementActionType } from './types';

// Add ambitName to seed interface
interface SeedCategory extends Omit<ActionCategory, 'id' | 'actionTypeIds'> {
  ambitName: string;
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

export const seedSubcategories: ActionSubcategory[] = [
    // La llista s'ha buidat a petició de l'usuari.
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
