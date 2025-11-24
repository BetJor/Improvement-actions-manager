"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Terminal, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { getWorkspaceUsers } from "@/services/google-workspace";
import type { User } from '@/lib/types';
import { useVirtualizer } from "@tanstack/react-virtual";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function ErrorDisplay({ error }: { error: string | null }) {
    if (!error) return null;

    return (
        <Alert variant="destructive" className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error d'Importació</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
}

interface UserImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (selectedUsers: User[]) => void;
  existingUsers: User[];
}

export function UserImportDialog({ isOpen, onClose, onImport, existingUsers }: UserImportDialogProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedUsers([]);
      setSearchTerm("");
      setError(null);

      setIsLoading(true);
      getWorkspaceUsers('costaisa.com')
        .then((usersFromApi) => {
          const existingUserEmails = new Set(existingUsers.map(u => u.email));
          const mappedUsers: User[] = usersFromApi
            .map((u: any) => ({
              id: u.id || `unknown-${Math.random()}`,
              name: u.name?.fullName || 'N/A',
              email: u.primaryEmail || 'N/A',
              avatar: u.thumbnailPhotoUrl || `https://picsum.photos/seed/${u.id}/40/40`,
            }))
            .filter(u => u.email && !existingUserEmails.has(u.email));

          setAllUsers(mappedUsers);
        })
        .catch((err) => {
          console.error("Failed to fetch Google Users:", err);
          setError(err.message || "No s'han pogut carregar els usuaris des de Google Workspace.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, existingUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return allUsers;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(lowerSearch) ||
      u.email.toLowerCase().includes(lowerSearch)
    );
  }, [allUsers, searchTerm]);

  const rowVirtualizer = useVirtualizer({
    count: isMounted ? filteredUsers.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });

  const handleSelectUser = (user: User, checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  const handleImportClick = async () => {
    setIsImporting(true);
    setError(null);
    try {
        await onImport(selectedUsers);
        onClose();
    } catch (e: any) {
        setError(e.message || "Hi ha hagut un error en importar els usuaris.");
    } finally {
        setIsImporting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers([...filteredUsers]);
    }
  };

  const isAllSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
            <DialogTitle>Importar Usuaris des de Google Workspace</DialogTitle>
            <DialogDescription>
                Selecciona els usuaris que vols afegir a l'aplicació. {allUsers.length > 0 && `(${allUsers.length} usuaris disponibles)`}
            </DialogDescription>
            </DialogHeader>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cercar per nom o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                />
            </div>

            <ErrorDisplay error={error} />

            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  {filteredUsers.length} usuaris {searchTerm && "(filtrats)"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isLoading}
                >
                  {isAllSelected ? "Deseleccionar tots" : "Seleccionar tots"}
                </Button>
              </div>
            )}

            <div
              ref={parentRef}
              className="h-96 mt-2 border rounded-md overflow-auto"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground mt-2">Carregant usuaris...</span>
                </div>
              ) : !isMounted ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const user = filteredUsers[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="px-4 py-1"
                      >
                        <div className="flex items-start space-x-3 py-2">
                          <Checkbox
                            id={`user-${user.id}`}
                            onCheckedChange={(checked) => handleSelectUser(user, checked)}
                            checked={selectedUsers.some(u => u.id === user.id)}
                          />
                          <label htmlFor={`user-${user.id}`} className="flex items-center gap-3 cursor-pointer flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-sm text-muted-foreground">{user.email}</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  {allUsers.length === 0 ? "No hi ha usuaris disponibles per importar." : "No s'han trobat usuaris amb aquest criteri de cerca."}
                </div>
              )}
            </div>

            <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isImporting}>
                Cancel·lar
            </Button>
            <Button onClick={handleImportClick} disabled={selectedUsers.length === 0 || isImporting}>
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Importar ({selectedUsers.length})
            </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}