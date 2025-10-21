

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MasterDataManager, MasterDataFormDialog } from "@/components/master-data-manager";
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
import { arrayMove } from "@dnd-kit/sortable";

export default function SettingsPage() {
    const { toast } = useToast();
    const { user, isAdmin } = useAuth();
    const [masterData, setMasterData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("hierarchy");
    const [userRoles, setUserRoles] = useState<string[]>([]);
    
    const canManage = useCallback((item: ImprovementActionType | ActionCategory | ActionSubcategory | null, type: 'ambit' | 'origin' | 'classification'): boolean => {
        if (isAdmin) return true;
        if (!item) return false;

        const findAmbit = (id: string): ImprovementActionType | undefined => masterData?.ambits.data.find((a: ImprovementActionType) => a.id === id);

        if (type === 'ambit') {
            const ambit = item as ImprovementActionType;
            if (!ambit.configAdminRoleIds || ambit.configAdminRoleIds.length === 0) return false;
            return ambit.configAdminRoleIds.some(roleId => userRoles.includes(roleId));
        }
        if (type === 'origin') {
            const origen = item as ActionCategory;
            if (!origen.actionTypeIds) return false;
            const relatedAmbits = origen.actionTypeIds.map(findAmbit).filter(Boolean);
            if (relatedAmbits.length === 0) return false;
            return relatedAmbits.every(ambit => canManage(ambit, 'ambit'));
        }
        if (type === 'classification') {
            const classificacio = item as ActionSubcategory;
            const parentOrigen = masterData?.origins.data.find((c: ActionCategory) => c.id === classificacio.categoryId);
            if (!parentOrigen) return false;
            return canManage(parentOrigen, 'origin');
        }
        return false;
    }, [isAdmin, userRoles, masterData]);


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
                ambits: { title: "Ámbitos", data: actionTypes, columns: [{ key: 'name', label: "Nombre" }] },
                origins: { title: "Orígenes", data: categories, columns: [{ key: 'name', label: "Origen" }, { key: 'actionTypeNames', label: 'Ámbitos Relacionados' }] },
                classifications: { title: "Clasificaciones", data: subcategories, columns: [{ key: 'name', label: "Clasificación" }, { key: 'categoryName', label: "Origen" }] },
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
            // This is a simplified role resolution. In a real app, this would be more complex,
            // potentially resolving group memberships into role IDs.
            // For now, we'll assume a user's roles can be derived from their email or a direct property.
            const fetchUserRoles = async () => {
                const fullUser = await getUserById(user.id);
                if(fullUser?.email) {
                    // Example: 'quality@example.com' could be a role.
                    // This logic would need to map to your ResponsibilityRole setup.
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

    const handleReorder = async (collectionName: string, activeId: string, overId: string) => {
        if (!masterData || !masterData[collectionName]) return;

        const itemsToReorder = masterData[collectionName].data;
        const oldIndex = itemsToReorder.findIndex((i: MasterDataItem) => i.id === activeId);
        const newIndex = itemsToReorder.findIndex((i: MasterDataItem) => i.id === overId);
        
        if (oldIndex === -1 || newIndex === -1) return;

        const reorderedItems = arrayMove(itemsToReorder, oldIndex, newIndex);

        // Optimistic UI Update
        setMasterData((prevData: any) => ({
            ...prevData,
            [collectionName]: {
                ...prevData[collectionName],
                data: reorderedItems.map((item, index) => ({...item, order: index})),
            }
        }));

        // Persist changes in the background
        try {
            const updates = reorderedItems.map((item, index) => {
                const newItem = { ...item, order: index };
                return updateMasterDataItem(collectionName, newItem.id!, { order: newItem.order });
            });
            await Promise.all(updates);
        } catch (error) {
            console.error("Failed to save reordered items:", error);
            toast({
                variant: "destructive",
                title: "Error al reordenar",
                description: "No se pudo guardar el nuevo orden. Por favor, recarga la página.",
            });
            // Revert optimistic update on failure by reloading data
            await loadData(activeTab);
        }
    };

    const nonHierarchicalTabs = useMemo(() => {
        if (!masterData) return [];
        return Object.keys(masterData).filter(key => !['ambits', 'origins', 'classifications'].includes(key));
    }, [masterData]);
    
    const filteredAmbits = useMemo(() => {
        if (isAdmin || !masterData?.ambits) return masterData?.ambits.data || [];
        return masterData.ambits.data.filter((ambit: ImprovementActionType) => canManage(ambit, 'ambit'));
    }, [isAdmin, masterData, canManage]);


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
                          masterData={{...masterData, ambits: {...masterData.ambits, data: filteredAmbits}}}
                          onSave={handleSave}
                          onDelete={handleDelete}
                          canManage={canManage}
                          onReorder={handleReorder}
                          isAdmin={isAdmin}
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
