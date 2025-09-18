
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

  useEffect(() => {
    async function loadEntries() {
        setIsLoading(true);
        try {
            const savedEntries = await getAclEntries();
            setEntries(savedEntries);
            const rules = generateFirestoreRules(savedEntries);
            setGeneratedRules(rules);
        } catch (error) {
            console.error("Failed to load ACL entries from Firestore", error);
            toast({ variant: "destructive", title: "Error", description: "No s'han pogut carregar les entrades de la llista d'accés." });
        } finally {
            setIsLoading(false);
        }
    }
    loadEntries();
  }, [toast]);

  const handleAddEntry = () => {
    if (!newEntry.name) {
      toast({ variant: "destructive", title: "Error", description: "El nom de l'usuari o grup no pot estar buit."});
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
        toast({ title: "Llista Desada!", description: "La llista de control d'accés s'ha desat a Firestore." });
    } catch (error) {
        console.error("Failed to save ACL entries to Firestore", error);
        toast({ variant: "destructive", title: "Error", description: "No s'ha pogut desar la llista d'accés." });
    } finally {
        setIsSaving(false);
    }
  }
  
  const handleGenerate = () => {
    const rules = generateFirestoreRules(entries);
    setGeneratedRules(rules);
    toast({ title: "Regles Generades!" });
  };
  
  const handleCopy = () => {
    if (!generatedRules) {
      toast({ variant: "destructive", title: "Error", description: "Primer has de generar les regles."});
      return;
    }
    navigator.clipboard.writeText(generatedRules);
    toast({ title: "Regles Copiades!", description: "Les regles s'han copiat al porta-retalls." });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generador de Regles d'Accés de Firestore</CardTitle>
            <CardDescription>Afegeix usuaris o grups, assigna'ls un nivell d'accés i genera les regles de seguretat de Firestore per a la teva aplicació.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex gap-2">
                 <Input
                    placeholder="Email de l'usuari o nom del grup..."
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                    className="flex-grow"
                  />
                  <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v as AclEntryType })}>
                      <SelectTrigger className="w-[120px]">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="user">Usuari</SelectItem>
                          <SelectItem value="group">Grup</SelectItem>
                      </SelectContent>
                  </Select>
                   <Select value={newEntry.access} onValueChange={(v) => setNewEntry({ ...newEntry, access: v as AclAccessLevel })}>
                      <SelectTrigger className="w-[150px]">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="No Access">Sense Accés</SelectItem>
                          <SelectItem value="Reader">Lector</SelectItem>
                          <SelectItem value="Author">Autor</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Manager">Gestor</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <Button onClick={handleAddEntry} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Afegir a la Llista
              </Button>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>Llista de Control d'Accés (ACL)</CardTitle>
                <CardDescription>Aquesta llista es desarà a Firestore.</CardDescription>
              </div>
              <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Desar Llista
              </Button>
           </CardHeader>
           <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipus</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Accés</TableHead>
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
                      <TableCell colSpan={4} className="h-24 text-center">Encara no has afegit cap entrada.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Regles Generades</CardTitle>
          <CardDescription>Copia aquest contingut i enganxa'l al teu fitxer `firestore.rules`.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-full gap-4">
          <Textarea
            readOnly
            value={generatedRules}
            className="flex-grow h-[calc(100vh-20rem)] font-mono text-xs resize-none"
            placeholder="Fes clic a 'Generar Regles' per a crear les regles de seguretat."
          />
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">Generar Regles</Button>
            <Button onClick={handleCopy} variant="secondary" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copiar Regles
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
