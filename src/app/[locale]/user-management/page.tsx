
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import type { User } from "@/lib/types";
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { UserFormDialog } from "@/components/user-form-dialog";
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

export default function UserManagementPage() {
  const t = useTranslations("UserManagementPage")
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
    } catch (error) {
        console.error("Failed to load users:", error);
        toast({ variant: "destructive", title: "Error", description: "No s'han pogut carregar els usuaris." });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
        await deleteUser(userId);
        toast({ title: "Usuari eliminat", description: "L'usuari s'ha eliminat correctament." });
        await loadUsers();
    } catch (error) {
        console.error("Failed to delete user:", error);
        toast({ variant: "destructive", title: "Error", description: "No s'ha pogut eliminar l'usuari." });
    }
  };

  const handleSave = async (data: Omit<User, "id">, id?: string) => {
    try {
        if (id) {
            await updateUser(id, data);
            toast({ title: "Usuari actualitzat", description: "L'usuari s'ha actualitzat correctament." });
        } else {
            await addUser(data);
            toast({ title: "Usuari creat", description: "L'usuari s'ha creat correctament." });
        }
        await loadUsers();
        setIsFormOpen(false);
    } catch (error) {
        console.error("Failed to save user:", error);
        toast({ variant: "destructive", title: "Error", description: "No s'ha pogut desar l'usuari." });
    }
  };


  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addNewUser")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">{t("col.avatar")}</TableHead>
                <TableHead>{t("col.name")}</TableHead>
                <TableHead>{t("col.email")}</TableHead>
                <TableHead>{t("col.role")}</TableHead>
                <TableHead className="text-right">{t("col.actions")}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : users.length > 0 ? (
                    users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
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
                                    <AlertDialogTitle>Estàs segur?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Aquesta acció no es pot desfer. Això eliminarà permanentment l'usuari.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(user.id!)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No s'han trobat usuaris.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>

    {isFormOpen && (
        <UserFormDialog
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            user={editingUser}
            onSave={handleSave}
        />
    )}
    </>
  )
}
