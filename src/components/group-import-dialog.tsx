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
import { getWorkspaceGroups } from "@/services/google-workspace";
import type { UserGroup } from "@/lib/types";
import { useVirtualizer } from "@tanstack/react-virtual";


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

interface GroupImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (selectedGroups: UserGroup[]) => void;
  existingGroups: UserGroup[];
}

export function GroupImportDialog({ isOpen, onClose, onImport, existingGroups }: GroupImportDialogProps) {
  const [allGroups, setAllGroups] = useState<UserGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted on client before initializing virtualizer
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load all groups when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setSelectedGroups([]);
      setSearchTerm("");
      setError(null);

      // Fetch all groups from Google Workspace
      setIsLoading(true);
      getWorkspaceGroups()
        .then((groupsFromApi) => {
          const existingGroupEmails = new Set(existingGroups.map(g => g.id));
          const mappedGroups: UserGroup[] = groupsFromApi
            .map((g: any) => ({
              id: g.email, // Use email as the main ID
              name: g.name,
              userIds: []
            }))
            .filter(g => g.id && !existingGroupEmails.has(g.id));

          setAllGroups(mappedGroups);
        })
        .catch((err) => {
          console.error("Failed to fetch Google Groups:", err);
          setError(err.message || "No s'han pogut carregar els grups des de Google Workspace.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, existingGroups]);

  // Filter groups based on search term (client-side)
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) {
      return allGroups;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return allGroups.filter(g =>
      g.name.toLowerCase().includes(lowerSearch) ||
      g.id.toLowerCase().includes(lowerSearch)
    );
  }, [allGroups, searchTerm]);

  // Setup virtualizer (only on client-side after mount)
  const rowVirtualizer = useVirtualizer({
    count: isMounted ? filteredGroups.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
  });


  const handleSelectGroup = (group: UserGroup, checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedGroups((prev) => [...prev, group]);
    } else {
      setSelectedGroups((prev) => prev.filter((g) => g.id !== group.id));
    }
  };

  const handleImportClick = async () => {
    setIsImporting(true);
    setError(null);
    try {
        await onImport(selectedGroups);
        onClose();
    } catch (e: any) {
        setError(e.message || "Hi ha hagut un error en importar els grups.");
    } finally {
        setIsImporting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedGroups.length === filteredGroups.length) {
      // Deselect all
      setSelectedGroups([]);
    } else {
      // Select all filtered groups
      setSelectedGroups([...filteredGroups]);
    }
  };

  const isAllSelected = filteredGroups.length > 0 && selectedGroups.length === filteredGroups.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
            <DialogTitle>Importar Grups des de Google Workspace</DialogTitle>
            <DialogDescription>
                Selecciona els grups que vols afegir a l'aplicació. {allGroups.length > 0 && `(${allGroups.length} grups disponibles)`}
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

            {filteredGroups.length > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  {filteredGroups.length} grups {searchTerm && "(filtrats)"}
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
                  <span className="ml-2 text-sm text-muted-foreground mt-2">Carregant grups...</span>
                </div>
              ) : !isMounted ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredGroups.length > 0 ? (
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const group = filteredGroups[virtualRow.index];
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
                            id={`group-${group.id}`}
                            onCheckedChange={(checked) => handleSelectGroup(group, checked)}
                            checked={selectedGroups.some(g => g.id === group.id)}
                          />
                          <label htmlFor={`group-${group.id}`} className="flex flex-col cursor-pointer flex-1">
                            <span className="font-medium">{group.name}</span>
                            <span className="text-sm text-muted-foreground">{group.id}</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  {allGroups.length === 0 ? "No hi ha grups disponibles per importar." : "No s'han trobat grups amb aquest criteri de cerca."}
                </div>
              )}
            </div>

            <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isImporting}>
                Cancel·lar
            </Button>
            <Button onClick={handleImportClick} disabled={selectedGroups.length === 0 || isImporting}>
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Importar ({selectedGroups.length})
            </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
