

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
import { Loader2, Pencil, PlusCircle, Trash2, ChevronsUpDown, Info, ExternalLink, Check, X } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

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
    locations?: any[]; // To select a fixed location
    parentItemId?: string; // For adding children
  };
  isPermissionDialog?: boolean;
  userIsAdmin?: boolean; // Pass admin status
}

const responsibleLocationFields = [
    "Titular/es", "Dependencia", "Area", "C_Autonoma", "Organizacion_Territorial",
    "RRHH_Territorial", "Prestaciones_Territorial", "Prevencion_Territorial",
    "Area_F_Territorial", "Coordinador_Sanitario", "Gestion_Calidad",
    "Administracion", "Proas_Territorial", "Coordinador_Informatico",
    "SPP_Territorial", "Coordinador_Instalaciones", "Consultor_Prevencion",
    "Gestion_Afiliacion", "Gestion_Pago_Delegado", "Personal"
];


export function MasterDataFormDialog({ isOpen, setIsOpen, item, collectionName, title, onSave, extraData, isPermissionDialog = false, userIsAdmin = false }: MasterDataFormDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<MasterDataItem>({ id: "", name: "" });

  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false);
  const [isFieldPopoverOpen, setIsFieldPopoverOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData(item);
      } else {
        let defaultData: MasterDataItem = { id: "", name: "" };
        if (collectionName === 'responsibilityRoles') {
            defaultData = { ...defaultData, type: "Fixed" };
        }
        if (collectionName === 'ambits') {
            defaultData = { ...defaultData, configAdminRoleIds: [], possibleCreationRoles: [], possibleAnalysisRoles: [] };
        }
        if (collectionName === 'origins') {
            const parentAmbitId = extraData?.parentItemId;
            defaultData = { ...defaultData, actionTypeIds: parentAmbitId ? [parentAmbitId] : [] };
        }
        if (collectionName === 'classifications') {
            const parentOrigenId = extraData?.parentItemId;
            defaultData = { ...defaultData, categoryId: parentOrigenId || '' };
        }
        setFormData(defaultData);
      }
    }
  }, [item, isOpen, collectionName, extraData]);

 const handleSave = async () => {
    // Start with a clean base object containing only common fields
    const baseData: Partial<ResponsibilityRole> = {
      id: formData.id,
      name: formData.name,
      order: formData.order,
      type: (formData as ResponsibilityRole).type
    };

    let dataToSave: Partial<ResponsibilityRole> = { ...baseData };
    
    if (collectionName === 'responsibilityRoles') {
      const roleData = formData as ResponsibilityRole;
      
      switch (roleData.type) {
        case 'Fixed':
          dataToSave.email = roleData.email;
          break;
        case 'FixedLocation':
          dataToSave.fixedLocationId = roleData.fixedLocationId;
          dataToSave.locationResponsibleField = roleData.locationResponsibleField;
          break;
        case 'Location':
          dataToSave.actionFieldSource = roleData.actionFieldSource;
          dataToSave.locationResponsibleField = roleData.locationResponsibleField;
          break;
      }
    } else {
      dataToSave = { ...formData };
    }

    await onSave(collectionName, dataToSave);
    setIsOpen(false);
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? undefined : parseInt(value, 10);
    setFormData({ ...formData, [name]: isNaN(numericValue!) ? undefined : numericValue });
  };
  
  const handleRoleTypeChange = (value: ResponsibilityRole['type']) => {
    const baseData = {
        id: formData.id,
        name: formData.name,
        order: formData.order,
        type: value 
    };

    let newData: Partial<ResponsibilityRole> = baseData;

    switch (value) {
        case 'Fixed':
            newData.email = (formData as ResponsibilityRole).email || '';
            break;
        case 'FixedLocation':
            newData.fixedLocationId = (formData as ResponsibilityRole).fixedLocationId || '';
            newData.locationResponsibleField = (formData as ResponsibilityRole).locationResponsibleField || '';
            break;
        case 'Location':
            newData.actionFieldSource = (formData as ResponsibilityRole).actionFieldSource || 'centerId';
            newData.locationResponsibleField = (formData as ResponsibilityRole).locationResponsibleField || '';
            break;
    }
    
    setFormData(newData);
};


  const renderSpecificFields = () => {
    const actionTypeData = formData as ImprovementActionType;
    const categoryData = formData as ActionCategory;
    const subcategoryData = formData as ActionSubcategory;

    if (collectionName === 'origins' && extraData?.actionTypes) {
        return (
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="actionTypeIds" className="text-right">Ámbitos Relacionados</Label>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className="col-span-3 justify-between">
                    <span className="truncate">
                    {actionTypeData.actionTypeIds && actionTypeData.actionTypeIds.length > 0
                        ? `${actionTypeData.actionTypeIds.length} ámbito(s) seleccionado(s)`
                        : "Selecciona ámbitos"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar ámbito..." />
                    <CommandList className="max-h-56">
                    <CommandEmpty>No se encontraron ámbitos.</CommandEmpty>
                    <CommandGroup>
                        {extraData.actionTypes.map((at) => (
                        <CommandItem
                            key={at.id}
                            value={at.name}
                            onSelect={(e) => {
                                e.preventDefault();
                                const currentIds = actionTypeData.actionTypeIds || [];
                                const newIds = currentIds.includes(at.id!)
                                    ? currentIds.filter((id: string) => id !== at.id)
                                    : [...currentIds, at.id!];
                                setFormData({ ...formData, actionTypeIds: newIds });
                            }}
                        >
                            <Check className={cn("mr-2 h-4 w-4", actionTypeData.actionTypeIds?.includes(at.id!) ? "opacity-100" : "opacity-0")} />
                            {at.name}
                        </CommandItem>
                        ))}
                    </CommandGroup>
                    </CommandList>
                </Command>
                </PopoverContent>
            </Popover>
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
        
        const renderMultiSelect = (fieldName: keyof ImprovementActionType, label: string, disabled: boolean = false) => {
            const selectedRoles = (actionTypeData[fieldName] || []) as string[];

            return (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor={fieldName} className="text-right pt-2">{label}</Label>
                <div className="col-span-3 space-y-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between text-left font-normal" disabled={disabled}>
                            <span className="truncate">
                                {`${selectedRoles.length} rol(es) seleccionado(s)`}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                            <CommandInput placeholder="Buscar rol..." />
                            <CommandList className="max-h-56">
                                <CommandEmpty>No se encontraron roles.</CommandEmpty>
                                <CommandGroup>
                                {extraData.responsibilityRoles!.map((role) => (
                                    <CommandItem
                                    key={role.id}
                                    value={role.name}
                                    onSelect={(e) => { e.preventDefault(); handleRoleSelection(role.id!, fieldName); }}
                                    >
                                    <Check className={cn("mr-2 h-4 w-4", selectedRoles.includes(role.id!) ? "opacity-100" : "opacity-0")} />
                                    {role.name}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {selectedRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {selectedRoles.map(roleId => {
                                const role = extraData.responsibilityRoles!.find(r => r.id === roleId);
                                if (!role) return null;
                                return (
                                    <Badge key={roleId} variant="secondary" className="pl-2 pr-1">
                                        {role.name}
                                        <button
                                            type="button"
                                            className="ml-1 rounded-full p-0.5 hover:bg-background/80"
                                            onClick={(e) => { e.preventDefault(); handleRoleSelection(roleId, fieldName); }}
                                            disabled={disabled}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                );
                            })}
                        </div>
                    )}
                </div>
              </div>
            );
        };
        
        return (
            <div className="space-y-4">
                {renderMultiSelect('configAdminRoleIds', 'Admins de Configuración', !userIsAdmin)}
                <Separator />
                <h4 className="font-semibold text-center text-muted-foreground">Permisos de Workflow</h4>
                {renderMultiSelect('possibleCreationRoles', 'Roles de Creación')}
                {renderMultiSelect('possibleAnalysisRoles', 'Roles de Análisis')}
            </div>
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
              onValueChange={(value) => handleRoleTypeChange(value as ResponsibilityRole['type'])}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fixed">Fijo</SelectItem>
                <SelectItem value="Location">Centro Acción</SelectItem>
                <SelectItem value="FixedLocation">Centro Específico</SelectItem>
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
           {(roleData.type === 'Location' || roleData.type === 'FixedLocation') && (
            <>
              {roleData.type === 'FixedLocation' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fixedLocationId" className="text-right">Centro Específico</Label>
                      <Popover open={isLocationPopoverOpen} onOpenChange={setIsLocationPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={isLocationPopoverOpen} className="col-span-3 justify-between">
                                <span className="truncate">
                                {roleData.fixedLocationId && extraData?.locations ? extraData.locations.find((l: any) => l.id === roleData.fixedLocationId)?.descripcion_centro : "Selecciona un centro"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-56 p-0">
                            <Command>
                                <CommandInput placeholder="Busca un centro..." />
                                <CommandList>
                                    <CommandEmpty>No se encontró ningún centro.</CommandEmpty>
                                    <CommandGroup>
                                        {extraData?.locations?.map((location: any) => (
                                        <CommandItem key={location.id} value={location.descripcion_centro} onSelect={() => { setFormData({ ...formData, fixedLocationId: location.id }); setIsLocationPopoverOpen(false); }}>
                                            <Check className={cn("mr-2 h-4 w-4", roleData.fixedLocationId === location.id ? "opacity-100" : "opacity-0")} />
                                            {location.descripcion_centro}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                      </Popover>
                  </div>
              )}
               {roleData.type === 'Location' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="actionFieldSource" className="text-right">Campo Origen Acción</Label>
                  <Select
                    value={roleData.actionFieldSource}
                    onValueChange={(value) => setFormData({ ...formData, actionFieldSource: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona un campo de origen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centerId">Centro Principal</SelectItem>
                      <SelectItem value="affectedAreasIds">Áreas Funcionales Implicadas</SelectItem>
                      <SelectItem value="affectedCentersIds">Centros afectados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locationResponsibleField" className="text-right">Campo Responsable</Label>
                <Popover open={isFieldPopoverOpen} onOpenChange={setIsFieldPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={isFieldPopoverOpen} className="col-span-3 justify-between">
                            <span className="truncate">
                            {roleData.locationResponsibleField || "Selecciona un campo"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-56 p-0">
                        <Command>
                            <CommandInput placeholder="Busca un campo..." />
                             <CommandList>
                                <CommandEmpty>No se encontró ningún campo.</CommandEmpty>
                                <CommandGroup>
                                    {responsibleLocationFields.map(field => (
                                    <CommandItem key={field} value={field} onSelect={() => { setFormData({ ...formData, locationResponsibleField: field }); setIsFieldPopoverOpen(false); }}>
                                        <Check className={cn("mr-2 h-4 w-4", roleData.locationResponsibleField === field ? "opacity-100" : "opacity-0")} />
                                        {field}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                 <p className="col-start-2 col-span-3 text-xs text-muted-foreground">
                  {roleData.type === 'Location' ? "Busca el email en el centro/área de la acción." : "Busca el email en el centro específico seleccionado arriba."}
                </p>
              </div>
            </>
          )}
        </>
      );
    }
    
    return null;
  };

  const nameFieldLabel = collectionName === 'origins' ? 'Origen' :
                         collectionName === 'classifications' ? 'Clasificación' :
                         collectionName === 'ambits' ? 'Ámbito' : // 'ambits' internament
                         'Nombre';


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={cn(
          collectionName === 'ambits' ? 'sm:max-w-2xl' : 'sm:max-w-md'
      )}>
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
  canDelete?: boolean;
}

export function MasterDataTable({ data, columns, onEdit, onDelete, isLoading, canEdit, canDelete = true }: MasterDataTableProps) {
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
            data.map((item, rowIndex) => {
              const userCanEdit = canEdit(item);
              const userCanDelete = canDelete && userCanEdit;
              return (
              <TableRow key={item.id}>
                {columns.map((col, colIndex) => (
                  <TableCell 
                    key={`${item.id}-${col.key}`} 
                    className={cn("py-2 align-top", colIndex === 0 && "font-bold")}>
                    {Array.isArray(item[col.key]) ? (item[col.key] as string[]).join(', ') : item[col.key]}
                  </TableCell>
                ))}
                <TableCell className="text-right py-2 align-top">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)} disabled={!userCanEdit}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!userCanDelete}>
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
                  )}
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