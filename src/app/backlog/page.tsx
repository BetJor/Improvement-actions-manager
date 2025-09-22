"use client";

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
  
  const backlogItems = [
    {
      id: "TASK-001",
      title: "Conectar a la API de Google Groups",
      description: "Modificar el flow de Genkit 'getUserGroups' para consultar la API de Google Admin SDK en lugar de usar datos de muestra. Esto requerirá configurar las credenciales de servicio en Google Cloud y dar permisos a la API.",
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
  
  export default function BacklogPage() {
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backlog del Proyecto</CardTitle>
          <CardDescription>Tareas pendientes de priorizar y planificar para futuras iteraciones de desarrollo.</CardDescription>
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
    )
  }
