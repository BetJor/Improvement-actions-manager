

"use client"

import { useState, useMemo } from 'react';
import type { MasterDataItem, ImprovementActionType, ActionCategory, ActionSubcategory } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, GripVertical } from 'lucide-react';
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
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface SortableItemProps {
    item: MasterDataItem;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onEdit: (item: MasterDataItem) => void;
    onDelete: (item: MasterDataItem) => void;
    canManage: boolean;
}

const SortableItem = ({ item, selectedId, onSelect, onEdit, onDelete, canManage }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelect(item.id!)}
            className={cn(
                "group flex items-center justify-between p-3 cursor-pointer border-b text-sm",
                selectedId === item.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50"
            )}
        >
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 flex-1 truncate">
                            <button {...attributes} {...listeners} className={cn("cursor-grab p-1", !canManage && "cursor-not-allowed opacity-50")} disabled={!canManage}>
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <span className="truncate pr-2">{item.name}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{item.name}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
             <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(item); }} disabled={!canManage} className="h-7 w-7"><Pencil className="h-4 w-4"/></Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" disabled={!canManage} onClick={(e) => e.stopPropagation()} className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
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
};


interface HierarchicalSettingsProps {
    masterData: any;
    onSave: (collectionName: string, item: MasterDataItem) => Promise<void>;
    onDelete: (collectionName: string, itemId: string) => Promise<void>;
    canManage: (item: any, type: string) => boolean;
    onReorder: (collectionName: string, activeId: string, overId: string) => void;
}


interface ColumnProps {
    title: string;
    items: MasterDataItem[];
    selectedId: string | null;
    collectionName: string;
    onSelect: (id: string | null) => void;
    onAdd: () => void;
    onEdit: (item: MasterDataItem) => void;
    onDelete: (item: MasterDataItem) => void;
    onReorder: (collectionName: string, activeId: string, overId: string) => void;
    canManage: boolean;
}

const Column = ({ title, items, selectedId, collectionName, onSelect, onAdd, onEdit, onDelete, onReorder, canManage }: ColumnProps) => {
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            onReorder(collectionName, active.id as string, over.id as string);
        }
    };
    
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex-row items-center justify-between py-3 px-4 border-b">
                <h3 className="font-semibold text-base">{title}</h3>
                <Button size="icon" variant="ghost" onClick={onAdd} disabled={!canManage} className="h-7 w-7">
                    <PlusCircle className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map(i => i.id!)} strategy={verticalListSortingStrategy}>
                        {items.map(item => (
                            <SortableItem
                                key={item.id}
                                item={item}
                                selectedId={selectedId}
                                onSelect={onSelect}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                canManage={canManage}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                 {items.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No hay elementos.</p>}
            </CardContent>
        </Card>
    );
};

export function HierarchicalSettings({ masterData, onSave, onDelete, canManage, onReorder }: HierarchicalSettingsProps) {
    const [selectedAmbit, setSelectedAmbit] = useState<string | null>(null);
    const [selectedOrigen, setSelectedOrigen] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formConfig, setFormConfig] = useState<{
        collectionName: string;
        item: MasterDataItem | null;
        title: string;
        parentItemId?: string;
    } | null>(null);


    const ambits = useMemo(() => [...masterData.ambits.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name)), [masterData.ambits.data]);
    
    const filteredOrigenes = useMemo(() => {
        if (!selectedAmbit) return [];
        return [...masterData.origins.data]
            .filter((origen: ActionCategory) => origen.actionTypeIds?.includes(selectedAmbit))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    }, [selectedAmbit, masterData.origins.data]);

    const filteredClassificacions = useMemo(() => {
        if (!selectedOrigen) return [];
        return [...masterData.classifications.data]
            .filter((classificacio: ActionSubcategory) => classificacio.categoryId === selectedOrigen)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    }, [selectedOrigen, masterData.classifications.data]);

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
            if (collectionName === 'ambits' && item.id === selectedAmbit) {
                handleSelectAmbit(null);
            }
            if (collectionName === 'origins' && item.id === selectedOrigen) {
                handleSelectOrigen(null);
            }
        }
    };
    
    const getFormExtraData = () => {
        if (!formConfig) return {};
        switch (formConfig.collectionName) {
            case 'origins': return { actionTypes: masterData.ambits.data, parentItemId: formConfig.parentItemId };
            case 'classifications': return { categories: masterData.origins.data, parentItemId: formConfig.parentItemId };
            default: return {};
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <Column 
                title="Ámbitos" 
                items={ambits}
                selectedId={selectedAmbit}
                collectionName="ambits"
                onSelect={handleSelectAmbit}
                onAdd={() => handleAdd('ambits', 'Ámbito')}
                onEdit={(item) => handleEdit('ambits', item, 'Ámbito')}
                onDelete={(item) => handleDelete('ambits', item)}
                onReorder={onReorder}
                canManage={canManage(null, 'ambit')}
            />
            <Column 
                title="Orígenes" 
                items={filteredOrigenes}
                selectedId={selectedOrigen}
                collectionName="origins"
                onSelect={handleSelectOrigen}
                onAdd={() => selectedAmbit && handleAdd('origins', 'Origen', selectedAmbit)}
                onEdit={(item) => handleEdit('origins', item, 'Origen')}
                onDelete={(item) => handleDelete('origins', item)}
                onReorder={onReorder}
                canManage={!!selectedAmbit && canManage(ambits.find(a => a.id === selectedAmbit) || null, 'ambit')}
            />
            <Column 
                title="Clasificaciones" 
                items={filteredClassificacions}
                selectedId={null} // No selection state needed for the last column
                collectionName="classifications"
                onSelect={() => {}}
                onAdd={() => selectedOrigen && handleAdd('classifications', 'Clasificación', selectedOrigen)}
                onEdit={(item) => handleEdit('classifications', item, 'Clasificación')}
                onDelete={(item) => handleDelete('classifications', item)}
                onReorder={onReorder}
                canManage={!!selectedOrigen && canManage(filteredOrigenes.find(o => o.id === selectedOrigen) || null, 'origin')}
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
