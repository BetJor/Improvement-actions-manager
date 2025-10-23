

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { HierarchicalSettings } from "@/components/hierarchical-settings";
import {
    getCategories,
    getSubcategories,
    addMasterDataItem,
    updateMasterDataItem,
    deleteMasterDataItem,
    getActionTypes,
    getResponsibilityRoles,
} from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { MasterDataItem, ActionCategory, ResponsibilityRole, ImprovementActionType, ActionSubcategory } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { arrayMove } from "@dnd-kit/sortable";
import { MasterDataManager } from "@/components/master-data-manager";

export default function SettingsPage() {
    const { toast } = useToast();
    const { user, isAdmin, userRoles } = useAuth();
    const [masterData, setMasterData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("codificacion");
    
    const canManage = useCallback((item: ImprovementActionType | ActionCategory | null, type: 'ambit' | 'origin' | 'classification'): boolean => {
        if (isAdmin) return true;
        if (!item || !userRoles) return false;

        const findAmbit = (id: string): ImprovementActionType | undefined => masterData?.ambits.data.find((a: ImprovementActionType) => a.id === id);

        if (type === 'ambit') {
            const ambit = item as ImprovementActionType;
            if (!ambit.configAdminRoleIds || ambit.configAdminRoleIds.length === 0) return false;
            // Un usuari pot gestionar si algun dels seus rols té permís
            return ambit.configAdminRoleIds.some(roleId => userRoles.includes(roleId));
        }
        if (type === 'origin') {
            const origen = item as ActionCategory;
            if (!origen.actionTypeIds) return false;
            const relatedAmbits = origen.actionTypeIds.map(findAmbit).filter(Boolean);
            if (relatedAmbits.length === 0) return false;
            // Només pot gestionar si pot gestionar TOTS els àmbits pares
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
            const [categories, subcategories, actionTypes, responsibilityRoles] = await Promise.all([
                getCategories(),
                getSubcategories(),
                getActionTypes(),
                getResponsibilityRoles(),
            ]);
            
            const getRoleNames = (roleIds: string[] | undefined) => {
                if (!roleIds) return '';
                return roleIds
                    .map(roleId => responsibilityRoles.find(r => r.id === roleId)?.name)
                    .filter(Boolean)
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

            const data: any = {
                // For Codificacion Tab
                ambits_codificacion: { title: "Ámbitos", data: actionTypes },
                origins: { title: "Orígenes", data: categories },
                classifications: { title: "Clasificaciones", data: subcategories },
                
                // For Workflow Tab
                ambits_workflow: { 
                    title: "Workflow", 
                    data: filteredActionTypes, 
                    columns: [
                        { key: 'name', label: "Ámbito" },
                        { key: 'configAdminRoleNames', label: "Admins de Configuración" },
                        { key: 'creationRoleNames', label: "Roles Creación" },
                        { key: 'analysisRoleNames', label: "Roles Análisis" },
                        { key: 'closureRoleNames', label: "Roles Cierre" },
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
            const actualCollectionName = collectionName.replace('_codificacion', '').replace('_workflow', '');
            const { id, ...dataToSave } = item as any;
            
            const propertiesToRemove = ['categoryName', 'creationRoleNames', 'analysisRoleNames', 'closureRoleNames', 'actionTypeNames', 'configAdminRoleNames'];
            propertiesToRemove.forEach(prop => {
                if (prop in dataToSave) {
                    delete dataToSave[prop];
                }
            });

            if (id) {
                await updateMasterDataItem(actualCollectionName, id, dataToSave);
                toast({ title: "Elemento actualizado", description: "El elemento se ha actualizado correctamente." });
            } else {
                await addMasterDataItem(actualCollectionName, dataToSave);
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
            const actualCollectionName = collectionName.replace('_codificacion', '').replace('_workflow', '');
            await deleteMasterDataItem(actualCollectionName, itemId);
            toast({ title: "Elemento eliminado", description: "El elemento se ha eliminado correctamente." });
            await loadData(activeTab);
        } catch (error) {
            console.error(`Error deleting item from ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error al eliminar", description: "No se pudo eliminar el elemento." });
        }
    };

    const handleReorder = async (collectionName: string, activeId: string, overId: string) => {
        if (!masterData || !masterData[collectionName]) return;
        const actualCollectionName = collectionName.replace('_codificacion', '').replace('_workflow', '');

        const itemsToReorder = masterData[collectionName].data;
        const oldIndex = itemsToReorder.findIndex((i: MasterDataItem) => i.id === activeId);
        const newIndex = itemsToReorder.findIndex((i: MasterDataItem) => i.id === overId);
        
        if (oldIndex === -1 || newIndex === -1) return;

        const reorderedItems = arrayMove(itemsToReorder, oldIndex, newIndex);

        setMasterData((prevData: any) => ({
            ...prevData,
            [collectionName]: {
                ...prevData[collectionName],
                data: reorderedItems.map((item, index) => ({...item, order: index})),
            }
        }));

        try {
            const updates = reorderedItems.map((item, index) => {
                const newItem = { ...item, order: index };
                return updateMasterDataItem(actualCollectionName, newItem.id!, { order: newItem.order });
            });
            await Promise.all(updates);
        } catch (error) {
            console.error("Failed to save reordered items:", error);
            toast({
                variant: "destructive",
                title: "Error al reordenar",
                description: "No se pudo guardar el nuevo orden. Por favor, recarga la página.",
            });
            await loadData(activeTab);
        }
    };
    
    const filteredAmbitsForHierarchy = useMemo(() => {
        if (isAdmin || !masterData?.ambits_codificacion) return masterData?.ambits_codificacion.data || [];
        return masterData.ambits_codificacion.data.filter((ambit: ImprovementActionType) => canManage(ambit, 'ambit'));
    }, [isAdmin, masterData, canManage]);


    return (
        <div className="flex flex-col gap-4 h-full">
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground">
                Gestiona las tablas maestras y el workflow de la aplicación.
            </p>
            {isLoading && !masterData ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : masterData ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                    <TabsList>
                        <TabsTrigger value="codificacion">Codificación</TabsTrigger>
                        <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="codificacion" className="flex-grow mt-4">
                       <HierarchicalSettings
                          masterData={{
                              ambits: { ...masterData.ambits_codificacion, data: filteredAmbitsForHierarchy },
                              origins: masterData.origins,
                              classifications: masterData.classifications
                          }}
                          onSave={(collection, item) => handleSave(`${collection}_codificacion`, item)}
                          onDelete={(collection, id) => handleDelete(`${collection}_codificacion`, id)}
                          canManage={canManage}
                          onReorder={(collection, activeId, overId) => handleReorder(`${collection}_codificacion`, activeId, overId)}
                          isAdmin={isAdmin}
                       />
                    </TabsContent>
                    <TabsContent value="workflow" className="flex-grow mt-4">
                        <MasterDataManager 
                            data={{
                                ambits: masterData.ambits_workflow,
                                responsibilityRoles: masterData.responsibilityRoles
                            }}
                            onSave={(collection, item) => handleSave(collection, item)}
                            onDelete={(collection, id) => handleDelete(collection, id)}
                            activeTab="ambits"
                            setActiveTab={() => {}}
                            isLoading={isLoading}
                            userIsAdmin={isAdmin}
                            userRoles={userRoles}
                        />
                    </TabsContent>
                </Tabs>

            ) : (
                <p>No se han podido cargar los datos.</p>
            )}
        </div>
    );
}
