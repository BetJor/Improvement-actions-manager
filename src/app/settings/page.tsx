

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
import { MasterDataTable, MasterDataFormDialog } from "@/components/master-data-manager";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function SettingsPage() {
    const { toast } = useToast();
    const { user, isAdmin, userRoles } = useAuth();
    const [masterData, setMasterData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("codificacion");
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formConfig, setFormConfig] = useState<{
        collectionName: string;
        item: MasterDataItem | null;
        title: string;
    } | null>(null);

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
                ambits: { data: actionTypes }, // Used by HierarchicalSettings
                origins: { data: categories },
                classifications: { data: subcategories },
                workflow: { 
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
            const { id, ...dataToSave } = item as any;
            
            const propertiesToRemove = ['categoryName', 'creationRoleNames', 'analysisRoleNames', 'closureRoleNames', 'actionTypeNames', 'configAdminRoleNames'];
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
            await loadData(activeTab);
        }
    };
    
    const filteredAmbitsForHierarchy = useMemo(() => {
        if (isAdmin || !masterData?.ambits) return masterData?.ambits.data || [];
        return masterData.ambits.data.filter((ambit: ImprovementActionType) => canManage(ambit, 'ambit'));
    }, [isAdmin, masterData, canManage]);


    const handleAddNew = () => {
        let title = '';
        let collection = activeTab === 'workflow' ? 'ambits' : activeTab;
        
        const tabInfo = masterData[collection];
        if (tabInfo && tabInfo.title) {
          const singularTitle = tabInfo.title.endsWith('es') ? tabInfo.title.slice(0, -2) : (tabInfo.title.endsWith('s') ? tabInfo.title.slice(0, -1) : tabInfo.title);
          title = singularTitle;
        }

        setFormConfig({ collectionName: collection, item: null, title: title });
        setIsFormOpen(true);
    };

    const handleEdit = (item: MasterDataItem) => {
        let title = '';
        let collection = activeTab === 'workflow' ? 'ambits' : activeTab;
        const tabInfo = masterData[collection];
        if (tabInfo && tabInfo.title) {
          const singularTitle = tabInfo.title.endsWith('es') ? tabInfo.title.slice(0, -2) : (tabInfo.title.endsWith('s') ? tabInfo.title.slice(0, -1) : tabInfo.title);
          title = singularTitle;
        }
        setFormConfig({ collectionName: collection, item: item, title: title });
        setIsFormOpen(true);
    };

    const canAddItem = useMemo(() => {
        if (activeTab === 'workflow') return false; // Non-admins cannot create new ambits from workflow.
        if (activeTab === 'responsibilityRoles' && !isAdmin) return false;
        return true;
    }, [isAdmin, activeTab]);

    const canEditItem = useCallback((item: MasterDataItem) => {
        if (isAdmin) return true;
        if (activeTab === 'workflow') {
            const ambit = item as ImprovementActionType;
            if (!ambit.configAdminRoleIds || ambit.configAdminRoleIds.length === 0) return false;
            return ambit.configAdminRoleIds.some(roleId => userRoles.includes(roleId));
        }
        if (activeTab === 'responsibilityRoles') return false; // Only admin can edit roles
        return true;
    }, [isAdmin, userRoles, activeTab]);


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
                <>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                    <TabsList>
                        <TabsTrigger value="codificacion">Codificación</TabsTrigger>
                        <TabsTrigger value="workflow">Workflow</TabsTrigger>
                        {isAdmin && <TabsTrigger value="responsibilityRoles">Roles de Responsabilidad</TabsTrigger>}
                    </TabsList>
                    
                    <TabsContent value="codificacion" className="flex-grow mt-4">
                       <HierarchicalSettings
                          masterData={{
                              ambits: { ...masterData.ambits, data: filteredAmbitsForHierarchy },
                              origins: masterData.origins,
                              classifications: masterData.classifications
                          }}
                          onSave={(collection, item) => handleSave(collection, item)}
                          onDelete={(collection, id) => handleDelete(collection, id)}
                          canManage={canManage}
                          onReorder={(collection, activeId, overId) => handleReorder(collection, activeId, overId)}
                          isAdmin={isAdmin}
                       />
                    </TabsContent>

                    <TabsContent value="workflow" className="flex-grow mt-4">
                         <MasterDataTable
                            data={masterData.workflow?.data || []}
                            columns={masterData.workflow?.columns || []}
                            onEdit={handleEdit}
                            onDelete={(item) => handleDelete('ambits', item.id!)}
                            isLoading={isLoading}
                            canEdit={canEditItem}
                            canDelete={false} // Disable delete in workflow view
                         />
                    </TabsContent>
                    
                    {isAdmin && (
                        <TabsContent value="responsibilityRoles" className="flex-grow mt-4">
                            <div className="flex justify-end mb-4">
                            <Button onClick={handleAddNew} disabled={!canAddItem}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Rol
                                </Button>
                            </div>
                            <MasterDataTable
                                data={masterData.responsibilityRoles?.data || []}
                                columns={masterData.responsibilityRoles?.columns || []}
                                onEdit={handleEdit}
                                onDelete={(item) => handleDelete('responsibilityRoles', item.id!)}
                                isLoading={isLoading}
                                canEdit={canEditItem}
                            />
                        </TabsContent>
                    )}

                </Tabs>
                 {formConfig && isFormOpen && (
                    <MasterDataFormDialog
                        isOpen={isFormOpen}
                        setIsOpen={setIsFormOpen}
                        item={formConfig.item}
                        collectionName={formConfig.collectionName}
                        title={formConfig.title}
                        onSave={handleSave}
                        extraData={{
                            categories: masterData.origins?.data,
                            actionTypes: masterData.ambits?.data,
                            responsibilityRoles: masterData.responsibilityRoles?.data,
                        }}
                        userIsAdmin={isAdmin}
                    />
                 )}
                </>
            ) : (
                <p>No se han podido cargar los datos.</p>
            )}
        </div>
    );
}
