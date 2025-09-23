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
  import { getTranslations } from "next-intl/server"
  import { CheckCircle2 } from "lucide-react"

  const timeline = [
    {
      title: "Phase 1: Initial Setup & Structure",
      duration: "Estimated: 1-2 days",
      tasks: [
        "Setup Next.js project with TypeScript and Tailwind CSS.",
        "Structure the application with the App directory and i18n.",
        "Implement the main layout, including the sidebar and header."
      ],
    },
    {
      title: "Phase 2: Authentication & User Management",
      duration: "Estimated: 2-3 days",
      tasks: [
        "Integrate Firebase Authentication for Google sign-in.",
        "Create protected routes and manage user sessions."
      ],
    },
    {
      title: "Phase 3: Core Functionality (Improvement Actions)",
      duration: "Estimated: 3-5 days",
      tasks: [
        "Create the page to view, filter, and sort improvement actions.",
        "Develop the form to create new improvement actions.",
        "Implement the detail page for each improvement action."
      ],
    },
    {
      title: "Phase 4: AI Integration with Genkit",
      duration: "Estimated: 2-3 days",
      tasks: [
        "Create a Genkit flow to get a user's groups (mocked).",
        "Implement the intelligent workflow planner to generate dynamic work plans."
      ],
    },
    {
      title: "Phase 5: Master Data Management (CRUD)",
      duration: "Estimated: 1-2 days",
      tasks: [
          "Develop the settings page with tabs for master data tables.",
          "Implement CRUD (Create, Read, Update, Delete) functionalities for the data."
      ],
    }
  ];
  
  const backlogItems = [
    {
      id: "TASK-001",
      title: "Connectar a l'API de Google Groups",
      description: "Modificar el flow de Genkit 'getUserGroups' per a consultar l'API de Google Admin SDK en lloc de fer servir dades de mostra. Això requerirà configurar les credencials de servei a Google Cloud i donar permisos a l'API.",
      priority: "Alta",
    },
    {
      id: "TASK-002",
      title: "Implementar formularis d'Anàlisi i Verificació",
      description: "Crear els components de formulari (possiblement en diàlegs modals) que permetin a l'usuari realitzar l'anàlisi de causes i la verificació de la implantació. Aquests formularis haurien de desar les dades a l'acció corresponent a Firestore.",
      priority: "Molt Alta",
    },
    // Future tasks will be added here
  ]
  
  export default async function RoadmapPage() {
    const t = await getTranslations("RoadmapPage")
  
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground mt-1">{t("description")}</p>
            </div>
            
            {/* Completed Phases */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("completed.title")}</CardTitle>
                    <CardDescription>{t("completed.description")}</CardDescription>
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
                    <CardTitle>{t("backlog.title")}</CardTitle>
                    <CardDescription>{t("backlog.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">{t("backlog.col.id")}</TableHead>
                        <TableHead>{t("backlog.col.title")}</TableHead>
                        <TableHead>{t("backlog.col.description")}</TableHead>
                        <TableHead className="text-right">{t("backlog.col.priority")}</TableHead>
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