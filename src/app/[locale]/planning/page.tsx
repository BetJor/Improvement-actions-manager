
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

export default async function PlanningPage() {

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Project Planning</h1>
      <p className="text-muted-foreground">A timeline of the development phases and completed tasks to create this application.</p>
      
      <div className="space-y-8">
        {timeline.map((phase, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{phase.title}</CardTitle>
              <CardDescription>{phase.duration}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {phase.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{task}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
