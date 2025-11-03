

"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProposedAction, User } from "@/lib/types";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn, safeParseDate } from "@/lib/utils";

const proposedActionSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "La descripción es requerida."),
  responsibleUserId: z.string().min(1, "El responsable es requerido."),
  dueDate: z.date({ required_error: "La fecha de vencimiento es requerida." }),
  status: z.enum(["Pendiente", "Implementada", "Implementada Parcialmente", "No Implementada"]).optional(),
});

type ProposedActionFormValues = z.infer<typeof proposedActionSchema>;

interface ProposedActionEditDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  proposedAction: ProposedAction;
  users: User[];
  onSave: (data: ProposedAction) => void;
  isSubmitting: boolean;
}

export function ProposedActionEditDialog({
  isOpen,
  setIsOpen,
  proposedAction,
  users,
  onSave,
  isSubmitting,
}: ProposedActionEditDialogProps) {
  
  const form = useForm<ProposedActionFormValues>({
    resolver: zodResolver(proposedActionSchema),
    defaultValues: {
      ...proposedAction,
      dueDate: safeParseDate(proposedAction.dueDate) || new Date(),
    },
  });

  const handleSubmit = (values: ProposedActionFormValues) => {
    onSave(values as ProposedAction);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Acción Propuesta</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la acción propuesta. Los cambios quedarán registrados.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="responsibleUserId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Responsable</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un usuario" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id!}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem>
                           <FormLabel>Fecha Vencimiento</FormLabel>
                           <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                    ) : (
                                    <span>Selecciona una fecha</span>
                                    )}
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                />
                            </PopoverContent>
                           </Popover>
                           <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="Pendiente" /></FormControl><FormLabel className="font-normal">Pendiente</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="Implementada" /></FormControl><FormLabel className="font-normal">Implementada</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="Implementada Parcialmente" /></FormControl><FormLabel className="font-normal">Implementada Parcialmente</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="No Implementada" /></FormControl><FormLabel className="font-normal">No Implementada</FormLabel></FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
