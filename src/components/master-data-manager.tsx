
"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"
import type { MasterDataItem } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
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

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useTranslations } from "next-intl"

interface MasterDataFormDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  item: MasterDataItem | null
  collectionName: string
  title: string
  onSave: (collection: string, item: MasterDataItem) => Promise<void>
  extraColumns?: { key: string; label: string, type: 'select', options: any[] }[]
}

function MasterDataFormDialog({ isOpen, setIsOpen, item, collectionName, title, onSave, extraColumns = [] }: MasterDataFormDialogProps) {
  const [formData, setFormData] = useState<MasterDataItem>(item || { name: "" })
  const { toast } = useToast()

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        variant: "destructive",
        title: "Error de validació",
        description: "El camp 'Nom' és obligatori.",
      })
      return
    }
    await onSave(collectionName, formData)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Editar" : "Crear"} {title}</DialogTitle>
          <DialogDescription>
            Omple els detalls a continuació.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          {extraColumns.map(col => (
             <div key={col.key} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={col.key} className="text-right">
                {col.label}
              </Label>
              <Select
                value={formData[col.key]}
                onValueChange={(value) => setFormData({ ...formData, [col.key]: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={`Selecciona ${col.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {col.options.map(option => (
                    <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel·lar</Button>
          </DialogClose>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface MasterDataTableProps {
  data: MasterDataItem[];
  columns: { key: string; label: string }[];
  onEdit: (item: MasterDataItem) => void;
  onDelete: (item: MasterDataItem) => void;
  t: (key: string) => string;
}

function MasterDataTable({ data, columns, onEdit, onDelete, t }: MasterDataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
            <TableHead className="text-right">{t("col.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                {columns.map(col => (
                    <TableCell key={`${item.id}-${col.key}`}>
                       {item[col.key]}
                    </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteConfirmation")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("deleteConfirmationMessage")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(item)}>{t("continue")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 2} className="h-24 text-center">
                No hi ha dades per mostrar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface MasterDataManagerProps {
  data: {
    [key: string]: {
      title: string;
      data: MasterDataItem[];
      columns: { key: string; label: string; type?: 'select', options?: any[] }[];
    };
  };
  onSave: (collectionName: string, item: MasterDataItem) => Promise<void>;
  onDelete: (collectionName: string, itemId: string) => Promise<void>;
}

export function MasterDataManager({ data, onSave, onDelete }: MasterDataManagerProps) {
  const t = useTranslations("SettingsPage");
  const [activeTab, setActiveTab] = useState(Object.keys(data)[0]);
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
  
  const getExtraColumnsForTab = (tabKey: string) => {
    if (tabKey === 'subcategories') {
      return [{
        key: 'categoryId',
        label: t('col.category'),
        type: 'select',
        options: data.categories.data
      }];
    }
    return [];
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {Object.keys(data).map(key => (
            <TabsTrigger key={key} value={key}>{data[key].title}</TabsTrigger>
          ))}
        </TabsList>
        {Object.keys(data).map(key => (
          <TabsContent key={key} value={key}>
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t("addNew")}
              </Button>
            </div>
            <MasterDataTable
              data={data[key].data}
              columns={data[key].columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              t={t}
            />
          </TabsContent>
        ))}
      </Tabs>
      {isFormOpen && (
        <MasterDataFormDialog
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          item={currentItem}
          collectionName={activeTab}
          title={data[activeTab].title.slice(0, -1)}
          onSave={handleSave}
          extraColumns={getExtraColumnsForTab(activeTab)}
        />
      )}
    </>
  )
}
