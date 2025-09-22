
"use client"

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
import { Button } from "@/components/ui/button"
import { Copy, Loader2, Pencil, PlusCircle, Trash2, ChevronDown, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Fragment, useEffect, useState } from "react"
import { getGalleryPrompts, addGalleryPrompt, updateGalleryPrompt, deleteGalleryPrompt } from "@/lib/data"
import type { GalleryPrompt } from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

function PromptFormDialog({
    isOpen,
    setIsOpen,
    prompt,
    onSave,
  }: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    prompt: Partial<GalleryPrompt> | null;
    onSave: (data: Omit<GalleryPrompt, "id">) => Promise<void>;
  }) {
    const [formData, setFormData] = useState<Omit<GalleryPrompt, "id">>({
      title: prompt?.title || "",
      description: prompt?.description || "",
      prompt: prompt?.prompt || "",
    });
    const { toast } = useToast();
  
    const handleSave = async () => {
      if (!formData.title || !formData.prompt) {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: "Los campos 'Título' y 'Prompt' son obligatorios.",
        });
        return;
      }
      await onSave(formData);
      setIsOpen(false);
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{prompt?.id ? "Editar Prompt" : "Añadir Nuevo Prompt"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}

export default function PromptGalleryPage() {
    const { toast } = useToast();
    const [prompts, setPrompts] = useState<GalleryPrompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<GalleryPrompt> | null>(null);

    const loadPrompts = async () => {
        setIsLoading(true);
        try {
            const data = await getGalleryPrompts();
            setPrompts(data);
        } catch (error) {
            console.error("Failed to load gallery prompts:", error);
            toast({ variant: "destructive", title: "Error", description: "No se han podido cargar los prompts."});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPrompts();
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "¡Prompt Copiado!",
            description: "El prompt se ha copiado al portapapeles.",
        });
    }

    const handleAddNew = () => {
        setCurrentItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (prompt: GalleryPrompt) => {
        setCurrentItem(prompt);
        setIsFormOpen(true);
    };

    const handleDelete = async (promptId: string) => {
        try {
            await deleteGalleryPrompt(promptId);
            toast({ title: "Prompt Eliminado" });
            await loadPrompts();
        } catch (error) {
            console.error("Failed to delete prompt:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el prompt." });
        }
    };
    
    const handleSave = async (data: Omit<GalleryPrompt, "id">) => {
        try {
            if (currentItem?.id) {
                await updateGalleryPrompt(currentItem.id, data);
                toast({ title: "Prompt Actualizado" });
            } else {
                await addGalleryPrompt(data);
                toast({ title: "Prompt Creado" });
            }
            await loadPrompts();
        } catch (error) {
            console.error("Failed to save prompt:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el prompt." });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Galería de Prompts</h1>
                <p className="text-muted-foreground mt-1">Explora una colección de prompts útiles que puedes copiar y adaptar a tu configuración de IA.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Orden de Ejecución Recomendado</CardTitle>
                    <CardDescription>Para construir una aplicación de forma eficiente, te recomendamos ejecutar los prompts en la siguiente secuencia:</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-4">
                        <li className="flex items-start gap-4">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">1</div>
                           <div>
                                <h4 className="font-semibold">Crear un Layout Dinámico con Pestañas</h4>
                                <p className="text-sm text-muted-foreground">Establece el esqueleto visual y la estructura base (menú lateral, cabecera y sistema de pestañas). Es el prerrequisito para todo lo demás.</p>
                           </div>
                        </li>
                         <li className="flex items-start gap-4">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">2</div>
                           <div>
                                <h4 className="font-semibold">Integrar Soporte Multilenguaje</h4>
                                <p className="text-sm text-muted-foreground">Configura las rutas y traducciones al principio para evitar tener que refactorizar todos los enlaces más adelante.</p>
                           </div>
                        </li>
                        <li className="flex items-start gap-4">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">3</div>
                           <div>
                                <h4 className="font-semibold">Integrar Login con Google</h4>
                                <p className="text-sm text-muted-foreground">Añade la gestión de usuarios y protege las rutas para asegurar que solo los usuarios autenticados accedan a la aplicación.</p>
                           </div>
                        </li>
                        <li className="flex items-start gap-4">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">4</div>
                           <div>
                                <h4 className="font-semibold">Crear Página de Roadmap</h4>
                                <p className="text-sm text-muted-foreground">Una vez la estructura y la seguridad están listas, puedes empezar a añadir las páginas de contenido.</p>
                           </div>
                        </li>
                    </ol>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-end">
                        <Button onClick={handleAddNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Prompt
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8"></TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : prompts.length > 0 ? (
                                prompts.map((p) => (
                                    <Collapsible asChild key={p.id} >
                                        <Fragment>
                                            <TableRow>
                                                <TableCell>
                                                     <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </TableCell>
                                                <TableCell className="font-semibold align-top">{p.title}</TableCell>
                                                <TableCell className="text-muted-foreground align-top">
                                                    {p.description}
                                                </TableCell>
                                                <TableCell className="text-right align-top">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleCopy(p.prompt)}>
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
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
                                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Se eliminará el prompt permanentemente.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Eliminar</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            <CollapsibleContent asChild>
                                                <TableRow>
                                                    <TableCell colSpan={4} className="p-0">
                                                        <div className="p-4 bg-muted/50">
                                                            <h4 className="font-semibold mb-2">Prompt</h4>
                                                            <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                                                                <code>
                                                                    {p.prompt}
                                                                </code>
                                                            </pre>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </CollapsibleContent>
                                        </Fragment>
                                    </Collapsible>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No se encontraron prompts. Haz clic en 'Añadir Nuevo Prompt' para empezar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {isFormOpen && (
                <PromptFormDialog
                    isOpen={isFormOpen}
                    setIsOpen={setIsFormOpen}
                    prompt={currentItem}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}
