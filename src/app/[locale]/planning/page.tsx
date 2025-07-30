
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import { CheckCircle2 } from "lucide-react"

const timeline = [
  {
    phase: "planning.phases.setup.title",
    tasks: [
      { id: 1, name: "planning.phases.setup.tasks.task1" },
      { id: 2, name: "planning.phases.setup.tasks.task2" },
      { id: 3, name: "planning.phases.setup.tasks.task3" },
    ],
    duration: "planning.durations.short",
  },
  {
    phase: "planning.phases.auth.title",
    tasks: [
      { id: 1, name: "planning.phases.auth.tasks.task1" },
      { id: 2, name: "planning.phases.auth.tasks.task2" },
    ],
    duration: "planning.durations.medium",
  },
  {
    phase: "planning.phases.core.title",
    tasks: [
      { id: 1, name: "planning.phases.core.tasks.task1" },
      { id: 2, name: "planning.phases.core.tasks.task2" },
      { id: 3, name: "planning.phases.core.tasks.task3" },
    ],
    duration: "planning.durations.long",
  },
  {
    phase: "planning.phases.ai.title",
    tasks: [
      { id: 1, name: "planning.phases.ai.tasks.task1" },
      { id: 2, name: "planning.phases.ai.tasks.task2" },
    ],
    duration: "planning.durations.medium",
  },
  {
    phase: "planning.phases.data.title",
    tasks: [
        { id: 1, name: "planning.phases.data.tasks.task1" },
        { id: 2, name: "planning.phases.data.tasks.task2" },
    ],
    duration: "planning.durations.short",
  }
];

export default async function PlanningPage() {
  const t = await getTranslations("PlanningPage");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      
      <div className="space-y-8">
        {timeline.map((phase, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{t(phase.phase as any)}</CardTitle>
              <CardDescription>{t("durationLabel")}: {t(phase.duration as any)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {phase.tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{t(task.name as any)}</span>
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
