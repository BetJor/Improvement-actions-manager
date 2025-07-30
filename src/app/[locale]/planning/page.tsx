
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
    phaseKey: "setup",
    tasks: [
      { id: 1, taskKey: "task1" },
      { id: 2, taskKey: "task2" },
      { id: 3, taskKey: "task3" },
    ],
    duration: "short",
  },
  {
    phaseKey: "auth",
    tasks: [
      { id: 1, taskKey: "task1" },
      { id: 2, taskKey: "task2" },
    ],
    duration: "medium",
  },
  {
    phaseKey: "core",
    tasks: [
      { id: 1, taskKey: "task1" },
      { id: 2, taskKey: "task2" },
      { id: 3, taskKey: "task3" },
    ],
    duration: "long",
  },
  {
    phaseKey: "ai",
    tasks: [
      { id: 1, taskKey: "task1" },
      { id: 2, taskKey: "task2" },
    ],
    duration: "medium",
  },
  {
    phaseKey: "data",
    tasks: [
        { id: 1, taskKey: "task1" },
        { id: 2, taskKey: "task2" },
    ],
    duration: "short",
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
              <CardTitle>{t(`phases.${phase.phaseKey}.title` as any)}</CardTitle>
              <CardDescription>{t("durationLabel")}: {t(`durations.${phase.duration}` as any)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {phase.tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{t(`phases.${phase.phaseKey}.tasks.${task.taskKey}` as any)}</span>
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
