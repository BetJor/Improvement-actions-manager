
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
import { useToast } from "@/hooks/use-toast";
import { enrichLocationsWithResponsibles } from "@/services/master-data-service";
import { Loader2, UploadCloud } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DataLoadPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadResponsibles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedCount = await enrichLocationsWithResponsibles();
      toast({
        title: "Càrrega completada",
        description: `S'han actualitzat ${updatedCount} centres amb les dades de responsables.`,
      });
    } catch (err: any) {
      console.error("Error loading responsibles:", err);
      setError("Error en carregar les dades de responsables.");
      toast({
        variant: "destructive",
        title: "Error de càrrega",
        description: "No s'han pogut actualitzar els responsables dels centres.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Càrrega de Dades Manual</CardTitle>
          <CardDescription>
            Aquesta secció permet executar processos de càrrega i actualització de dades a la base de dades.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Alert>
                <UploadCloud className="h-4 w-4" />
                <AlertTitle>Carregar Responsables de Centres</AlertTitle>
                <AlertDescription>
                   <p className="mb-4">
                     Aquest procés actualitzarà tots els centres existents a la base de dades amb la informació de responsables (Dependència, Àrea, Coordinadors, etc.) continguda al fitxer intern. Aquesta operació és segura i es pot executar múltiples vegades.
                   </p>
                    <Button onClick={handleLoadResponsibles} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Carregant..." : "Carregar Responsables de Centres"}
                  </Button>
                </AlertDescription>
            </Alert>
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
