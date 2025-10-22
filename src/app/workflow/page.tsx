

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MasterDataManager } from "@/components/master-data-manager";
import {
    getActionTypes,
    addMasterDataItem,
    updateMasterDataItem,
    deleteMasterDataItem,
    getResponsibilityRoles,
} from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { MasterDataItem, ImprovementActionType, ResponsibilityRole } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function WorkflowPage() {
    const { toast } = useToast();
    const { isAdmin, userRoles } = useAuth();
    const [masterData, setMasterData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("ambits");

    const loadData = useCallback(async (currentTab?: string) => {
        setIsLoading(true);
        try {
            const [actionTypes, responsibilityRoles] = await Promise.all([
                getActionTypes(),
                getResponsibilityRoles(),
            ]);

            const getRoleNames = (roleIds: string[] | undefined) => {
                if (!roleIds) return '';
                return roleIds
                    .map(roleId => responsibilityRoles.find(r => r.id === roleId)?.name)
                    .filter(Boolean) // Filter out undefined names for deleted roles
                    .join(', ');
            };

            const actionTypesWithRoleNames = actionTypes.map(at => ({
                ...at,
                configAdminRoleNames: getRoleNames(at.configAdminRoleIds),
                creationRoleNames: getRoleNames(at.possibleCreationRoles),
                analysisRoleNames: getRoleNames(at.possibleAnalysisRoles),
                closureRoleNames: getRoleNames(at.possibleClosureRoles),
            }));
            
            const filteredActionTypes = isAdmin 
                ? actionTypesWithRoleNames
                : actionTypesWithRoleNames.filter(at => at.configAdminRoleIds?.some(roleId => userRoles.includes(roleId)));


            const data = {
                ambits: { 
                    title: "Ámbitos", 
                    data: filteredActionTypes, 
                    columns: [
                        { key: 'name', label: "Nombre" },
                        { key: 'configAdminRoleNames', label: "Admins de Configuración" },
                        { key: 'creationRoleNames', label: "Creación" },
                        { key: 'analysisRoleNames', label: "Análisis" },
                        { key: 'closureRoleNames', label: "Cierre" },
                        { key: 'analysisDueDays', label: "Dies Anàlisi" },
                        { key: 'implementationDueDays', label: "Dies Implant." },
                        { key: 'closureDueDays', label: "Dies Tanc." },
                    ] 
                },
                responsibilityRoles: { 
                    title: "Roles de Responsabilidad", 
                    data: responsibilityRoles, 
                    columns: [
                        { key: 'name', label: 'Nombre' },
                        { key: 'type', label: 'Tipo' },
                        { key: 'email', label: 'Email' },
                        { key: 'emailPattern', label: 'Patrón Email' },
                    ] 
                },
            };
            setMasterData(data);
            
            if (currentTab) {
                setActiveTab(currentTab);
            }

        } catch (error) {
            console.error("Failed to load master data:", error);
            toast({
                variant: "destructive",
                title: "Error de carga",
                description: "No se han podido cargar los datos maestros.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, isAdmin, userRoles]);
    
    useEffect(() => {
        if(!masterData) {
            loadData();
        }
    }, [loadData, masterData]);


    const handleSave = async (collectionName: string, item: MasterDataItem) => {
        try {
            const { id, ...dataToSave } = item as any;
            
            // Neteja de camps auxiliars abans de desar
            const propertiesToRemove = ['configAdminRoleNames', 'creationRoleNames', 'analysisRoleNames', 'closureRoleNames'];
            propertiesToRemove.forEach(prop => {
                if (prop in dataToSave) {
                    delete dataToSave[prop];
                }
            });

            if (id) {
                await updateMasterDataItem(collectionName, id, dataToSave);
                toast({ title: "Elemento actualizado", description: "El elemento se ha actualizado correctamente." });
            } else {
                await addMasterDataItem(collectionName, dataToSave);
                toast({ title: "Elemento creado", description: "El elemento se ha creado correctamente." });
            }
            await loadData(collectionName);
        } catch (error) {
            console.error(`Error saving item in ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error al guardar", description: "No se pudo guardar el elemento." });
        }
    };

    const handleDelete = async (collectionName: string, itemId: string) => {
        try {
            await deleteMasterDataItem(collectionName, itemId);
            toast({ title: "Elemento eliminado", description: "El elemento se ha eliminado correctamente." });
            await loadData(collectionName);
        } catch (error) {
            console.error(`Error deleting item from ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error al eliminar", description: "No se pudo eliminar el elemento." });
        }
    };


    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Gestión del Workflow</h1>
            <p className="text-muted-foreground">
                Define los roles de responsabilidad y asigna qué roles pueden configurar cada ámbito.
            </p>
            {isLoading && !masterData ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : masterData ? (
                <MasterDataManager 
                    data={masterData}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isLoading={isLoading}
                    userIsAdmin={isAdmin}
                    userRoles={userRoles}
                />
            ) : (
                <p>No se han podido cargar los datos.</p>
            )}
        </div>
    );
}
