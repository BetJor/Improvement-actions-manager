
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
import { Loader2, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function FirestoreRulesPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/firestore-rules");
        if (!response.ok) {
          throw new Error("No s'han pogut carregar les regles de Firestore des del servidor.");
        }
        const data = await response.json();
        setRules(data.rules);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/firestore-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });

      if (!response.ok) {
        throw new Error("No s'han pogut desar les regles de Firestore.");
      }

      toast({
        title: "Regles Desades",
        description: "Les regles de Firestore s'han actualitzat correctament.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor de Regles de Firestore</CardTitle>
        <CardDescription>Edita les regles de seguretat de la base de dades Firestore. Aquests canvis afectaran directament la seguretat de les dades. Fes-ho amb precaució.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="h-[60vh] font-mono text-sm"
              placeholder="Carregant les regles de Firestore..."
            />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desant...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Desar Regles
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
