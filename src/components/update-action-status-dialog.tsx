
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProposedAction, ProposedActionStatus } from "@/lib/types";
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
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

const statusUpdateSchema = z.object({
  status: z.enum(["Implementada", "Implementada Parcialment", "No Implementada"]),
});

type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>;

interface UpdateActionStatusDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  proposedAction: ProposedAction;
  onSave: (proposedActionId: string, newStatus: ProposedActionStatus) => void;
  isSubmitting: boolean;
}

export function UpdateActionStatusDialog({
  isOpen,
  setIsOpen,
  proposedAction,
  onSave,
  isSubmitting,
}: UpdateActionStatusDialogProps) {
  const t = useTranslations("Actions.detail.verification");
  const form = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: proposedAction.status === 'Pendent' ? 'Implementada' : proposedAction.status,
    },
  });

  const handleSubmit = (values: StatusUpdateFormValues) => {
    onSave(proposedAction.id, values.status);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualitzar Estat de l'Acció</DialogTitle>
          <DialogDescription>
            Selecciona el nou estat per a l'acció: "{proposedAction.description}"
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 py-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <RadioGroupItem value="Implementada" />
                        </FormControl>
                        <FormLabel className="font-normal">{t("status.implemented")}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <RadioGroupItem value="Implementada Parcialment" />
                        </FormControl>
                        <FormLabel className="font-normal">{t("status.partiallyImplemented")}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <RadioGroupItem value="No Implementada" />
                        </FormControl>
                        <FormLabel className="font-normal">{t("status.notImplemented")}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel·lar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Canvis
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
