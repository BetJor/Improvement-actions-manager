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
        title: "Carga completada",
        description: `Se han actualizado ${updatedCount} centros con los datos de responsables.`,
      });
    } catch (err: any) {
      console.error("Error loading responsibles:", err);
      setError("Error al cargar los datos de responsables.");
      toast({
        variant: "destructive",
        title: "Error de carga",
        description: "No se han podido actualizar los responsables de los centros.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Carga de Datos Manual</CardTitle>
          <CardDescription>
            Esta sección permite ejecutar procesos de carga y actualización de datos en la base de datos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Alert>
                <UploadCloud className="h-4 w-4" />
                <AlertTitle>Cargar Responsables de Centros</AlertTitle>
                <AlertDescription>
                   <p className="mb-4">
                     Este proceso actualizará todos los centros existentes en la base de datos con la información de responsables (Dependencia, Área, Coordinadores, etc.) contenida en el fichero interno. Esta operación es segura y se puede ejecutar múltiples veces.
                   </p>
                    <Button onClick={handleLoadResponsibles} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? "Cargando..." : "Cargar Responsables de Centros"}
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
