import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { getTranslations } from "next-intl/server"
  import { CheckCircle2, CircleDot } from "lucide-react"

  
  export default async function RoadmapPage() {
    const t = await getTranslations("RoadmapPage")
  
    const timeline = [
        {
          key: "phase1",
          completed_tasks: ["task1", "task2", "task3"],
          pending_tasks: []
        },
        {
          key: "phase2",
          completed_tasks: ["task1", "task2"],
          pending_tasks: []
        },
        {
          key: "phase3",
          completed_tasks: ["task1", "task2", "task3"],
          pending_tasks: ["pending_task2", "pending_task3"]
        },
        {
          key: "phase4",
          completed_tasks: ["task1", "task2", "task4"],
          pending_tasks: ["pending_task1", "pending_task3"]
        },
        {
          key: "phase5",
          completed_tasks: ["task1", "task2", "task3"],
          pending_tasks: []
        },
        {
          key: "phase6",
          completed_tasks: [],
          pending_tasks: ["task1", "task2", "task3"]
        },
        {
          key: "phase7",
          completed_tasks: [],
          pending_tasks: ["task1"]
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground mt-1">{t("description")}</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t("phases.title")}</CardTitle>
                    <CardDescription>{t("phases.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {timeline.map((phase, index) => (
                      <div key={index} className="relative pl-10">
                         <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold">{index + 1}</span>
                         </div>
                        <h3 className="text-xl font-semibold">{t(`phases.${phase.key}.title`)}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{t(`phases.${phase.key}.duration`)}</p>
                        
                        <div className="space-y-3">
                            {phase.completed_tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span>{t(`phases.${phase.key}.tasks.${task}`)}</span>
                                </div>
                            ))}
                            {phase.pending_tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-start gap-3">
                                    <CircleDot className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                                    <span className="font-semibold">{t(`phases.${phase.key}.tasks.${task}`)}</span>
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
  