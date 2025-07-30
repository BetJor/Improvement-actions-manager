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
  
  const backlogItems = [
    {
      id: "TASK-001",
      title: "Connectar a l'API de Google Groups",
      description: "Modificar el flow de Genkit 'getUserGroups' per a consultar l'API de Google Admin SDK en lloc de fer servir dades de mostra. Això requerirà configurar les credencials de servei a Google Cloud i donar permisos a l'API.",
      priority: "Alta",
    },
    // Future tasks will be added here
  ]
  
  export default async function BacklogPage() {
    const t = await getTranslations("BacklogPage")
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t("col.id")}</TableHead>
                <TableHead>{t("col.title")}</TableHead>
                <TableHead>{t("col.description")}</TableHead>
                <TableHead className="text-right">{t("col.priority")}</TableHead>
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
    )
  }
  