"use client"

import { useActionState } from "@/hooks/use-action-state";
import { ActionsTable } from "@/components/actions-table"
import { Loader2, FileSpreadsheet, ChevronDown } from "lucide-react"
import { FloatingActionButton } from "@/components/floating-action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react";
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import type { ImprovementAction, User } from "@/lib/types"


export default function ActionsPage() {
  const { actions, isLoading } = useActionState();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  const handleExportAll = () => {
    const wb = XLSX.utils.book_new();

    const detailsData = actions.map(action => ({
        'ID': action.actionId,
        'Título': action.title,
        'Estado': action.status,
        'Creador': action.creator.name,
        'Fecha Creación': action.creationDate ? format(parseISO(action.creationDate), 'dd/MM/yyyy HH:mm') : 'N/D',
        'Responsable Análisis': action.responsibleUser?.name || action.responsibleGroupId,
        'Ámbito': action.type,
        'Origen': action.category,
        'Clasificación': action.subcategory,
        'Centro': action.center,
        'Áreas Afectadas': action.affectedAreas.join(', '),
        'Descripción': action.description,
    }));
    const wsDetails = XLSX.utils.json_to_sheet(detailsData);
    XLSX.utils.book_append_sheet(wb, wsDetails, "Detalles Acciones");

    XLSX.writeFile(wb, "Export_Todas_Acciones.xlsx");
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Acciones de Mejora</CardTitle>
            <CardDescription>
              Aquí puedes encontrar todas las acciones de mejora. Usa los filtros para acotar tu búsqueda.
            </CardDescription>
          </div>
           <Button variant="outline" onClick={handleExportAll}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Todo
            </Button>
        </CardHeader>
        <CardContent>
          <ActionsTable actions={actions} />
        </CardContent>
      </Card>
      <FloatingActionButton />
    </>
  )
}
