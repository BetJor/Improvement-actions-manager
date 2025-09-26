
import { ImprovementAction } from './types';
import { addDays, format } from 'date-fns';

function formatDateISO(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}

const today = new Date();

export const initialActions: ImprovementAction[] = [
{
  "id": "0Kk5Au6bnIkVCvhhZ4GB",
  "followers": [
    "user-admin"
  ],
  "readers": [
    "admin@example.com",
    "quality-management@example.com"
  ],
  "affectedAreasIds": [
    "area-cardio",
    "area-admin"
  ],
  "typeId": "type-nc",
  "creationDate": "2025-09-13T11:18:54.335Z",
  "responsibleGroupId": "quality-management@example.com",
  "authors": [
    "quality-management@example.com"
  ],
  "actionId": "AM-24007",
  "implementationDueDate": "2025-10-28T12:18:54.335Z",
  "category": "Calidad Asistencial",
  "creator": {
    "avatar": "https://i.pravatar.cc/150?u=admin",
    "id": "user-admin",
    "email": "admin@example.com",
    "name": "Admin User"
  },
  "title": "Errores en el consentimiento informado para pruebas de esfuerzo BIS",
  "affectedAreas": [
    "Cardiología",
    "Admisión"
  ],
  "closureDueDate": "2025-11-12T12:18:54.335Z",
  "assignedTo": "quality-management@example.com",
  "originalActionId": "pfjYu0zIiN8WgeWBpxD4",
  "status": "Pendiente Análisis",
  "subcategoryId": "sub-6-1",
  "originalActionTitle": "AM-24006: Errores en el consentimiento informado para pruebas de esfuerzo",
  "analysisDueDate": "2025-10-13T11:18:54.335Z",
  "categoryId": "cat-6",
  "type": "No Conformidad",
  "description": "Esta acción es una continuación de la AM-24006. El objetivo es asegurar la impartición de la formación al personal de admisión sobre el nuevo protocolo de consentimiento informado.\n\n--- \nObservaciones de cierre no conforme:\nLa acción no ha sido eficaz, ya que la medida formativa, considerada clave, no se ha implantado. Se procede a cerrar esta acción como 'No Conforme' y se abre una acción BIS para gestionar la formación pendiente.",
  "subcategory": "Documentación Clínica",
  "center": "0885 - Hospital Sant Cugat",
  "centerId": "0885"
},
{
  "id": "0pPUB71b2cbyrv0IOXAr",
  "readers": [
    "miguel.perez@example.com",
    "it-legacy-systems@example.com",
    "user-admin@example.com"
  ],
  "authors": [
    "user-admin@example.com"
  ],
  "subcategoryId": "sub-5-1",
  "analysisDueDate": "2025-08-24T11:18:54.335Z",
  "closure": {
    "notes": "Se da por cerrada la incidencia. El problema de software ha sido resuelto y se han tomado medidas para que no vuelva a ocurrir.",
    "isCompliant": true,
    "closureResponsible": {
      "name": "Admin User",
      "id": "user-admin",
      "avatar": "https://i.pravatar.cc/150?u=admin",
      "email": "admin@example.com"
    },
    "date": "2025-09-18T11:18:54.335Z"
  },
  "creator": {
    "email": "miguel.perez@example.com",
    "id": "user-8",
    "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026708d",
    "name": "Miguel Perez"
  },
  "category": "Sistemas de Información",
  "verification": {
    "notes": "El script se ha modificado y monitorizado durante 2 semanas. No se han vuelto a producir picos de consumo de memoria y el servicio ha estado estable.",
    "verificationResponsible": {
      "avatar": "https://i.pravatar.cc/150?u=a0425e8ff4e29026704d",
      "name": "Sofía Hernandez",
      "id": "user-5"
    },
    "verificationDate": "2025-09-13T11:18:54.335Z",
    "proposedActionsStatus": {
      "pa-5": "Implementada"
    },
    "isEffective": true
  },
  "actionId": "AM-24005",
  "status": "Finalizada",
  "type": "Incidencia",
  "followers": [
    "user-admin",
    "user-8"
  ],
  "affectedAreasIds": [
    "area-admin",
    "area-it"
  ],
  "affectedAreas": [
    "Admisión",
    "IT"
  ],
  "subcategory": "Software de Gestión",
  "assignedTo": "it-legacy-systems@example.com",
  "responsibleGroupId": "it-legacy-systems@example.com",
  "categoryId": "cat-5",
  "description": "El día 15/07/2024 el software de citaciones 'CitaMed' estuvo inoperativo durante 3 horas, provocando la cancelación de 25 visitas y la reasignación manual de otras 40. Los pacientes mostraron su descontento.",
  "title": "Incidencia con el software de citaciones",
  "creationDate": "2025-08-09T11:18:54.335Z",
  "implementationDueDate": "2025-09-08T11:18:54.335Z",
  "closureDueDate": "2025-09-18T11:18:54.335Z",
  "typeId": "type-i",
  "analysis": {
    "analysisResponsible": {
      "avatar": "https://i.pravatar.cc/150?u=a0425e8ff4e29026704d",
      "name": "Sofía Hernandez",
      "id": "user-5"
    },
    "causes": "La caída del servicio se debió a una saturación de la base de datos por un proceso nocturno de backup mal configurado que no liberaba la memoria.",
    "proposedActions": [
      {
        "description": "Reprogramar y optimizar el script de backup para que se ejecute en horas de baja concurrencia.",
        "id": "pa-5",
        "responsibleUserId": "user-5",
        "dueDate": "2025-09-03T11:18:54.335Z",
        "status": "Implementada"
      }
    ],
    "analysisDate": "2025-08-19T11:18:54.335Z",
    "verificationResponsibleUserId": "user-5"
  },
  "center": "1601 - Cuenca",
  "centerId": "1601"
},
{
  "id": "3ktRjGLNB6Dfn7V7rFL4",
  "assignedTo": "finance@example.com",
  "creator": {
    "email": "ana.garcia@example.com",
    "name": "Ana García",
    "id": "user-1",
    "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026024d"
  },
  "analysisDueDate": "2025-09-13T11:18:54.335Z",
  "typeId": "type-om",
  "creationDate": "2025-09-03T11:18:54.335Z",
  "implementationDueDate": "2025-10-18T11:18:54.335Z",
  "subcategory": "Facturación",
  "subcategoryId": "sub-2-1",
  "authors": [
    "user-6@example.com"
  ],
  "categoryId": "cat-2",
  "actionId": "AM-24002",
  "readers": [
    "ana.garcia@example.com",
    "finance@example.com",
    "user-6@example.com"
  ],
  "status": "Pendiente Comprobación",
  "title": "Optimización del proceso de facturación a mutuas",
  "responsibleGroupId": "finance@example.com",
  "analysis": {
    "analysisResponsible": {
      "name": "Carlos Rodríguez",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      "id": "user-2"
    },
    "analysisDate": "2025-09-08T11:18:54.335Z",
    "verificationResponsibleUserId": "user-6",
    "causes": "El proceso depende de la introducción manual de datos en hojas de cálculo, sin validaciones automáticas. La falta de integración entre el sistema de gestión de pacientes y el de facturación obliga a duplicar la información.",
    "proposedActions": [
      {
        "responsibleUserId": "user-2",
        "status": "Implementada",
        "description": "Evaluar 3 herramientas de software para la automatización de facturas.",
        "id": "pa-1",
        "dueDate": "2025-09-28T11:18:54.335Z"
      },
      {
        "responsibleUserId": "user-6",
        "description": "Realizar una prueba de concepto con la herramienta seleccionada.",
        "id": "pa-2",
        "status": "Implementada Parcialment",
        "dueDate": "2025-10-13T11:18:54.335Z"
      }
    ]
  },
  "affectedAreasIds": [
    "area-admin",
    "area-finance"
  ],
  "closureDueDate": "2025-11-02T12:18:54.335Z",
  "category": "Procesos Financieros",
  "type": "Oportunidad de Mejora",
  "description": "El proceso actual de facturación a las mutuas colaboradoras es manual y propenso a errores, generando retrasos en los cobros. Se propone evaluar e implantar una solución de automatización.",
  "followers": [
    "user-5"
  ],
  "affectedAreas": [
    "Administración",
    "Finanzas"
  ],
  "center": "0302 - Elche-Elx",
  "centerId": "0302"
},
{
  "id": "WUQprox3GKfusVrGekIF",
  "subcategoryId": "sub-4-1",
  "readers": [
    "carlos.rodriguez@example.com"
  ],
  "title": "Mejora del protocolo de rehabilitación para lesiones de hombro",
  "analysisDueDate": "2025-10-18T11:18:54.335Z",
  "description": "Los fisioterapeutas sugieren revisar y actualizar el protocolo de rehabilitación para manguito rotador, incorporando nuevas técnicas de terapia manual y ejercicios isométricos que han demostrado mayor eficacia en estudios recientes.",
  "authors": [
    "carlos.rodriguez@example.com"
  ],
  "responsibleGroupId": "quality-management@example.com",
  "typeId": "type-s",
  "creator": {
    "name": "Carlos Rodríguez",
    "id": "user-2",
    "email": "carlos.rodriguez@example.com",
    "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  },
  "categoryId": "cat-4",
  "affectedAreasIds": [
    "area-physio"
  ],
  "status": "Borrador",
  "assignedTo": "quality-management@example.com",
  "type": "Sugerencia",
  "actionId": "AM-24004",
  "affectedAreas": [
    "Fisioterapia"
  ],
  "subcategory": "Protocolos Clínicos",
  "implementationDueDate": "2025-12-02T12:18:54.335Z",
  "followers": [],
  "creationDate": "2025-09-18T11:18:54.335Z",
  "category": "Asistencia Sanitaria",
  "closureDueDate": "2025-12-17T12:18:54.335Z",
  "center": "0702 - Manacor",
  "centerId": "0702"
},
{
  "id": "bSxXPu2G7OrgDPVMGp5j",
  "creator": {
    "email": "laura.martinez@example.com",
    "id": "user-3",
    "name": "Laura Martinez",
    "avatar": "https://i.pravatar.cc/150?u=a04258114e29026702d"
  },
  "responsibleGroupId": "customer-support@example.com",
  "subcategory": "Control de Ausentismo",
  "followers": [
    "user-1"
  ],
  "type": "No Conformidad",
  "affectedAreas": [
    "Recursos Humanos"
  ],
  "categoryId": "cat-1",
  "category": "Gestión de Personal",
  "creationDate": "2025-08-24T11:18:54.335Z",
  "typeId": "type-nc",
  "title": "Retraso en la notificación de bajas por IT",
  "affectedAreasIds": [
    "area-hr"
  ],
  "analysisDueDate": "2025-09-23T11:18:54.335Z",
  "status": "Pendiente Análisis",
  "assignedTo": "customer-support@example.com",
  "closureDueDate": "2025-11-22T12:18:54.335Z",
  "subcategoryId": "sub-1-1",
  "readers": [
    "laura.martinez@example.com",
    "customer-support@example.com"
  ],
  "description": "Se ha detectado un retraso sistemático en la comunicación de las bajas por Incapacidad Temporal por parte de los trabajadores, lo que dificulta la gestión de sustituciones y la planificación de recursos humanos.",
  "authors": [
    "customer-support@example.com"
  ],
  "implementationDueDate": "2025-11-07T12:18:54.335Z",
  "actionId": "AM-24001",
  "center": "0702 - Manacor",
  "centerId": "0702"
},
{
  "id": "f6y2OMXiqdWLzULGyzoX",
  "status": "Pendiente de Cierre",
  "type": "Reclamación",
  "affectedAreasIds": [
    "area-prl",
    "area-cleaning"
  ],
  "affectedAreas": [
    "Prevención de Riesgos",
    "Limpieza"
  ],
  "categoryId": "cat-3",
  "subcategory": "Equipos de Protección Individual (EPI)",
  "creationDate": "2025-09-13T11:18:54.335Z",
  "responsibleGroupId": "risk-management@example.com",
  "followers": [
    "user-admin"
  ],
  "implementationDueDate": "2025-10-13T11:18:54.335Z",
  "description": "El personal de limpieza del centro de Cornellà ha reportado en varias ocasiones la falta de guantes y mascarillas FFP2 en el almacén, teniendo que reutilizar material o utilizar EPIs de categoría inferior.",
  "authors": [
    "elena.gomez@example.com"
  ],
  "closureDueDate": "2025-10-28T12:18:54.335Z",
  "assignedTo": "risk-management@example.com",
  "analysis": {
    "analysisDate": "2025-09-18T11:18:54.335Z",
    "proposedActions": [
      {
        "status": "Implementada",
        "responsibleUserId": "user-4",
        "id": "pa-3",
        "dueDate": "2025-10-03T11:18:54.335Z",
        "description": "Contratar un segundo proveedor homologado para EPIs críticos."
      },
      {
        "description": "Configurar alertas automáticas de stock mínimo en el sistema de gestión.",
        "dueDate": "2025-10-08T11:18:54.335Z",
        "id": "pa-4",
        "responsibleUserId": "user-5",
        "status": "Implementada"
      }
    ],
    "verificationResponsibleUserId": "user-1",
    "causes": "El proveedor de EPIs ha tenido roturas de stock. El sistema de inventario no generó alertas de stock mínimo a tiempo.",
    "analysisResponsible": {
      "avatar": "https://i.pravatar.cc/150?u=a0425e8ff4e29026704d",
      "id": "user-5",
      "name": "Sofía Hernandez"
    }
  },
  "title": "Falta de EPIs en almacén para personal de limpieza",
  "typeId": "type-r",
  "actionId": "AM-24003",
  "analysisDueDate": "2025-09-28T11:18:54.335Z",
  "readers": [
    "elena.gomez@example.com",
    "risk-management@example.com",
    "user-1@example.com"
  ],
  "subcategoryId": "sub-3-1",
  "category": "Seguridad y Salud",
  "verification": {
    "notes": "Se ha comprobado que el segundo proveedor está dado de alta y se han recibido los primeros pedidos. Las alertas de stock funcionan correctamente.",
    "verificationResponsible": {
      "id": "user-1",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      "name": "Ana García"
    },
    "isEffective": true,
    "verificationDate": "2025-09-21T11:18:54.335Z",
    "proposedActionsStatus": {
      "pa-4": "Implementada",
      "pa-3": "Implementada"
    }
  },
  "creator": {
    "email": "elena.gomez@example.com",
    "name": "Elena Gomez",
    "id": "user-7",
    "avatar": "https://i.pravatar.cc/150?u=a04258114e29026702e"
  },
  "center": "0101 - Llodio",
  "centerId": "0101"
},
{
  "id": "pfjYu0zIiN8WgeWBpxD4",
  "implementationDueDate": "2025-09-03T11:18:54.335Z",
  "typeId": "type-nc",
  "affectedAreasIds": [
    "area-cardio",
    "area-admin"
  ],
  "creationDate": "2025-07-25T11:18:54.335Z",
  "analysis": {
    "analysisDate": "2025-08-04T11:18:54.335Z",
    "proposedActions": [
      {
        "responsibleUserId": "user-5",
        "description": "Actualizar el documento de consentimiento informado en el sistema y destruir las copias físicas antiguas.",
        "status": "Implementada",
        "dueDate": "2025-08-24T11:18:54.335Z",
        "id": "pa-6"
      },
      {
        "id": "pa-7",
        "responsibleUserId": "user-1",
        "description": "Realizar una sesión formativa obligatoria para todo el personal de admisión sobre el protocolo de consentimiento.",
        "status": "No Implementada",
        "dueDate": "2025-08-29T11:18:54.335Z"
      }
    ],
    "causes": "Falta de un procedimiento estandarizado para la entrega y explicación del consentimiento. El personal de admisión no ha recibido formación específica sobre este documento. La versión digital del documento no estaba actualizada en el sistema.",
    "verificationResponsibleUserId": "user-4",
    "analysisResponsible": {
      "name": "Ana García",
      "id": "user-1",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026024d"
    }
  },
  "creator": {
    "name": "Javier López",
    "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026708c",
    "id": "user-4",
    "email": "javier.lopez@example.com"
  },
  "subcategoryId": "sub-6-1",
  "title": "Errores en el consentimiento informado para pruebas de esfuerzo",
  "assignedTo": "quality-management@example.com",
  "categoryId": "cat-6",
  "affectedAreas": [
    "Cardiología",
    "Admisión"
  ],
  "authors": [
    "user-admin@example.com"
  ],
  "actionId": "AM-24006",
  "readers": [
    "javier.lopez@example.com",
    "quality-management@example.com",
    "user-admin@example.com"
  ],
  "type": "No Conformidad",
  "description": "Se han detectado varios casos en los que los pacientes firman el consentimiento para pruebas de esfuerzo sin que se les explique adecuadamente los riesgos, o utilizando una versión desactualizada del documento.",
  "responsibleGroupId": "quality-management@example.com",
  "category": "Calidad Asistencial",
  "analysisDueDate": "2025-08-09T11:18:54.335Z",
  "closureDueDate": "2025-09-13T11:18:54.335Z",
  "subcategory": "Documentación Clínica",
  "followers": [
    "user-admin"
  ],
  "status": "Finalizada",
  "verification": {
    "verificationResponsible": {
      "name": "Javier López",
      "avatar": "https://i.pravatar.cc/150?u=a042581f4e29026708c",
      "id": "user-4"
    },
    "notes": "La actualización del documento se ha realizado correctamente. Sin embargo, la sesión formativa no se ha llevado a cabo por problemas de agenda del personal, por lo que el riesgo de que el problema persista es alto.",
    "isEffective": false,
    "verificationDate": "2025-09-08T11:18:54.335Z",
    "proposedActionsStatus": {
      "pa-7": "No Implementada",
      "pa-6": "Implementada"
    }
  },
  "closure": {
    "date": "2025-09-13T11:18:54.335Z",
    "isCompliant": false,
    "notes": "La acción no ha sido eficaz, ya que la medida formativa, considerada clave, no se ha implantado. Se procede a cerrar esta acción como 'No Conforme' y se abre una acción BIS para gestionar la formación pendiente.",
    "closureResponsible": {
      "email": "admin@example.com",
      "name": "Admin User",
      "avatar": "https://i.pravatar.cc/150?u=admin",
      "id": "user-admin"
    }
  },
  "center": "0885 - Hospital Sant Cugat",
  "centerId": "0885"
}
];
