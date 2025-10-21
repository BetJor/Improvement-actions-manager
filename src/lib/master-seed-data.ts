
import type { ActionCategory, ActionSubcategory, AffectedArea, Center, ImprovementActionType } from './types';

export const seedActionTypes: Omit<ImprovementActionType, 'id'>[] = [
    { name: 'Calidad', order: 0 },
    { name: 'Medioambiente', order: 1 },
    { name: 'Responsabilidad social', order: 2 },
    { name: 'Seguridad de la Información', order: 3 },
    { name: 'ENS', order: 4 },
    { name: 'Seguridad y Salud Laboral', order: 5 },
    { name: 'Riesgos de Seguridad del Paciente', order: 6 },
];


export const seedCategories: ActionCategory[] = [
    // La llista s'ha buidat a petició de l'usuari.
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

