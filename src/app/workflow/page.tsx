

"use client";

import { useEffect, useState, useCallback } from "react";
import { getActionTypes, getResponsibilityRoles, updateMasterDataItem } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { ImprovementActionType, ResponsibilityRole } from "@/lib/types";
import { Loader2, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MasterDataFormDialog } from "@/components/master-data-manager";

export default function WorkflowPage() {
    const { toast } = useToast();
    const { isAdmin } = useAuth();
    const [ambits, setAmbits] = useState<ImprovementActionType[]>([]);
    const [roles, setRoles] = useState<ResponsibilityRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAmbit, setEditingAmbit] = useState<ImprovementActionType | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedAmbits, fetchedRoles] = await Promise.all([
                getActionTypes(),
                getResponsibilityRoles(),
            ]);
            setAmbits(fetchedAmbits);
            setRoles(fetchedRoles);
        } catch (error) {
            console.error("Failed to load workflow data:", error);
            toast({
                variant: "destructive",
                title: "Error de carga",
                description: "No se han podido cargar los datos para la gestión del workflow.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEdit = (ambit: ImprovementActionType) => {
        setEditingAmbit(ambit);
        setIsFormOpen(true);
    };

    const handleSave = async (collectionName: string, item: any) => {
        try {
            const { id, ...dataToSave } = item;
            if (!id) throw new Error("Item ID is missing");
            await updateMasterDataItem(collectionName, id, dataToSave);
            toast({ title: "Permisos actualizados", description: "Los permisos para el ámbito se han guardado correctamente." });
            setIsFormOpen(false);
            await loadData(); // Recargar datos para mostrar cambios
        } catch (error) {
            console.error("Error saving permissions:", error);
            toast({ variant: "destructive", title: "Error al guardar", description: "No se pudieron guardar los permisos." });
        }
    };
    
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Gestión del Workflow</h1>
            <p className="text-muted-foreground">
                Asigna roles con permiso para administrar la configuración (orígenes, clasificaciones) de cada ámbito.
            </p>
            <Card>
                <CardHeader>
                    <CardTitle>Permisos de Configuración por Ámbito</CardTitle>
                    <CardDescription>
                       Desde aquí puedes definir qué roles pueden editar los orígenes y clasificaciones asociados a cada ámbito en la pantalla de Configuración.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ámbito</TableHead>
                                        <TableHead>Admins de Configuración</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ambits.map(ambit => (
                                        <TableRow key={ambit.id}>
                                            <TableCell className="font-medium">{ambit.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {(ambit.configAdminRoleIds || [])
                                                    .map(roleId => roles.find(r => r.id === roleId)?.name)
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(ambit)} disabled={!isAdmin}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isFormOpen && editingAmbit && (
                <MasterDataFormDialog
                    isOpen={isFormOpen}
                    setIsOpen={setIsFormOpen}
                    item={editingAmbit}
                    collectionName="ambits"
                    title={`Permisos de '${editingAmbit.name}'`}
                    onSave={handleSave}
                    extraData={{ responsibilityRoles: roles }}
                    isPermissionDialog={true} // Prop to indicate special mode
                />
            )}
        </div>
    );
}
