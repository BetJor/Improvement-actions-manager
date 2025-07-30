import type { ImprovementAction, User, UserGroup } from './types';
import { subDays, format } from 'date-fns';

export const users: User[] = [
  { id: 'user-1', name: 'Ana García', role: 'Director', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', email: 'ana.garcia@example.com' },
  { id: 'user-2', name: 'Carlos Rodríguez', role: 'Responsible', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', email: 'carlos.rodriguez@example.com' },
  { id: 'user-3', name: 'Laura Martinez', role: 'Creator', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', email: 'laura.martinez@example.com' },
  { id: 'user-4', name: 'Javier López', role: 'Committee', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708c', email: 'javier.lopez@example.com' },
  { id: 'user-5', name: 'Sofía Hernandez', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=a0425e8ff4e29026704d', email: 'sofia.hernandez@example.com' },
];

export const groups: UserGroup[] = [
  { id: 'finance@example.com', name: 'Departament Financer', userIds: ['user-1', 'user-2'] },
  { id: 'it-security@example.com', name: 'Seguretat Informàtica', userIds: ['user-5'] },
  { id: 'customer-support@example.com', name: 'Atenció al Client', userIds: ['user-1', 'user-3'] },
  { id: 'quality-management@example.com', name: 'Gestió de Qualitat', userIds: ['user-2', 'user-4'] },
  { id: 'risk-management@example.com', name: 'Gestió de Riscos', userIds: ['user-1', 'user-5'] },
  { id: 'it-legacy-systems@example.com', name: 'Sistemes Legacy', userIds: ['user-5'] },
  { id: 'rsc-committee@example.com', name: 'Comitè RSC', userIds: ['user-3', 'user-4'] },
];

export const actions: ImprovementAction[] = [
  {
    id: 'AM-001',
    title: 'Optimización de proceso de facturación',
    type: 'AC',
    status: 'Pendiente Análisis',
    description: 'Se ha detectado una demora significativa en el proceso de facturación mensual que afecta al flujo de caja.',
    creator: users[2],
    responsibleGroupId: 'finance@example.com',
    responsibleUser: users[1],
    creationDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    analysisDueDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    implementationDueDate: format(new Date(), 'yyyy-MM-dd'),
    closureDueDate: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'AM-002',
    title: 'Auditoría interna de seguridad de la información',
    type: 'ACSGSI',
    status: 'Finalizada',
    description: 'No conformidad detectada en la auditoría interna de SI sobre la gestión de accesos de usuarios.',
    creator: users[0],
    responsibleGroupId: 'it-security@example.com',
    responsibleUser: users[4],
    creationDate: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    analysisDueDate: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
    implementationDueDate: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    closureDueDate: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    analysis: { causes: 'Falta de un protocolo formalizado.', proposedAction: 'Crear y comunicar protocolo.', responsible: users[4], date: format(subDays(new Date(), 38), 'yyyy-MM-dd') },
    verification: { notes: 'Protocolo implementado correctamente.', isCompliant: true, date: format(subDays(new Date(), 18), 'yyyy-MM-dd') },
    closure: { notes: 'Acción cerrada conforme.', isCompliant: true, date: format(subDays(new Date(), 15), 'yyyy-MM-dd') },
  },
  {
    id: 'AM-003',
    title: 'Incidencia en atención al usuario externo',
    type: 'SAU',
    status: 'Pendiente Comprobación',
    description: 'Queja recurrente sobre el tiempo de espera en la línea de atención al cliente.',
    creator: users[2],
    responsibleGroupId: 'customer-support@example.com',
    responsibleUser: users[0],
    creationDate: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
    analysisDueDate: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    implementationDueDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    closureDueDate: format(new Date(), 'yyyy-MM-dd'),
    analysis: { causes: 'Personal insuficiente en horas pico.', proposedAction: 'Reforzar turnos en horas de alta demanda.', responsible: users[0], date: format(subDays(new Date(), 18), 'yyyy-MM-dd') },
  },
  {
    id: 'AM-004',
    title: 'Mejora de la gestión de residuos hospitalarios',
    type: 'ACM',
    status: 'Pendiente de Cierre',
    description: 'Optimizar la segregación de residuos en el Hospital de Coslada para cumplir con la nueva normativa.',
    creator: users[3],
    responsibleGroupId: 'quality-management@example.com',
    responsibleUser: users[1],
    creationDate: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    analysisDueDate: format(subDays(new Date(), 55), 'yyyy-MM-dd'),
    implementationDueDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    closureDueDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    analysis: { causes: 'Falta de formación del personal de limpieza.', proposedAction: 'Realizar jornadas de capacitación.', responsible: users[1], date: format(subDays(new Date(), 50), 'yyyy-MM-dd') },
    verification: { notes: 'Capacitación realizada y nuevo protocolo en marcha.', isCompliant: true, date: format(subDays(new Date(), 8), 'yyyy-MM-dd') },
  },
  {
    id: 'AM-005',
    title: 'Revisión del sistema de gestión de prevención',
    type: 'AMSGP',
    status: 'Borrador',
    description: 'Revisión anual del sistema de gestión de la prevención de riesgos laborales.',
    creator: users[4],
    responsibleGroupId: 'risk-management@example.com',
    responsibleUser: users[0],
    creationDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    analysisDueDate: format(new Date(), 'yyyy-MM-dd'),
    implementationDueDate: format(new Date(), 'yyyy-MM-dd'),
    closureDueDate: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    id: 'AM-006',
    title: 'Informe de Verificación DAS-DP Centro Sevilla',
    type: 'IV DAS-DP',
    status: 'Pendiente Análisis',
    description: 'Seguimiento de las acciones de mejora propuestas para el centro de Sevilla-Cartuja.',
    creator: users[0],
    responsibleGroupId: 'quality-management@example.com',
    responsibleUser: users[1],
    creationDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    analysisDueDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    implementationDueDate: format(new Date(), 'yyyy-MM-dd'),
    closureDueDate: format(new Date(), 'yyyy-MM-dd'),
  },
   {
    id: 'AM-007',
    title: 'Auditoría RSC',
    type: 'ACRSC',
    status: 'Finalizada',
    description: 'Cierre de no conformidad de auditoría de Responsabilidad Social Corporativa.',
    creator: users[3],
    responsibleGroupId: 'rsc-committee@example.com',
    responsibleUser: users[4],
    creationDate: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    analysisDueDate: format(subDays(new Date(), 85), 'yyyy-MM-dd'),
    implementationDueDate: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    closureDueDate: format(subDays(new Date(), 55), 'yyyy-MM-dd'),
    analysis: { causes: 'Indicador de huella de carbono no actualizado.', proposedAction: 'Automatizar recolección de datos para el indicador.', responsible: users[4], date: format(subDays(new Date(), 80), 'yyyy-MM-dd') },
    verification: { notes: 'Sistema automático implementado.', isCompliant: true, date: format(subDays(new Date(), 58), 'yyyy-MM-dd') },
    closure: { notes: 'Acción cerrada. El indicador ahora se actualiza en tiempo real.', isCompliant: true, date: format(subDays(new Date(), 55), 'yyyy-MM-dd') },
  },
  {
    id: 'AM-008',
    title: 'Actualización de Sistema Legacy',
    type: 'ACPSI',
    status: 'Pendiente Comprobación',
    description: 'No conformidad de auditoría de SI anterior a 2014, referente a un sistema que debe ser migrado.',
    creator: users[0],
    responsibleGroupId: 'it-legacy-systems@example.com',
    responsibleUser: users[4],
    creationDate: format(subDays(new Date(), 150), 'yyyy-MM-dd'),
    analysisDueDate: format(subDays(new Date(), 140), 'yyyy-MM-dd'),
    implementationDueDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    closureDueDate: format(new Date(), 'yyyy-MM-dd'),
    analysis: { causes: 'Sistema obsoleto sin soporte.', proposedAction: 'Plan de migración a nueva plataforma.', responsible: users[4], date: format(subDays(new Date(), 135), 'yyyy-MM-dd') },
  }
];

// Funció per obtenir les dades de mostra, eventualment es connectarà a una BBDD
export const getActions = async () => {
    // Simulem un retard de xarxa
    // await new Promise(resolve => setTimeout(resolve, 500));
    return actions;
}

export const getActionById = async (id: string) => {
    // await new Promise(resolve => setTimeout(resolve, 500));
    return actions.find(action => action.id === id) || null;
}
