
import type { ActionCategory, ActionSubcategory, AffectedArea, Center, ImprovementActionType } from './types';

export const seedCategories: ActionCategory[] = [
    { id: 'iso-9001-auditoria-interna', name: 'ISO 9001 - Auditoría Interna', actionTypeIds: ['calidad'] },
    { id: 'iso-9001-auditoria-externa', name: 'ISO 9001 - Auditoría Externa', actionTypeIds: ['calidad'] },
    { id: 'planes-de-accion-de-gestion-de-riesgos', name: 'Planes de acción de gestión de riesgos', actionTypeIds: ['calidad'] },
    { id: 'otros', name: 'Otros', actionTypeIds: ['calidad'] },
];

export const seedSubcategories: ActionSubcategory[] = [
    // Aquestes s'han de definir ara des de la interfície d'usuari,
    // ja que depenen dels nous orígens.
];

export const seedActionTypes: ImprovementActionType[] = [
    { id: 'calidad', name: 'Calidad' },
    { id: 'medioambiente', name: 'Medioambiente' },
    { id: 'responsabilidad-social', name: 'Responsabilidad social' },
    { id: 'seguridad-de-la-informacion', name: 'Seguridad de la Información' },
    { id: 'ens', name: 'ENS' },
    { id: 'seguridad-y-salud-laboral', name: 'Seguridad y Salud Laboral' },
    { id: 'riesgos-de-seguridad-del-paciente', name: 'Riesgos de Seguridad del Paciente' },
];

export const seedAffectedAreas: AffectedArea[] = [
    { id: 'area-admin', name: 'Admisión' },
    { id: 'area-it', name: 'IT' },
    { id: 'area-cardio', name: 'Cardiología' },
    { id: 'area-finance', name: 'Finanzas' },
    { id: 'area-prl', name: 'Prevención de Riesgos' },
    { id: 'area-cleaning', name: 'Limpieza' },
    { id: 'area-physio', name: 'Fisioterapia' },
    { id: 'area-hr', name: 'Recursos Humanos' },
    { id: 'area-maint', name: 'Mantenimiento' },
    { id: 'area-qual', name: 'Calidad Asistencial' },
    { id: 'area-urg', name: 'Urgencias' },
    { id: 'area-trauma', name: 'Traumatología' },
];
