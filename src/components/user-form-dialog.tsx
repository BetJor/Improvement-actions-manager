
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
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("La dirección de correo no es válida."),
  role: z.enum(["Creator", "Responsible", "Director", "Committee", "Admin"], {
    required_error: "El rol es requerido.",
  }),
  avatar: z.string().url("La URL del avatar no es válida.").optional().or(z.literal('')),
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
  message: "Las contraseñas no coinciden.",
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
        message: "La contraseña debe tener al menos 6 caracteres.",
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
          <DialogTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {user ? "Modifica los datos del usuario." : "Rellena los datos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ej., Joan Pere" {...field} />
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
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="p. ej., joan.pere@example.com" {...field} disabled={!!user} />
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
                  <FormLabel>URL del Avatar</FormLabel>
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
                      <FormLabel>Contraseña</FormLabel>
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
                      <FormLabel>Confirmar Contraseña</FormLabel>
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
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
