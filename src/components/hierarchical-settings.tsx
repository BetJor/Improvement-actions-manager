
"use client"

import { useState, useMemo } from 'react';
import type { MasterDataItem, ImprovementActionType, ActionCategory, ActionSubcategory } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MasterDataFormDialog } from './master-data-manager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface HierarchicalSettingsProps {
    masterData: {
        actionTypes: { data: ImprovementActionType[] };
        categories: { data: ActionCategory[] };
        subcategories: { data: ActionSubcategory[] };
        [key: string]: any;
    };
    onSave: (collectionName: string, item: MasterDataItem) => Promise<void>;
    onDelete: (collectionName: string, itemId: string) => Promise<void>;
    canManage: (item: MasterDataItem | null, type: 'ambit' | 'origen' | 'classificacio') => boolean;
}

const Column = ({ title, items, selectedId, onSelect, onAdd, onEdit, onDelete, canManage }: { 
    title: string; 
    items: MasterDataItem[]; 
    selectedId: string | null; 
    onSelect: (id: string | null) => void;
    onAdd: () => void;
    onEdit: (item: MasterDataItem) => void;
    onDelete: (item: MasterDataItem) => void;
    canManage: boolean;
}) => (
    <Card className="flex flex-col h-full">
        <CardHeader className="flex-row items-center justify-between py-3 px-4 border-b">
            <h3 className="font-semibold text-base">{title}</h3>
            <Button size="icon" variant="ghost" onClick={onAdd} disabled={!canManage} className="h-7 w-7">
                <PlusCircle className="h-5 w-5" />
            </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto">
            {items.map(item => {
                const userCanManage = canManage;
                return (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item.id!)}
                        className={cn(
                            "group flex items-center justify-between p-3 cursor-pointer border-b text-sm",
                            selectedId === item.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
                        )}
                    >
                        <span className="truncate pr-2">{item.name}</span>
                         <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(item); }} disabled={!userCanManage} className="h-7 w-7"><Pencil className="h-4 w-4"/></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" disabled={!userCanManage} onClick={(e) => e.stopPropagation()} className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>Esta acción no se puede deshacer y eliminará permanentemente el elemento.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(item); }}>Continuar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                );
            })}
             {items.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No hay elementos.</p>}
        </CardContent>
    </Card>
);

export function HierarchicalSettings({ masterData, onSave, onDelete, canManage }: HierarchicalSettingsProps) {
    const [selectedAmbit, setSelectedAmbit] = useState<string | null>(null);
    const [selectedOrigen, setSelectedOrigen] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formConfig, setFormConfig] = useState<{
        collectionName: string;
        item: MasterDataItem | null;
        title: string;
        parentItemId?: string;
    } | null>(null);


    const filteredOrigenes = useMemo(() => {
        if (!selectedAmbit) return [];
        return masterData.categories.data.filter(origen => origen.actionTypeIds?.includes(selectedAmbit));
    }, [selectedAmbit, masterData.categories.data]);

    const filteredClassificacions = useMemo(() => {
        if (!selectedOrigen) return [];
        return masterData.subcategories.data.filter(classificacio => classificacio.categoryId === selectedOrigen);
    }, [selectedOrigen, masterData.subcategories.data]);

    // When the selected ambit changes, reset the origen and classificacio selection
    const handleSelectAmbit = (id: string | null) => {
        setSelectedAmbit(id);
        setSelectedOrigen(null);
    }
    
    // When the selected origen changes, reset the classificacio selection
    const handleSelectOrigen = (id: string | null) => {
        setSelectedOrigen(id);
    }

    const handleAdd = (collectionName: string, title: string, parentItemId?: string) => {
        setFormConfig({ collectionName, item: null, title, parentItemId });
        setIsFormOpen(true);
    };

    const handleEdit = (collectionName: string, item: MasterDataItem, title: string) => {
        setFormConfig({ collectionName, item, title });
        setIsFormOpen(true);
    };

    const handleDelete = async (collectionName: string, item: MasterDataItem) => {
        if (item.id) {
            await onDelete(collectionName, item.id);
            // Reset selections if the deleted item was selected
            if (collectionName === 'actionTypes' && item.id === selectedAmbit) {
                handleSelectAmbit(null);
            }
            if (collectionName === 'categories' && item.id === selectedOrigen) {
                handleSelectOrigen(null);
            }
        }
    };
    
    const getFormExtraData = () => {
        if (!formConfig) return {};
        switch (formConfig.collectionName) {
            case 'categories': return { actionTypes: masterData.actionTypes.data, parentItemId: formConfig.parentItemId };
            case 'subcategories': return { categories: masterData.categories.data, parentItemId: formConfig.parentItemId };
            default: return {};
        }
    };

    const ambits = masterData.actionTypes.data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <Column 
                title="Ámbitos" 
                items={ambits}
                selectedId={selectedAmbit}
                onSelect={handleSelectAmbit}
                onAdd={() => handleAdd('actionTypes', 'Ámbito')}
                onEdit={(item) => handleEdit('actionTypes', item, 'Ámbito')}
                onDelete={(item) => handleDelete('actionTypes', item)}
                canManage={canManage(null, 'ambit')}
            />
            <Column 
                title="Orígenes" 
                items={filteredOrigenes}
                selectedId={selectedOrigen}
                onSelect={handleSelectOrigen}
                onAdd={() => selectedAmbit && handleAdd('categories', 'Origen', selectedAmbit)}
                onEdit={(item) => handleEdit('categories', item, 'Origen')}
                onDelete={(item) => handleDelete('categories', item)}
                canManage={!!selectedAmbit && canManage(ambits.find(a => a.id === selectedAmbit) || null, 'ambit')}
            />
            <Column 
                title="Clasificaciones" 
                items={filteredClassificacions}
                selectedId={null} // No selection state needed for the last column
                onSelect={() => {}}
                onAdd={() => selectedOrigen && handleAdd('subcategories', 'Clasificación', selectedOrigen)}
                onEdit={(item) => handleEdit('subcategories', item, 'Clasificación')}
                onDelete={(item) => handleDelete('subcategories', item)}
                canManage={!!selectedOrigen && canManage(filteredOrigenes.find(o => o.id === selectedOrigen) || null, 'origen')}
            />

            {formConfig && isFormOpen && (
                <MasterDataFormDialog
                    isOpen={isFormOpen}
                    setIsOpen={setIsFormOpen}
                    item={formConfig.item}
                    collectionName={formConfig.collectionName}
                    title={formConfig.title}
                    onSave={onSave}
                    extraData={getFormExtraData()}
                />
            )}
        </div>
    );
}

