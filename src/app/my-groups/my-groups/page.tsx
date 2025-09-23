
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
import { useEffect, useState } from "react";
import type { UserGroup } from "@/lib/types";
import { getUserGroups } from "@/ai/flows/getUserGroups";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function MyGroupsPage() {
  const { user, loading } = useAuth();
  const [userGroups, setUserGroups] = useState<Omit<UserGroup, "userIds">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      if (user?.email) {
        setIsLoading(true);
        setError(null);
        try {
          // Pass the user's email to the flow
          const groups = await getUserGroups(user.email);
          setUserGroups(groups);
        } catch (err: any) {
          console.error("Failed to fetch user groups:", err);
          setError(err.message || "Se ha producido un error al cargar los grupos.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (!loading && user) {
      fetchGroups();
    } else if (!loading && !user) {
      setIsLoading(false);
    }
  }, [user, loading]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Grupos</CardTitle>
        <CardDescription>Estos son los grupos de Google Workspace a los que perteneces.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error al Cargar los Grupos</AlertTitle>
                <AlertDescription>
                    <p>{error}</p>
                    <p className="mt-2 text-xs">Asegúrate de que la configuración de la Cuenta de Servicio y las variables de entorno (`GSUITE_ADMIN_EMAIL`) son correctas.</p>
                </AlertDescription>
            </Alert>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Cargando grupos desde Google Workspace...
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
                  No se han encontrado grupos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
