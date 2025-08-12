
"use client";

import { useEffect, useState } from "react";
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

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [actionTypes, categories, subcategories, affectedAreas] = await Promise.all([
                getActionTypes(),
                getCategories(),
                getSubcategories(),
                getAffectedAreas(),
            ]);

            setMasterData({
                actionTypes: { title: t("tabs.actionTypes"), data: actionTypes, columns: [{ key: 'name', label: t('col.name') }] },
                categories: { title: t("tabs.categories"), data: categories, columns: [{ key: 'name', label: t('col.name') }] },
                subcategories: { 
                    title: t("tabs.subcategories"), 
                    data: subcategories.map(s => ({...s, categoryName: categories.find(c => c.id === s.categoryId)?.name || ''})), 
                    columns: [{ key: 'name', label: t('col.name') }, { key: 'categoryName', label: t('col.category') }] 
                },
                affectedAreas: { title: t("tabs.affectedAreas"), data: affectedAreas, columns: [{ key: 'name', label: t('col.name') }] },
            });
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
    };
    
    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (collectionName: string, item: MasterDataItem) => {
        try {
            const { id, ...dataToSave } = item;
            // Neteja categoryName abans de guardar
            if ('categoryName' in dataToSave) {
                delete dataToSave.categoryName;
            }

            if (id) {
                await updateMasterDataItem(collectionName, id, dataToSave);
                toast({ title: "Element actualitzat", description: "L'element s'ha actualitzat correctament." });
            } else {
                await addMasterDataItem(collectionName, dataToSave);
                toast({ title: "Element creat", description: "L'element s'ha creat correctament." });
            }
            await loadData(); // Refresh data
        } catch (error) {
            console.error(`Error saving item in ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error en desar", description: "No s'ha pogut desar l'element." });
        }
    };

    const handleDelete = async (collectionName: string, itemId: string) => {
        try {
            await deleteMasterDataItem(collectionName, itemId);
            toast({ title: "Element eliminat", description: "L'element s'ha eliminat correctament." });
            await loadData(); // Refresh data
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
            {isLoading ? (
                <p>Carregant dades mestres...</p>
            ) : masterData ? (
                <MasterDataManager 
                    data={masterData}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    t={t}
                />
            ) : (
                <p>No s'han pogut carregar les dades.</p>
            )}
        </div>
    );
}
