
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

export default function MyGroupsPage() {
  const t = useTranslations("MyGroupsPage")
  const { user, loading } = useAuth();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      if (user) {
        setIsLoading(true);
        try {
          const groups = await getUserGroups(user.uid);
          setUserGroups(groups);
        } catch (error) {
          console.error("Failed to fetch user groups:", error);
          // Handle error appropriately, maybe show a toast
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (!loading) {
      fetchGroups();
    }
  }, [user, loading]);


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
              <TableHead>{t("col.name")}</TableHead>
              <TableHead>{t("col.id")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  Carregant grups...
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
