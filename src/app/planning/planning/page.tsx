import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { CheckCircle2 } from "lucide-react"

  const timeline = [
    {
      title: "Fase 1: Configuración Inicial y Estructura",
      duration: "Estimado: 1-2 días",
      tasks: [
        "Configurar proyecto Next.js con TypeScript y Tailwind CSS.",
        "Estructurar la aplicación con el directorio App e i18n.",
        "Implementar la disposición principal, incluyendo la barra lateral y la cabecera."
      ],
    },
    {
      title: "Fase 2: Autenticación y Gestión de Usuarios",
      duration: "Estimado: 2-3 días",
      tasks: [
        "Integrar Firebase Authentication para el inicio de sesión con Google.",
        "Crear rutas protegidas y gestionar las sesiones de los usuarios."
      ],
    },
    {
      title: "Fase 3: Funcionalidad Principal (Acciones de Mejora)",
      duration: "Estimado: 3-5 días",
      tasks: [
        "Crear la página para ver, filtrar y ordenar las acciones de mejora.",
        "Desarrollar el formulario para crear nuevas acciones de mejora.",
        "Implementar la página de detalle para cada acción de mejora."
      ],
    },
    {
      title: "Fase 4: Integración de IA con Genkit",
      duration: "Estimado: 2-3 días",
      tasks: [
        "Crear un flujo de Genkit para obtener los grupos de un usuario (simulado).",
        "Implementar el planificador de flujos de trabajo inteligente para generar planes de trabajo dinámicos."
      ],
    },
    {
      title: "Fase 5: Gestión de Datos Maestros (CRUD)",
      duration: "Estimado: 1-2 días",
      tasks: [
          "Desarrollar la página de configuración con pestañas para las tablas de datos maestros.",
          "Implementar funcionalidades CRUD (Crear, Leer, Actualizar, Borrar) para los datos."
      ],
    }
  ];
  
  const backlogItems = [
    {
      id: "TASK-001",
      title: "Conectar a la API de Google Groups",
      description: "Modificar el flujo de Genkit 'getUserGroups' para consultar la API de Google Admin SDK en lugar de usar datos de muestra. Esto requerirá configurar las credenciales de servicio en Google Cloud y dar permisos a la API.",
      priority: "Alta",
    },
    {
      id: "TASK-002",
      title: "Implementar formularios de Análisis y Verificación",
      description: "Crear los componentes de formulario (posiblemente en diálogos modales) que permitan al usuario realizar el análisis de causas y la verificación de la implantación. Estos formularios deberían guardar los datos en la acción correspondiente en Firestore.",
      priority: "Muy Alta",
    },
    // Future tasks will be added here
  ]
  
  export default async function RoadmapPage() {
  
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Planificación</h1>
                <p className="text-muted-foreground mt-1">Una visión general de las fases de desarrollo completadas y las tareas pendientes.</p>
            </div>
            
            {/* Completed Phases */}
            <Card>
                <CardHeader>
                    <CardTitle>Fases Completadas</CardTitle>
                    <CardDescription>Hitos de desarrollo que ya se han completado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {timeline.map((phase, index) => (
                      <div key={index} className="relative pl-8">
                         <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                         </div>
                        <h3 className="font-semibold">{phase.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{phase.duration}</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {phase.tasks.map((task, taskIndex) => (
                                <li key={taskIndex}>{task}</li>
                            ))}
                        </ul>
                      </div>
                    ))}
                </CardContent>
            </Card>

            {/* Backlog */}
            <Card>
                <CardHeader>
                    <CardTitle>Backlog</CardTitle>
                    <CardDescription>Tareas que están pendientes de ser abordadas.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Prioridad</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {backlogItems.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell className="text-muted-foreground">{item.description}</TableCell>
                        <TableCell className="text-right">{item.priority}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
      </div>
    )
  }