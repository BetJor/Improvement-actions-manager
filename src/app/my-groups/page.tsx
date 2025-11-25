
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
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react";

export default function MyGroupsPage() {
  const { userGroups, loading } = useAuth();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Grupos</CardTitle>
        <CardDescription>Estos son los grupos de responsabilidad a los que perteneces, incluyendo roles fijos y dinámicos basados en tu función.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Grupo</TableHead>
              <TableHead>ID (Email del Grupo)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Calculando tus grupos...</span>
                    </div>
                </TableCell>
              </TableRow>
            ) : userGroups.length > 0 ? (
              userGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.id}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No se han detectado grupos para tu usuario.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
