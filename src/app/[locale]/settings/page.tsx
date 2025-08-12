
"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MasterDataManager } from "@/components/master-data-manager";
import {
    getActionTypes,
    getCategories,
    getSubcategories,
    getAffectedAreas,
    addMasterDataItem,
    updateMasterDataItem,
    deleteMasterDataItem,
} from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { MasterDataItem } from "@/lib/types";

export default function SettingsPage() {
    const t = useTranslations("SettingsPage");
    const { toast } = useToast();
    const [masterData, setMasterData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("");

    const loadData = useCallback(async (currentTab?: string) => {
        setIsLoading(true);
        try {
            const [actionTypes, categories, subcategories, affectedAreas] = await Promise.all([
                getActionTypes(),
                getCategories(),
                getSubcategories(),
                getAffectedAreas(),
            ]);

            const subcategoriesWithCategoryName = subcategories.map(s => ({
              ...s, 
              categoryName: categories.find(c => c.id === s.categoryId)?.name || ''
            }));
            
            // Sort by categoryName, then by subcategory name
            subcategoriesWithCategoryName.sort((a, b) => {
              if (a.categoryName < b.categoryName) return -1;
              if (a.categoryName > b.categoryName) return 1;
              if (a.name < b.name) return -1;
              if (a.name > b.name) return 1;
              return 0;
            });


            const data = {
                actionTypes: { title: t("tabs.actionTypes"), data: actionTypes, columns: [{ key: 'name', label: t('col.name') }] },
                categories: { title: t("tabs.categories"), data: categories, columns: [{ key: 'name', label: t('col.name') }] },
                subcategories: { 
                    title: t("tabs.subcategories"), 
                    data: subcategoriesWithCategoryName, 
                    columns: [{ key: 'name', label: t('col.name') }, { key: 'categoryName', label: t('col.category') }] 
                },
                affectedAreas: { title: t("tabs.affectedAreas"), data: affectedAreas, columns: [{ key: 'name', label: t('col.name') }] },
                responsibilityRoles: { title: t("tabs.responsibilityRoles"), data: [], columns: [{ key: 'name', label: t('col.name') }] },
            };
            setMasterData(data);
            
            if (!activeTab && Object.keys(data).length > 0) {
              setActiveTab(Object.keys(data)[0]);
            } else if (currentTab) {
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
    }, [activeTab, toast, t]);
    
    useEffect(() => {
        if(!masterData) {
            loadData();
        }
    }, [loadData, masterData]);


    const handleSave = async (collectionName: string, item: MasterDataItem) => {
        try {
            const { id, ...dataToSave } = item;
            if ('categoryName' in dataToSave) {
                delete (dataToSave as any).categoryName;
            }

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
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">
                {t("description")}
            </p>
            {isLoading && !masterData ? (
                <p>Carregant dades mestres...</p>
            ) : masterData ? (
                <MasterDataManager 
                    data={masterData}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    t={t}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isLoading={isLoading}
                />
            ) : (
                <p>No s'han pogut carregar les dades.</p>
            )}
        </div>
    );
}
