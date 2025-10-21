
import type { ActionCategory, ActionSubcategory, AffectedArea, Center, ImprovementActionType } from './types';

export const seedCategories: ActionCategory[] = [
    { id: 'cat-1', name: 'Gestión de Personal' },
    { id: 'cat-2', name: 'Procesos Financieros' },
    { id: 'cat-3', name: 'Seguridad y Salud' },
    { id: 'cat-4', name: 'Asistencia Sanitaria' },
    { id: 'cat-5', name: 'Sistemas de Información' },
    { id: 'cat-6', name: 'Calidad Asistencial' },
    { id: 'cat-7', name: 'Formación' },
    { id: 'cat-8', name: 'Infraestructuras' },
    { id: 'cat-9', name: 'Procesos de Soporte' },
];

export const seedSubcategories: ActionSubcategory[] = [
    { id: 'sub-1-1', name: 'Control de Ausentismo', categoryId: 'cat-1' },
    { id: 'sub-1-2', name: 'Riesgos Psicosociales', categoryId: 'cat-1' },
    { id: 'sub-2-1', name: 'Facturación', categoryId: 'cat-2' },
    { id: 'sub-2-2', name: 'Nóminas', categoryId: 'cat-2' },
    { id: 'sub-3-1', name: 'Equipos de Protección Individual (EPI)', categoryId: 'cat-3' },
    { id: 'sub-3-2', name: 'Mantenimiento Preventivo', categoryId: 'cat-3' },
    { id: 'sub-4-1', name: 'Protocolos Clínicos', categoryId: 'cat-4' },
    { id: 'sub-5-1', name: 'Software de Gestión', categoryId: 'cat-5' },
    { id: 'sub-6-1', name: 'Documentación Clínica', categoryId: 'cat-6' },
    { id: 'sub-6-2', name: 'Satisfacción del Paciente', categoryId: 'cat-6' },
    { id: 'sub-6-3', name: 'Tiempos de Espera', categoryId: 'cat-6' },
    { id: 'sub-7-1', name: 'Formación Interna', categoryId: 'cat-7' },
    { id: 'sub-8-1', name: 'Instalaciones', categoryId: 'cat-8' },
    { id: 'sub-9-1', name: 'Digitalización', categoryId: 'cat-9' },
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
