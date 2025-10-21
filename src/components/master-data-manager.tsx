

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, PlusCircle, Trash2, ChevronsUpDown, Info, ExternalLink } from "lucide-react";
import type { MasterDataItem, ResponsibilityRole, ImprovementActionType, PermissionRule, ActionCategory, ActionSubcategory } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface MasterDataFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: MasterDataItem | null;
  collectionName: string;
  title: string;
  onSave: (collection: string, item: MasterDataItem) => Promise<void>;
  extraData?: {
    categories?: ActionCategory[];
    actionTypes?: ImprovementActionType[];
    responsibilityRoles?: ResponsibilityRole[];
    parentItemId?: string; // For adding children
  };
  isPermissionDialog?: boolean;
}

export function MasterDataFormDialog({ isOpen, setIsOpen, item, collectionName, title, onSave, extraData, isPermissionDialog = false }: MasterDataFormDialogProps) {
  const [formData, setFormData] = useState<MasterDataItem>({ id: "", name: "" });
  const { toast } = useToast();

  useEffect(() => {
    let defaultData: MasterDataItem = { id: "", name: "" };
    if (collectionName === 'responsibilityRoles') {
      defaultData = { ...defaultData, type: "Fixed" };
    }
    if (collectionName === 'ambits') {
      defaultData = { ...defaultData, possibleCreationRoles: [], possibleAnalysisRoles: [], possibleClosureRoles: [], configAdminRoleIds: [] };
    }
    if (collectionName === 'origins') {
      const parentAmbitId = extraData?.parentItemId;
      defaultData = { ...defaultData, actionTypeIds: parentAmbitId ? [parentAmbitId] : [] };
    }
    if (collectionName === 'classifications') {
       const parentOrigenId = extraData?.parentItemId;
       defaultData = { ...defaultData, categoryId: parentOrigenId || '' };
    }
    setFormData(item || defaultData);
  }, [item, collectionName, extraData]);

  const handleSave = async () => {
    if (!isPermissionDialog && !formData.name) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El campo 'Nombre' es obligatorio.",
      });
      return;
    }
    await onSave(collectionName, formData);
    setIsOpen(false);
  };

  const renderSpecificFields = () => {
    const actionTypeData = formData as ImprovementActionType;
    const categoryData = formData as ActionCategory;
    const subcategoryData = formData as ActionSubcategory;

    if (collectionName === 'origins' && extraData?.actionTypes) {
      const handleActionTypeSelection = (actionTypeId: string) => {
        const currentIds = categoryData.actionTypeIds || [];
        const newIds = currentIds.includes(actionTypeId)
          ? currentIds.filter((id: string) => id !== actionTypeId)
          : [...currentIds, actionTypeId];
        setFormData({ ...formData, actionTypeIds: newIds });
      };

      return (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="actionTypeIds" className="text-right">Ámbitos Relacionados</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="col-span-3 justify-between">
                <span className="truncate">
                  {categoryData.actionTypeIds && categoryData.actionTypeIds.length > 0
                    ? extraData.actionTypes
                        .filter(at => categoryData.actionTypeIds!.includes(at.id!))
                        .map(at => at.name)
                        .join(', ')
                    : "Selecciona ámbitos"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]">
              <DropdownMenuLabel>Ámbitos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {extraData.actionTypes.map((at) => (
                <DropdownMenuCheckboxItem
                  key={at.id}
                  checked={categoryData.actionTypeIds?.includes(at.id!)}
                  onCheckedChange={() => handleActionTypeSelection(at.id!)}
                >
                  {at.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    if (collectionName === 'classifications' && extraData?.categories) {
      return (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor={'categoryId'} className="text-right">Origen</Label>
          <Select
            value={subcategoryData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecciona origen" />
            </SelectTrigger>
            <SelectContent>
              {extraData.categories.map(option => (
                <SelectItem key={option.id} value={option.id!}>{option.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (collectionName === 'ambits' && extraData?.responsibilityRoles) {
      const handleRoleSelection = (roleId: string, fieldName: keyof ImprovementActionType) => {
        const currentRoles = (actionTypeData[fieldName] as string[] || []);
        const newRoles = currentRoles.includes(roleId)
          ? currentRoles.filter((id: string) => id !== roleId)
          : [...currentRoles, roleId];
        setFormData({ ...formData, [fieldName]: newRoles });
      };

      const renderDropdown = (fieldName: keyof ImprovementActionType, label: string) => {
        const selectedRoles = (actionTypeData[fieldName] || []) as string[];

        return (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={fieldName} className="text-right">{label}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="col-span-3 justify-between">
                  <span className="truncate">
                    {selectedRoles.length > 0
                      ? extraData.responsibilityRoles!
                          .filter(r => selectedRoles.includes(r.id!))
                          .map(r => r.name)
                          .join(', ')
                      : "Selecciona roles"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]">
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {extraData.responsibilityRoles!.map((role) => (
                  <DropdownMenuCheckboxItem
                    key={role.id}
                    checked={selectedRoles.includes(role.id!)}
                    onCheckedChange={() => handleRoleSelection(role.id!, fieldName)}
                  >
                    {role.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      };
      
      if (isPermissionDialog) {
          return renderDropdown('configAdminRoleIds', 'Admins de Configuración');
      }

      return (
        <>
          {renderDropdown('possibleCreationRoles', 'Roles para Creación')}
          {renderDropdown('possibleAnalysisRoles', 'Roles para Análisis')}
          {renderDropdown('possibleClosureRoles', 'Roles para Cierre')}
          <hr className="my-4" />
          {renderDropdown('configAdminRoleIds', 'Admins de Configuración')}
        </>
      );
    }

    if (collectionName === 'responsibilityRoles') {
      const roleData = formData as ResponsibilityRole;
      return (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Tipo</Label>
            <Select
              value={roleData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as ResponsibilityRole['type'] })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fixed">Fijo</SelectItem>
                <SelectItem value="Pattern">Patrón</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {roleData.type === 'Fixed' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                value={roleData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                placeholder="ej., calidad@ejemplo.com"
              />
            </div>
          )}
          {roleData.type === 'Pattern' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailPattern" className="text-right">Patrón de Email</Label>
              <Input
                id="emailPattern"
                value={roleData.emailPattern || ''}
                onChange={(e) => setFormData({ ...formData, emailPattern: e.target.value })}
                className="col-span-3"
                placeholder="ej., direccion-{{center.id}}@ejemplo.com"
              />
            </div>
          )}
        </>
      );
    }
    
    return null;
  };

  const nameFieldLabel = collectionName === 'origins' ? 'Origen' :
                         collectionName === 'classifications' ? 'Clasificación' :
                         collectionName === 'ambits' ? 'Ámbito' :
                         'Nombre';


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? (isPermissionDialog ? title : "Editar " + title) : "Añadir " + title}</DialogTitle>
          <DialogDescription>
             {isPermissionDialog
                ? "Selecciona los roles que podrán gestionar la configuración de este ámbito."
                : "Rellena los detalles a continuación."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isPermissionDialog && (
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{nameFieldLabel}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
          )}
          {renderSpecificFields()}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MasterDataTableProps {
  data: MasterDataItem[];
  columns: { key: string; label: string }[];
  onEdit: (item: MasterDataItem) => void;
  onDelete: (item: MasterDataItem) => void;
  isLoading: boolean;
  canEdit: (item: MasterDataItem) => boolean;
}

function MasterDataTable({ data, columns, onEdit, onDelete, isLoading, canEdit }: MasterDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((item) => {
              const userCanEdit = canEdit(item);
              return (
              <TableRow key={item.id}>
                {columns.map(col => (
                  <TableCell key={`${item.id}-${col.key}`} className="py-2 align-top">
                    {Array.isArray(item[col.key]) ? (item[col.key] as string[]).join(', ') : item[col.key]}
                  </TableCell>
                ))}
                <TableCell className="text-right py-2 align-top">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)} disabled={!userCanEdit}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={!userCanEdit}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente el elemento.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(item)}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )})
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">No hay datos para mostrar.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface MasterDataManagerProps {
  data: {
    [key: string]: {
      title: string;
      data: MasterDataItem[];
      columns: { key: string; label: string; type?: 'select', options?: any[] }[];
    };
  };
  onSave: (collectionName: string, item: MasterDataItem | PermissionRule) => Promise<void>;
  onDelete: (collectionName: string, itemId: string) => Promise<void>;
  activeTab: string;
  setActiveTab: (value: string) => void;
  isLoading: boolean;
  userIsAdmin: boolean;
  userRoles: string[];
}

export function MasterDataManager({ data, onSave, onDelete, activeTab, setActiveTab, isLoading, userIsAdmin, userRoles }: MasterDataManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MasterDataItem | null>(null);

  const handleAddNew = () => {
    setCurrentItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: MasterDataItem) => {
    setCurrentItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: MasterDataItem) => {
    if (item.id) {
      await onDelete(activeTab, item.id);
    }
  };

  const handleSave = async (collectionName: string, item: MasterDataItem) => {
    await onSave(collectionName, item);
  };

  const getExtraDataForTab = (tabKey: string) => {
    let extraData: any = {};
    if (tabKey === 'classifications' && data.origins) {
      extraData.categories = data.origins.data;
    }
    if (tabKey === 'origins' && data.ambits) {
      extraData.actionTypes = data.ambits.data;
    }
    if (tabKey === 'ambits' && data.responsibilityRoles) {
      extraData.responsibilityRoles = data.responsibilityRoles.data;
    }
    return extraData;
  };
  
  const canEditItem = useMemo(() => (item: MasterDataItem): boolean => {
    if (userIsAdmin) return true;
    if (!data.ambits) return false;

    // A user can edit a non-hierarchical item if they are an admin.
    if (!['ambits', 'origins', 'classifications'].includes(activeTab)) {
        return userIsAdmin;
    }

    if (activeTab === 'ambits') {
      const ambit = item as ImprovementActionType;
      return ambit.configAdminRoleIds?.some(roleId => userRoles.includes(roleId)) ?? false;
    }
    if (activeTab === 'origins') {
      const category = item as ActionCategory;
      if (!category.actionTypeIds || category.actionTypeIds.length === 0) return false; 
      
      const relatedActionTypes = data.ambits.data.filter(at => category.actionTypeIds!.includes(at.id!));
      return relatedActionTypes.some(at => 
        (at as ImprovementActionType).configAdminRoleIds?.some(roleId => userRoles.includes(roleId))
      );
    }
    if (activeTab === 'classifications') {
        const subcategory = item as ActionSubcategory;
        const parentCategory = data.origins.data.find(c => c.id === subcategory.categoryId) as ActionCategory;
        if (!parentCategory || !parentCategory.actionTypeIds) return false;

        const relatedActionTypes = data.ambits.data.filter(at => parentCategory.actionTypeIds!.includes(at.id!));
        return relatedActionTypes.some(at =>
            (at as ImprovementActionType).configAdminRoleIds?.some(roleId => userRoles.includes(roleId))
        );
    }
    
    return false;
  }, [userIsAdmin, userRoles, activeTab, data]);
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew} disabled={!userIsAdmin}>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo
        </Button>
      </div>
      <MasterDataTable
        data={data[activeTab]?.data || []}
        columns={data[activeTab]?.columns || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        canEdit={canEditItem}
      />
      {isFormOpen && (
        <MasterDataFormDialog
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          item={currentItem}
          collectionName={activeTab}
          title={data[activeTab].title.endsWith('s') ? data[activeTab].title.slice(0, -1) : data[activeTab].title}
          onSave={handleSave}
          extraData={getExtraDataForTab(activeTab)}
        />
      )}
    </>
  );
}
