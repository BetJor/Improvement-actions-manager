
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, PlusCircle, Trash2, User, Users, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAclEntries, setAclEntries } from "@/services/ai-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AclEntryType = "user" | "group";
type AclAccessLevel = "No Access" | "Reader" | "Author" | "Editor" | "Manager";

export interface AclEntry {
  id: string;
  name: string;
  type: AclEntryType;
  access: AclAccessLevel;
}

const accessLevelColors: { [key in AclAccessLevel]: string } = {
  "No Access": "bg-gray-500",
  Reader: "bg-blue-500",
  Author: "bg-green-500",
  Editor: "bg-yellow-600",
  Manager: "bg-red-500",
};

const generateFirestoreRules = (entries: AclEntry[]): string => {
  const getReadPermission = (access: AclAccessLevel) => 
    ["Reader", "Author", "Editor", "Manager"].includes(access);

  const getWritePermission = (access: AclAccessLevel) =>
    ["Author", "Editor", "Manager"].includes(access);
  
  const getDeletePermission = (access: AclAccessLevel) =>
    ["Editor", "Manager"].includes(access);

  const generateRuleBlock = (entry: AclEntry): string => {
    const condition = entry.type === 'user'
      ? `request.auth.token.email == "${entry.name}"`
      : `get(/databases/$(database)/documents/groups/${entry.name}).data.members.hasAny([request.auth.uid])`;

    const rules = [
      getReadPermission(entry.access) && `allow read: if ${condition};`,
      getWritePermission(entry.access) && `allow write: if ${condition};`,
      getDeletePermission(entry.access) && `allow delete: if ${condition};`
    ].filter(Boolean).join('\n      ');

    return rules ? `
      // ${entry.type === 'user' ? 'User' : 'Group'}: ${entry.name} (${entry.access})
      ${rules}
    ` : '';
  };

  const allRules = entries.map(generateRuleBlock).join('').trim();

  return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Example for a collection 'actions'
    match /actions/{actionId} {
      ${allRules}

      // Default deny for safety
      allow read, write, delete: if false;
    }

    // Add other collection rules here...
    // match /other_collection/{docId} {
    //   ...
    // }
  }
}
  `.trim();
};


export default function FirestoreRulesGeneratorPage() {
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<AclEntry[]>([]);
  const [newEntry, setNewEntry] = useState({ name: "", type: "user" as AclEntryType, access: "Reader" as AclAccessLevel });
  const [generatedRules, setGeneratedRules] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntries() {
        setIsLoading(true);
        setError(null);
        try {
            const savedEntries = await getAclEntries();
            setEntries(savedEntries);
            const rules = generateFirestoreRules(savedEntries);
            setGeneratedRules(rules);
        } catch (error: any) {
            console.error("Failed to load ACL entries from Firestore", error);
            setError("No se han podido cargar las entradas de la lista de acceso.");
            toast({ variant: "destructive", title: "Error", description: "No se han podido cargar las entradas de la lista de acceso." });
        } finally {
            setIsLoading(false);
        }
    }
    loadEntries();
  }, [toast]);

  const handleAddEntry = () => {
    if (!newEntry.name) {
      toast({ variant: "destructive", title: "Error", description: "El nombre del usuario o grupo no puede estar vacío."});
      return;
    }
    setEntries([...entries, { ...newEntry, id: crypto.randomUUID() }]);
    setNewEntry({ name: "", type: "user", access: "Reader" }); // Reset form
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
        await setAclEntries(entries);
        toast({ title: "¡Lista Guardada!", description: "La lista de control de acceso se ha guardado en Firestore." });
    } catch (error) {
        console.error("Failed to save ACL entries to Firestore", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la lista de acceso." });
    } finally {
        setIsSaving(false);
    }
  }
  
  const handleGenerate = () => {
    const rules = generateFirestoreRules(entries);
    setGeneratedRules(rules);
    toast({ title: "¡Reglas Generadas!" });
  };
  
  const handleCopy = () => {
    if (!generatedRules) {
      toast({ variant: "destructive", title: "Error", description: "Primero debes generar las reglas."});
      return;
    }
    navigator.clipboard.writeText(generatedRules);
    toast({ title: "¡Reglas Copiadas!", description: "Las reglas se han copiado al portapapeles." });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generador de Reglas de Acceso de Firestore</CardTitle>
            <CardDescription>Añade usuarios o grupos, asígnales un nivel de acceso y genera las reglas de seguridad de Firestore para tu aplicación.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex gap-2">
                 <Input
                    placeholder="Email del usuario o nombre del grupo..."
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                    className="flex-grow"
                  />
                  <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v as AclEntryType })}>
                      <SelectTrigger className="w-[120px]">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="group">Grupo</SelectItem>
                      </SelectContent>
                  </Select>
                   <Select value={newEntry.access} onValueChange={(v) => setNewEntry({ ...newEntry, access: v as AclAccessLevel })}>
                      <SelectTrigger className="w-[150px]">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="No Access">Sin Acceso</SelectItem>
                          <SelectItem value="Reader">Lector</SelectItem>
                          <SelectItem value="Author">Autor</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Manager">Gestor</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <Button onClick={handleAddEntry} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir a la Lista
              </Button>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>Lista de Control de Acceso (ACL)</CardTitle>
                <CardDescription>Esta lista se guardará en Firestore.</CardDescription>
              </div>
              <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Lista
              </Button>
           </CardHeader>
           <CardContent>
             {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
             )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Acceso</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                    </TableRow>
                  ) : entries.length > 0 ? entries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>
                          {entry.type === 'user' ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </TableCell>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: accessLevelColors[entry.access] }} className="text-white">{entry.access}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEntry(entry.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">Aún no has añadido ninguna entrada.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reglas Generadas</CardTitle>
          <CardDescription>Copia este contenido y pégalo en tu archivo `firestore.rules`.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-full gap-4">
          <Textarea
            readOnly
            value={generatedRules}
            className="flex-grow h-[calc(100vh-20rem)] font-mono text-xs resize-none"
            placeholder="Haz clic en 'Generar Reglas' para crear las reglas de seguridad."
          />
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">Generar Reglas</Button>
            <Button onClick={handleCopy} variant="secondary" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copiar Reglas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
