
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
import { useTranslations } from "next-intl"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react";
import type { UserGroup } from "@/lib/types";
import { getUserGroups } from "@/ai/flows/getUserGroups";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function MyGroupsPage() {
  const t = useTranslations("MyGroups")
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
          setError(err.message || "S'ha produït un error en carregar els grups.");
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
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error en Carregar els Grups</AlertTitle>
                <AlertDescription>
                    <p>{error}</p>
                    <p className="mt-2 text-xs">Assegura't que la configuració de la Compte de Servei i les variables d'entorn (`GSUITE_ADMIN_EMAIL`) són correctes.</p>
                </AlertDescription>
            </Alert>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("col.name")}</TableHead>
              <TableHead>{t("col.id")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Carregant grups des de Google Workspace...
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
                  {t("noGroups")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
