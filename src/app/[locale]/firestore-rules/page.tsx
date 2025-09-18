
"use client";

import { useState } from "react";
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
import { Copy, PlusCircle, Trash2, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type AclEntryType = "user" | "group";
type AclAccessLevel = "No Access" | "Reader" | "Author" | "Editor" | "Manager";

interface AclEntry {
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

  const userRules = entries
    .filter(e => e.type === 'user')
    .map(e => `
      // ${e.name} (${e.access})
      allow read: if request.auth.token.email == "${e.name}" && ${getReadPermission(e.access)};
      allow write: if request.auth.token.email == "${e.name}" && ${getWritePermission(e.access)};
      allow delete: if request.auth.token.email == "${e.name}" && ${getDeletePermission(e.access)};
    `).join('').trim();

  const groupRules = entries
    .filter(e => e.type === 'group')
    .map(e => `
      // Group: ${e.name} (${e.access})
      allow read: if get(/databases/$(database)/documents/groups/${e.name}).data.members.hasAny([request.auth.uid]) && ${getReadPermission(e.access)};
      allow write: if get(/databases/$(database)/documents/groups/${e.name}).data.members.hasAny([request.auth.uid]) && ${getWritePermission(e.access)};
      allow delete: if get(/databases/$(database)/documents/groups/${e.name}).data.members.hasAny([request.auth.uid]) && ${getDeletePermission(e.access)};
    `).join('').trim();

  return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Example for a collection 'actions'
    match /actions/{actionId} {
      ${userRules}
      ${groupRules}

      // Default deny
      allow read, write, delete: if false;
    }
  }
}
  `.trim();
};


export default function FirestoreRulesGeneratorPage() {
  const t = useTranslations("FirestoreRules");
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<AclEntry[]>([]);
  const [newEntry, setNewEntry] = useState({ name: "", type: "user" as AclEntryType, access: "Reader" as AclAccessLevel });
  const [generatedRules, setGeneratedRules] = useState("");

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
  
  const handleGenerate = () => {
    const rules = generateFirestoreRules(entries);
    setGeneratedRules(rules);
    toast({ title: t("toast.generateSuccessTitle") });
  };
  
  const handleCopy = () => {
    if (!generatedRules) {
      toast({ variant: "destructive", title: "Error", description: "Primer has de generar les regles."});
      return;
    }
    navigator.clipboard.writeText(generatedRules);
    toast({ title: t("toast.copySuccessTitle") });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex gap-2">
                 <Input
                    placeholder={t("form.entryNamePlaceholder")}
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                    className="flex-grow"
                  />
                  <Select value={newEntry.type} onValueChange={(v) => setNewEntry({ ...newEntry, type: v as AclEntryType })}>
                      <SelectTrigger className="w-[120px]">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="user">{t("form.typeUser")}</SelectItem>
                          <SelectItem value="group">{t("form.typeGroup")}</SelectItem>
                      </SelectContent>
                  </Select>
                   <Select value={newEntry.access} onValueChange={(v) => setNewEntry({ ...newEntry, access: v as AclAccessLevel })}>
                      <SelectTrigger className="w-[150px]">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="No Access">{t("form.access.noAccess")}</SelectItem>
                          <SelectItem value="Reader">{t("form.access.reader")}</SelectItem>
                          <SelectItem value="Author">{t("form.access.author")}</SelectItem>
                          <SelectItem value="Editor">{t("form.access.editor")}</SelectItem>
                          <SelectItem value="Manager">{t("form.access.manager")}</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <Button onClick={handleAddEntry} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("buttons.add")}
              </Button>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
              <CardTitle>{t("aclListTitle")}</CardTitle>
           </CardHeader>
           <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("col.type")}</TableHead>
                    <TableHead>{t("col.name")}</TableHead>
                    <TableHead>{t("col.access")}</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length > 0 ? entries.map(entry => (
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
                      <TableCell colSpan={4} className="h-24 text-center">{t("noEntries")}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("generatedRulesTitle")}</CardTitle>
          <CardDescription>{t("generatedRulesDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-full gap-4">
          <Textarea
            readOnly
            value={generatedRules}
            className="flex-grow h-[calc(100vh-20rem)] font-mono text-xs resize-none"
            placeholder={t("placeholder")}
          />
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">{t("buttons.generate")}</Button>
            <Button onClick={handleCopy} variant="secondary" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              {t("buttons.copy")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    