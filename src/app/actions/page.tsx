"use client"

import { useActionState } from "@/hooks/use-action-state";
import { ActionsTable } from "@/components/actions-table"
import { Loader2 } from "lucide-react"
import { FloatingActionButton } from "@/components/floating-action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActionsPage() {
  const { actions, isLoading } = useActionState();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Mejora</CardTitle>
          <CardDescription>
            Aquí puedes encontrar todas las acciones de mejora. Usa los filtros para acotar tu búsqueda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionsTable actions={actions} />
        </CardContent>
      </Card>
      <FloatingActionButton />
    </>
  )
}
