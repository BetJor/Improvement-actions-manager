
"use client";

import { useState } from "react";
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
import { Loader2, RefreshCw, List, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface DebugInfo {
    allPotentialGroups: string[];
    foundGroups: string[];
}

export default function MyGroupsPage() {
  const { user, userGroups, loading: authLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isDebugLoading, setIsDebugLoading] = useState(false);
  const { toast } = useToast();

  const handleDebug = async () => {
    if (!user?.email) {
        toast({ title: "Error", description: "No se ha encontrado el email del usuario.", variant: "destructive" });
        return;
    }
    setIsDebugLoading(true);
    setDebugInfo(null);
    try {
        const response = await fetch('/api/debug-user-claims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ha ocurrido un error en el servidor.');
        }
        setDebugInfo(data);
        toast({ title: "Depuración completada", description: `Se han encontrado ${data.foundGroups.length} grupos de ${data.allPotentialGroups.length} posibles.` });
    } catch (error: any) {
        toast({ title: "Error en la depuración", description: error.message, variant: "destructive" });
    } finally {
        setIsDebugLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Mis Grupos</CardTitle>
                <CardDescription>Estos son los grupos de responsabilidad a los que perteneces, según tu sesión actual.</CardDescription>
            </div>
            <Button onClick={handleDebug} disabled={isDebugLoading}>
                {isDebugLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Actualizar y Depurar Permisos
            </Button>
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
                {authLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Cargando tus grupos...</span>
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
                      No se han detectado grupos para tu usuario en esta sesión.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isDebugLoading && (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-4 text-muted-foreground">Consultando a Google Workspace...</span>
            </div>
        )}

        {debugInfo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Grupos a Verificar ({debugInfo.allPotentialGroups.length})</CardTitle>
                        <CardDescription>Esta es la lista completa de grupos que el sistema ha recopilado de Firestore para comprobar.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {debugInfo.allPotentialGroups.map(group => <li key={group} className="break-all">{group}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5"/> Grupos Detectats per a Tu ({debugInfo.foundGroups.length})</CardTitle>
                        <CardDescription>De la llista anterior, Google ha confirmat que ets membre d'aquests grups.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        {debugInfo.foundGroups.length > 0 ? (
                             <ul className="list-disc pl-5 space-y-1 text-sm">
                                {debugInfo.foundGroups.map(group => <li key={group} className="break-all">{group}</li>)}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground p-8">No se t'ha trobat a cap dels grups a verificar.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  )
}
