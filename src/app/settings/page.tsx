

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
import type { MasterDataItem, ActionCategory, ResponsibilityRole, ImprovementActionType } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
    const { toast } = useToast();
    const { user, isAdmin } = useAuth();
    const [masterData, setMasterData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("");
    const [userRoles, setUserRoles] = useState<string[]>([]);

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

            const subcategoriesWithCategoryName = subcategories.map(s => ({
              ...s, 
              categoryName: categories.find(c => c.id === s.categoryId)?.name || ''
            }));
            
            subcategoriesWithCategoryName.sort((a, b) => {
              if (a.categoryName < b.categoryName) return -1;
              if (a.categoryName > b.categoryName) return 1;
              if (a.name < b.name) return -1;
              if (a.name > b.name) return 1;
              return 0;
            });

            const categoriesWithActionTypeNames = categories.map((c: ActionCategory) => ({
                ...c,
                actionTypeNames: (c.actionTypeIds || [])
                    .map(id => actionTypes.find(at => at.id === id)?.name || id)
                    .join(', ')
            }));


            const data = {
                actionTypes: { 
                    title: "Ámbitos", 
                    data: actionTypes, 
                    columns: [{ key: 'name', label: "Nombre" }] 
                },
                categories: { 
                    title: "Orígens", 
                    data: categoriesWithActionTypeNames, 
                    columns: [{ key: 'name', label: "Origen" }, { key: 'actionTypeNames', label: 'Ámbitos Relacionados' }] 
                },
                subcategories: { 
                    title: "Clasificaciones", 
                    data: subcategoriesWithCategoryName, 
                    columns: [{ key: 'name', label: "Clasificación" }, { key: 'categoryName', label: "Origen" }] 
                },
                affectedAreas: { 
                    title: "Áreas Afectadas", 
                    data: affectedAreas, 
                    columns: [{ key: 'name', label: "Nombre" }] 
                },
                responsibilityRoles: {
                    title: "Roles de Responsabilidad",
                    data: responsibilityRoles,
                    columns: [{ key: 'name', label: 'Nombre' }, { key: 'type', label: 'Tipo' }, { key: 'email', label: 'Email' }, { key: 'emailPattern', label: 'Patrón Email' }]
                }
            };
            setMasterData(data);
            
            if (!activeTab || !data[activeTab]) {
                setActiveTab(Object.keys(data)[0]);
            } else if (currentTab) {
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
    }, [activeTab, toast]);

     useEffect(() => {
        if (user) {
            const fetchUserRoles = async () => {
                const fullUser = await getUserById(user.id);
                // For simplicity, we assume roles are just the user's email for now.
                // A real implementation would check against ResponsibilityRoles of type 'User' or 'Group'.
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
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-muted-foreground">
                Aquí podrás gestionar las tablas maestras de la aplicación, como orígenes, clasificaciones, etc.
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

