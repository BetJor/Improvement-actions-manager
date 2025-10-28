
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { User } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(1, "El nom és requerit."),
  email: z.string().email("L'adreça de correu no és vàlida."),
  role: z.enum(["Creator", "Responsible", "Director", "Committee", "Admin"], {
    required_error: "El rol és requerit.",
  }),
  avatar: z.string().url("La URL de l'avatar no és vàlida.").optional().or(z.literal('')),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // If password is provided, confirmPassword must match.
  // This rule applies only if password is not undefined/null/empty.
  if (data.password) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Les contrasenyes no coincideixen.",
  path: ["confirmPassword"], 
});

type UserFormValues = z.infer<typeof formSchema>

interface UserFormDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  user: User | null
  onSave: (data: Omit<User, "id">, id?: string) => Promise<void>
}

export function UserFormDialog({
  isOpen,
  setIsOpen,
  user,
  onSave,
}: UserFormDialogProps) {
  
  const formSchemaForContext = user 
    ? formSchema.omit({ password: true, confirmPassword: true }) 
    : formSchema.refine(data => data.password && data.password.length >= 6, {
        message: "La contrasenya ha de tenir almenys 6 caràcters.",
        path: ["password"],
      });


  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchemaForContext),
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
      avatar: "",
      password: "",
      confirmPassword: ""
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (user) {
        form.reset({
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            password: '',
            confirmPassword: '',
        });
      } else {
        form.reset({
          name: "",
          email: "",
          role: undefined,
          avatar: "",
          password: "",
          confirmPassword: ""
        });
      }
    }
  }, [user, form, isOpen])

  const handleSubmit = (values: UserFormValues) => {
    onSave(values, user?.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuari" : "Crear Nou Usuari"}</DialogTitle>
          <DialogDescription>
            {user ? "Modifica les dades de l'usuari." : "Omple les dades per a crear un nou usuari."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ex., Joan Pere" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correu Electrònic</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="p. ex., joan.pere@example.com" {...field} disabled={!!user} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Creator">Creator</SelectItem>
                      <SelectItem value="Responsible">Responsible</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="Committee">Committee</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'Avatar</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!user && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contrasenya</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contrasenya</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel·lar</Button>
              </DialogClose>
              <Button type="submit">Desar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
