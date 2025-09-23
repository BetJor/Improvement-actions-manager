
"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { CheckCircle2, CircleDot, Wrench } from "lucide-react"

  
export default function RoadmapPage() {

    const timeline = [
        {
          key: "phase1",
          title: "Fase 1: Configuración Inicial y Estructura",
          duration: "Estimado: 1-2 días",
          completed_tasks: [
            "Configurar proyecto Next.js con TypeScript y Tailwind CSS.",
            "Estructurar la aplicación con el directorio App e i18n.",
            "Implementar la disposición principal, incluyendo la barra lateral y la cabecera."
          ],
          pending_tasks: []
        },
        {
          key: "phase2",
          title: "Fase 2: Autenticación y Gestión de Usuarios",
          duration: "Estimado: 2-3 días",
          completed_tasks: [
            "Integrar Firebase Authentication para el inicio de sesión con Google.",
            "Crear rutas protegidas y gestionar las sesiones de los usuarios."
          ],
          pending_tasks: []
        },
        {
          key: "phase3",
          title: "Fase 3: Funcionalidad Principal (Acciones de Mejora)",
          duration: "Estimado: 3-5 días",
          completed_tasks: [
            "Crear la página para ver, filtrar y ordenar las acciones de mejora.",
            "Desarrollar el formulario para crear nuevas acciones de mejora.",
            "Implementar la página de detalle para cada acción de mejora.",
            "Implementar formularios de Análisis y Verificación para interactuar con el workflow.",
            "Implementar sistema de comentarios en las acciones.",
            "Implementar la subida de archivos adjuntos (integración con Firebase Storage).",
            "Refactorizar la gestión de datos para un estado global sincronizado (`useActionState`).",
            "Implementar un sistema de suscripción (seguimiento) a las acciones de mejora.",
            "Personalizar y simplificar el Dashboard eliminando widgets de gráficos.",
            "Crear un botón de acción flotante (FAB) para la creación rápida de acciones."
          ],
          pending_tasks: []
        },
        {
          key: "phase4",
          title: "Fase 4: Integración de IA con Genkit",
          duration: "Estimado: 2-3 días",
          completed_tasks: [
            "Crear un flujo de Genkit para obtener los grupos de un usuario (con datos de muestra).",
            "Implementar el planificador de workflows inteligente para generar planes de trabajo dinámicos.",
            "Implementar un asistente para mejorar la redacción de observaciones.",
            "Implementar un asistente de IA para la propuesta de análisis de causas y acciones correctivas."
          ],
          pending_tasks: [
            "Pendiente: Conectar el flujo de Genkit a la API real de Google Groups.",
            "Pendiente: Crear un asistente de IA para la propuesta de acciones correctivas."
          ]
        },
        {
          key: "phase5",
          title: "Fase 5: Gestión de Datos Maestros (CRUD)",
          duration: "Estimado: 1-2 días",
          completed_tasks: [
            "Desarrollar la página de configuración con pestañas para las tablas de datos maestros.",
            "Implementar funcionalidades CRUD (Crear, Leer, Actualizar, Borrar) para los datos.",
            "Crear la página de configuración de los prompts de la IA."
          ],
          pending_tasks: []
        },
        {
          key: "phase6",
          title: "Fase 6: Estabilidad y Corrección de Errores",
          icon: Wrench,
          duration: "Continuo",
          completed_tasks: [
            "Solucionar errores de traducción (`MISSING_MESSAGE`) para una experiencia multilenguaje robusta.",
            "Resolver errores de compilación de Next.js (JSX en archivos .ts).",
            "Corregir errores de ejecución y bucles infinitos relacionados con la gestión del estado."
          ],
          pending_tasks: []
        },
        {
          key: "phase7",
          title: "Fase 7: Roles y Permisos de Usuario",
          duration: "Estimado: 3-4 días",
          completed_tasks: [
            "Definir una estructura de datos en Firestore para roles y permisos.",
            "Implementar funcionalidad de suplantación de usuarios para administradores."
          ],
          pending_tasks: [
            "Pendiente: Crear un mecanismo para asignar roles a los usuarios (p. ej., en un panel de administración).",
            "Pendiente: Proteger rutas y componentes de la interfaz según el rol del usuario."
          ]
        },
        {
          key: "phase8",
          title: "Fase 8: Mejoras de Experiencia de Usuario (UX)",
          duration: "Estimado: 2-3 días",
          completed_tasks: [
            "Implementar la reordenación de las secciones del dashboard con 'drag-and-drop' para guardar la preferencia del usuario."
          ],
          pending_tasks: [
            "Pendiente: Implementar la reordenación de las secciones (Detalles, Comentarios, Adjuntos) del panel lateral con 'drag-and-drop' para guardar la preferencia del usuario."
          ]
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hoja de Ruta</h1>
                <p className="text-muted-foreground mt-1">Un resumen de las fases de desarrollo, tareas completadas y pendientes.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Fases del Desarrollo</CardTitle>
                    <CardDescription>Los grandes hitos de desarrollo que ya se han alcanzado y los que quedan pendientes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {timeline.map((phase, index) => (
                      <div key={index} className="relative pl-10">
                         <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            {phase.icon ? <phase.icon className="h-5 w-5" /> : <span className="font-bold">{index + 1}</span>}
                         </div>
                        <h3 className="text-xl font-semibold">{phase.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{phase.duration}</p>
                        
                        <div className="space-y-3">
                            {phase.completed_tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span>{task}</span>
                                </div>
                            ))}
                            {phase.pending_tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-start gap-3">
                                    <CircleDot className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                                    <span className="font-semibold">{task}</span>
                                </div>
                            ))}
                        </div>

                      </div>
                    ))}
                </CardContent>
            </Card>
      </div>
    )
  }
