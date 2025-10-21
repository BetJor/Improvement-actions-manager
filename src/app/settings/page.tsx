
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MasterDataManager } from "@/components/master-data-manager";
import {
    getCategories,
    getSubcategories,
    getAffectedAreas,
    addMasterDataItem,
    updateMasterDataItem,
    deleteMasterDataItem,
    getActionTypes,
    getResponsibilityRoles,
    getUserById,
} from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { MasterDataItem, ActionCategory, ResponsibilityRole, ImprovementActionType, ActionSubcategory } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HierarchicalSettings } from "@/components/hierarchical-settings";

export default function SettingsPage() {
    const { toast } = useToast();
    const { user, isAdmin } = useAuth();
    const [masterData, setMasterData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("hierarchy");
    const [userRoles, setUserRoles] = useState<string[]>([]);
    
    const canManage = (item: ImprovementActionType | ActionCategory | ActionSubcategory | null, type: 'ambit' | 'origen' | 'classificacio'): boolean => {
        if (!item || isAdmin) return true;

        if (type === 'ambit') {
            const ambit = item as ImprovementActionType;
            return !!ambit.configAdminRoleIds?.some(roleId => userRoles.includes(roleId));
        }
        if (type === 'origen') {
            const origen = item as ActionCategory;
            const relatedAmbits = masterData?.actionTypes.data.filter((at: ImprovementActionType) => at.id && origen.actionTypeIds?.includes(at.id));
            if (!relatedAmbits || relatedAmbits.length === 0) return false; // Orígenes sin ámbito no son editables por no-admins
            return relatedAmbits.every((ambit: ImprovementActionType) => canManage(ambit, 'ambit'));
        }
        if (type === 'classificacio') {
            const classificacio = item as ActionSubcategory;
            const parentOrigen = masterData?.categories.data.find((c: ActionCategory) => c.id === classificacio.categoryId);
            if (!parentOrigen) return false;
            return canManage(parentOrigen, 'origen');
        }
        return false;
    };


    const loadData = useCallback(async (currentTab?: string) => {
        setIsLoading(true);
        try {
            const [categories, subcategories, affectedAreas, actionTypes, responsibilityRoles] = await Promise.all([
                getCategories(),
                getSubcategories(),
                getAffectedAreas(),
                getActionTypes(),
                getResponsibilityRoles(),
            ]);

            const data = {
                actionTypes: { title: "Ámbitos", data: actionTypes, columns: [{ key: 'name', label: "Nombre" }] },
                categories: { title: "Orígenes", data: categories, columns: [{ key: 'name', label: "Origen" }, { key: 'actionTypeNames', label: 'Ámbitos Relacionados' }] },
                subcategories: { title: "Clasificaciones", data: subcategories, columns: [{ key: 'name', label: "Clasificación" }, { key: 'categoryName', label: "Origen" }] },
                affectedAreas: { title: "Áreas Afectadas", data: affectedAreas, columns: [{ key: 'name', label: "Nombre" }] },
                responsibilityRoles: { title: "Roles de Responsabilidad", data: responsibilityRoles, columns: [{ key: 'name', label: 'Nombre' }, { key: 'type', label: 'Tipo' }, { key: 'email', label: 'Email' }, { key: 'emailPattern', label: 'Patrón Email' }] }
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
    }, [toast]);

     useEffect(() => {
        if (user) {
            const fetchUserRoles = async () => {
                const fullUser = await getUserById(user.id);
                // In a real scenario, this would resolve user's groups into role IDs
                // For now, we assume a user's "role" is their email for pattern matching, etc.
                if(fullUser?.email) {
                    setUserRoles([fullUser.email]);
                }
            };
            fetchUserRoles();
        }
    }, [user]);
    
    useEffect(() => {
        if(!masterData) {
            loadData();
        }
    }, [loadData, masterData]);


    const handleSave = async (collectionName: string, item: MasterDataItem) => {
        try {
            const { id, ...dataToSave } = item as any;
            
            const propertiesToRemove = ['categoryName', 'creationRoleNames', 'analysisRoleNames', 'closureRoleNames', 'actionTypeNames'];
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
            await loadData(activeTab);
        } catch (error) {
            console.error(`Error saving item in ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error al guardar", description: "No se pudo guardar el elemento." });
        }
    };

    const handleDelete = async (collectionName: string, itemId: string) => {
        try {
            await deleteMasterDataItem(collectionName, itemId);
            toast({ title: "Elemento eliminado", description: "El elemento se ha eliminado correctamente." });
            await loadData(activeTab);
        } catch (error) {
            console.error(`Error deleting item from ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error al eliminar", description: "No se pudo eliminar el elemento." });
        }
    };

    const nonHierarchicalTabs = useMemo(() => {
        if (!masterData) return [];
        return Object.keys(masterData).filter(key => !['actionTypes', 'categories', 'subcategories'].includes(key));
    }, [masterData]);

    return (
        <div className="flex flex-col gap-4 h-full">
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground">
                Gestiona las tablas maestras de la aplicación, como ámbitos, orígenes, clasificaciones, etc.
            </p>
            {isLoading && !masterData ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : masterData ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                    <TabsList>
                        <TabsTrigger value="hierarchy">Ámbitos, Orígenes y Clasificaciones</TabsTrigger>
                        {nonHierarchicalTabs.map(key => (
                           <TabsTrigger key={key} value={key}>{masterData[key].title}</TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value="hierarchy" className="flex-grow mt-4">
                       <HierarchicalSettings
                          masterData={masterData}
                          onSave={handleSave}
                          onDelete={handleDelete}
                          canManage={canManage}
                       />
                    </TabsContent>
                    {nonHierarchicalTabs.map(key => (
                        <TabsContent key={key} value={key} className="mt-4">
                            <MasterDataManager 
                                data={{ [key]: masterData[key] }}
                                onSave={handleSave}
                                onDelete={handleDelete}
                                activeTab={key}
                                setActiveTab={() => {}}
                                isLoading={isLoading}
                                userIsAdmin={isAdmin}
                                userRoles={userRoles}
                            />
                        </TabsContent>
                    ))}
                </Tabs>

            ) : (
                <p>No se han podido cargar los datos.</p>
            )}
        </div>
    );
}

