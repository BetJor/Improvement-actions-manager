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
import { CheckCircle2, XCircle, FileEdit, Microscope, ShieldCheck, Flag } from "lucide-react"

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

export default async function ActionDetailPage({ params }: DetailPageProps) {
  const action = await getActionById(params.id)

  if (!action) {
    notFound()
  }

  const getActionButtons = (status: string) => {
    switch (status) {
      case "Borrador":
        return <Button><FileEdit className="mr-2 h-4 w-4" /> Edit Draft</Button>
      case "Pendiente Análisis":
        return <Button><Microscope className="mr-2 h-4 w-4" /> Perform Analysis</Button>
      case "Pendiente Comprobación":
        return <Button><ShieldCheck className="mr-2 h-4 w-4" /> Verify Implementation</Button>
      case "Pendiente de Cierre":
        return <Button><Flag className="mr-2 h-4 w-4" /> Close Action</Button>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{action.id}: {action.title}</h1>
          <p className="text-muted-foreground mt-1">{action.description}</p>
        </div>
        <div className="flex-shrink-0">
          {getActionButtons(action.status)}
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {action.analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Causas y Acción Propuesta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Análisis de las Causas</h3>
                  <p className="text-sm text-muted-foreground">{action.analysis.causes}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Acción Propuesta</h3>
                  <p className="text-sm text-muted-foreground">{action.analysis.proposedAction}</p>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Análisis realizado por {action.analysis.responsible.name} el {action.analysis.date}
              </CardFooter>
            </Card>
          )}

          {action.verification && (
            <Card>
              <CardHeader>
                <CardTitle>Comprobación de la Implantación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Seguimiento y Notas</h3>
                  <p className="text-sm text-muted-foreground">{action.verification.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {action.closure && (
             <Card>
              <CardHeader>
                <CardTitle>Cierre de la Acción</CardTitle>
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
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <InfoField label="Status" value={<ActionStatusBadge status={action.status} />} />
                <InfoField label="Type" value={action.type} />
                <Separator />
                <UserField label="Creator" user={action.creator} />
                <UserField label="Responsible" user={action.responsible} />
                <Separator />
                <InfoField label="Creation Date" value={action.creationDate} />
                <InfoField label="Analysis Due" value={action.analysisDueDate} />
                <InfoField label="Implementation Due" value={action.implementationDueDate} />
                <InfoField label="Closure Due" value={action.closureDueDate} />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
