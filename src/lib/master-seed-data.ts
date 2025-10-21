
import type { ActionCategory, ActionSubcategory, AffectedArea, Center, ImprovementActionType } from './types';

export const seedActionTypes: ImprovementActionType[] = [
    { id: 'ambit-1', name: 'Calidad' },
    { id: 'ambit-2', name: 'Medioambiente' },
    { id: 'ambit-3', name: 'Responsabilidad social' },
    { id: 'ambit-4', name: 'Seguridad de la Información' },
    { id: 'ambit-5', name: 'ENS' },
    { id: 'ambit-6', name: 'Seguridad y Salud Laboral' },
    { id: 'ambit-7', name: 'Riesgos de Seguridad del Paciente' },
];

export const seedCategories: ActionCategory[] = [
    { id: 'origin-1', name: 'ISO 9001 - Auditoría Interna', actionTypeIds: ['ambit-1'] },
    { id: 'origin-2', name: 'ISO 9001 - Auditoría Externa', actionTypeIds: ['ambit-1'] },
    { id: 'origin-3', name: 'Planes de acción de gestión de riesgos', actionTypeIds: ['ambit-1'] },
    { id: 'origin-4', name: 'Otros', actionTypeIds: ['ambit-1'] },
];

export const seedSubcategories: ActionSubcategory[] = [
    // Aquestes s'han de definir ara des de la interfície d'usuari,
    // ja que depenen dels nous orígens.
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
