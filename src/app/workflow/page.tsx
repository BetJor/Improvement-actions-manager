

"use client";

import { useEffect, useState, useCallback } from "react";
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

            const actionTypesWithRoleNames = actionTypes.map(at => ({
                ...at,
                configAdminRoleNames: (at.configAdminRoleIds || [])
                    .map(roleId => responsibilityRoles.find(r => r.id === roleId)?.name || roleId)
                    .join(', '),
            }));

            const data = {
                ambits: { 
                    title: "Àmbits", 
                    data: actionTypesWithRoleNames, 
                    columns: [
                        { key: 'name', label: "Nom" },
                        { key: 'configAdminRoleNames', label: "Admins de Configuració" }
                    ] 
                },
                responsibilityRoles: { 
                    title: "Rols de Responsabilitat", 
                    data: responsibilityRoles, 
                    columns: [
                        { key: 'name', label: 'Nom' },
                        { key: 'type', label: 'Tipus' },
                        { key: 'email', label: 'Email' },
                        { key: 'emailPattern', label: 'Patró Email' },
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
                title: "Error de càrrega",
                description: "No s'han pogut carregar les dades mestres.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        if(!masterData) {
            loadData();
        }
    }, [loadData, masterData]);


    const handleSave = async (collectionName: string, item: MasterDataItem) => {
        try {
            const { id, ...dataToSave } = item as any;
            
            // Neteja de camps auxiliars abans de desar
            const propertiesToRemove = ['configAdminRoleNames'];
            propertiesToRemove.forEach(prop => {
                if (prop in dataToSave) {
                    delete dataToSave[prop];
                }
            });

            if (id) {
                await updateMasterDataItem(collectionName, id, dataToSave);
                toast({ title: "Element actualitzat", description: "L'element s'ha actualitzat correctament." });
            } else {
                await addMasterDataItem(collectionName, dataToSave);
                toast({ title: "Element creat", description: "L'element s'ha creat correctament." });
            }
            await loadData(collectionName);
        } catch (error) {
            console.error(`Error saving item in ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error en desar", description: "No s'ha pogut desar l'element." });
        }
    };

    const handleDelete = async (collectionName: string, itemId: string) => {
        try {
            await deleteMasterDataItem(collectionName, itemId);
            toast({ title: "Element eliminat", description: "L'element s'ha eliminat correctament." });
            await loadData(collectionName);
        } catch (error) {
            console.error(`Error deleting item from ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error en eliminar", description: "No s'ha pogut eliminar l'element." });
        }
    };


    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Gestió del Workflow</h1>
            <p className="text-muted-foreground">
                Defineix els rols de responsabilitat i assigna quins d'aquests rols poden configurar cada àmbit.
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
                <p>No s'han pogut carregar les dades.</p>
            )}
        </div>
    );
}

