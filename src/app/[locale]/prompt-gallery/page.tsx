
"use client"

import {
  Card,
  CardContent,
  CardHeader,
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
import { useTranslations } from "next-intl"
import { Copy, Loader2, Pencil, PlusCircle, Trash2, ChevronDown } from "lucide-react"
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
import { cn } from "@/lib/utils"

function PromptFormDialog({
    isOpen,
    setIsOpen,
    prompt,
    onSave,
    t,
  }: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    prompt: Partial<GalleryPrompt> | null;
    onSave: (data: Omit<GalleryPrompt, "id">) => Promise<void>;
    t: any;
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
          title: "Error de validació",
          description: "Els camps 'Títol' i 'Prompt' són obligatoris.",
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
            <DialogTitle>{prompt?.id ? t("editTitle") : t("addTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t("col.title")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t("col.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prompt">{t("col.prompt")}</Label>
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
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            <Button onClick={handleSave}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}

export default function PromptGalleryPage() {
    const t = useTranslations("PromptGalleryPage");
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
            toast({ variant: "destructive", title: "Error", description: "No s'han pogut carregar els prompts."});
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
            title: t("copy.toastTitle"),
            description: t("copy.toastDescription"),
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
            toast({ title: t("delete.toastTitle") });
            await loadPrompts();
        } catch (error) {
            console.error("Failed to delete prompt:", error);
            toast({ variant: "destructive", title: "Error", description: "No s'ha pogut eliminar el prompt." });
        }
    };
    
    const handleSave = async (data: Omit<GalleryPrompt, "id">) => {
        try {
            if (currentItem?.id) {
                await updateGalleryPrompt(currentItem.id, data);
                toast({ title: t("edit.toastTitle") });
            } else {
                await addGalleryPrompt(data);
                toast({ title: t("add.toastTitle") });
            }
            await loadPrompts();
        } catch (error) {
            console.error("Failed to save prompt:", error);
            toast({ variant: "destructive", title: "Error", description: "No s'ha pogut desar el prompt." });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground mt-1">{t("description")}</p>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-end">
                        <Button onClick={handleAddNew}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {t("addNew")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8"></TableHead>
                                <TableHead>{t("col.title")}</TableHead>
                                <TableHead>{t("col.description")}</TableHead>
                                <TableHead className="text-right">{t("col.actions")}</TableHead>
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
                                    <Collapsible asChild key={p.id}>
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
                                                                <AlertDialogTitle>{t("delete.confirmationTitle")}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                {t("delete.confirmationMessage")}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(p.id)}>{t("delete.confirm")}</AlertDialogAction>
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
                                                            <h4 className="font-semibold mb-2">{t("col.prompt")}</h4>
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
                                        {t("noPrompts")}
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
                    t={t}
                />
            )}
        </div>
    )
}
