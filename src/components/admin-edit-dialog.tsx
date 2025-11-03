

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { ImprovementActionStatus, User } from "@/lib/types";
import { Textarea } from "./ui/textarea";

interface AdminEditDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fieldInfo: {
    field: string;
    label: string;
    value: any;
    options?: any;
    fieldType?: string;
  } | null;
  onSave: (field: string, newValue: any) => Promise<void>;
  isSubmitting: boolean;
}

export function AdminEditDialog({
  isOpen,
  setIsOpen,
  fieldInfo,
  onSave,
  isSubmitting,
}: AdminEditDialogProps) {
  const [currentValue, setCurrentValue] = useState<any>("");

  useEffect(() => {
    if (fieldInfo) {
      setCurrentValue(fieldInfo.value);
    }
  }, [fieldInfo]);

  if (!fieldInfo) return null;

  const handleSave = () => {
    onSave(fieldInfo.field, currentValue);
  };

  const renderField = () => {
    if (fieldInfo.fieldType === 'textarea') {
      return (
          <Textarea
            id="field-edit"
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            rows={8}
            className="col-span-3"
          />
      )
    }

    if (fieldInfo.field === 'analysis.verificationResponsibleUserId') {
        return (
             <Select value={currentValue} onValueChange={setCurrentValue}>
                <SelectTrigger id="field-edit" className="col-span-3">
                <SelectValue placeholder="Selecciona un responsable" />
                </SelectTrigger>
                <SelectContent>
                {fieldInfo.options?.users?.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                    {user.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        );
    }


    switch (fieldInfo.field) {
      case "title":
        return (
          <Input
            id="field-edit"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="col-span-3"
          />
        );
      case "status":
        return (
          <Select value={currentValue} onValueChange={setCurrentValue}>
            <SelectTrigger id="field-edit" className="col-span-3">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              {fieldInfo.options?.statuses?.map((status: ImprovementActionStatus) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            id="field-edit"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="col-span-3"
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={fieldInfo.fieldType === 'textarea' ? 'sm:max-w-2xl' : 'sm:max-w-md'}>
        <DialogHeader>
          <DialogTitle>Editar {fieldInfo.label}</DialogTitle>
          <DialogDescription>
            Estás a punto de modificar un campo como administrador. Este cambio quedará registrado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className={fieldInfo.fieldType === 'textarea' ? "grid gap-2" : "grid grid-cols-4 items-center gap-4"}>
            <Label htmlFor="field-edit" className={fieldInfo.fieldType !== 'textarea' ? "text-right" : ""}>
              {fieldInfo.label}
            </Label>
            {renderField()}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
