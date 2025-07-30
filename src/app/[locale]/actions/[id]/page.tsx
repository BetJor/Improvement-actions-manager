import { getActionById } from "@/lib/data"
import { notFound } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ActionStatusBadge } from "@/components/action-status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, XCircle, FileEdit, Microscope, ShieldCheck, Flag, CalendarClock, UserCheck, Milestone } from "lucide-react"
import { getTranslations } from "next-intl/server"

interface DetailPageProps {
  params: { id: string }
}

const InfoField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-2">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm">{value}</dd>
  </div>
)

const UserField = ({ label, user }: { label: string; user: { name: string; avatar: string } }) => (
  <div className="grid grid-cols-2 gap-2 items-center">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="flex items-center gap-2 text-sm">
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <span>{user.name}</span>
    </dd>
  </div>
)

const GroupField = ({ label, groupId }: { label: string; groupId: string }) => (
    <div className="grid grid-cols-2 gap-2 items-center">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{groupId}</dd>
    </div>
  )


export default async function ActionDetailPage({ params }: DetailPageProps) {
  const t = await getTranslations("ActionDetailPage");
  const action = await getActionById(params.id)

  if (!action) {
    notFound()
  }

  const getActionButtons = (status: string) => {
    switch (status) {
      case "Borrador":
        return <Button><FileEdit className="mr-2 h-4 w-4" /> {t("editDraft")}</Button>
      case "Pendiente Análisis":
        return <Button><Microscope className="mr-2 h-4 w-4" /> {t("performAnalysis")}</Button>
      case "Pendiente Comprobación":
        return <Button><ShieldCheck className="mr-2 h-4 w-4" /> {t("verifyImplementation")}</Button>
      case "Pendiente de Cierre":
        return <Button><Flag className="mr-2 h-4 w-4" /> {t("closeAction")}</Button>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{action.actionId}: {action.title}</h1>
          <p className="text-muted-foreground mt-1">{action.description}</p>
        </div>
        <div className="flex-shrink-0">
          {getActionButtons(action.status)}
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {action.workflowPlan && (
            <Card>
              <CardHeader>
                <CardTitle>{t("workflowPlan.title")}</CardTitle>
                <CardDescription>{t("workflowPlan.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {action.workflowPlan.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Milestone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{step.stepName}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="h-4 w-4" />
                            <span>{step.responsibleParty}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <CalendarClock className="h-4 w-4" />
                             <span>{step.dueDate}</span>
                          </div>
                        </div>
                      </div>
                       <ActionStatusBadge status={step.status as any} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {action.analysis && (
            <Card>
              <CardHeader>
                <CardTitle>{t("causesAndProposedAction")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{t("causesAnalysis")}</h3>
                  <p className="text-sm text-muted-foreground">{action.analysis.causes}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("proposedAction")}</h3>
                  <p className="text-sm text-muted-foreground">{action.analysis.proposedAction}</p>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {t("analysisPerformedBy", {name: action.analysis.responsible.name, date: action.analysis.date})}
              </CardFooter>
            </Card>
          )}

          {action.verification && (
            <Card>
              <CardHeader>
                <CardTitle>{t("implementationVerification")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{t("followUpAndNotes")}</h3>
                  <p className="text-sm text-muted-foreground">{action.verification.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {action.closure && (
             <Card>
              <CardHeader>
                <CardTitle>{t("actionClosure")}</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground">{action.closure.notes}</p>
              </CardContent>
            </Card>
          )}

        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("details")}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <InfoField label={t("status")} value={<ActionStatusBadge status={action.status} />} />
                <InfoField label={t("type")} value={action.type} />
                <Separator />
                <UserField label={t("creator")} user={action.creator} />
                <GroupField label={t("responsible")} groupId={action.responsibleGroupId} />
                {action.responsibleUser && <UserField label="Responsable assignat" user={action.responsibleUser} />}
                <Separator />
                <InfoField label={t("creationDate")} value={action.creationDate} />
                <InfoField label={t("analysisDue")} value={action.analysisDueDate} />
                <InfoField label={t("implementationDue")} value={action.implementationDueDate} />
                <InfoField label={t("closureDue")} value={action.closureDueDate} />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
