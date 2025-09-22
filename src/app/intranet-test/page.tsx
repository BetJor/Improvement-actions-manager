
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getIntranetData, type IntranetData } from "@/ai/flows/getIntranetData";
import { useToast } from "@/hooks/use-toast";

export default function IntranetTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IntranetData | null>(null);
  const { toast } = useToast();

  const handleFetchData = async () => {
    setIsLoading(true);
    setData(null);
    try {
      const result = await getIntranetData();
      setData(result);
      toast({
        title: "Datos Cargados",
        description: "Los datos del servicio interno se han cargado correctamente.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error en la Carga",
        description: error.message || "No se han podido cargar los datos del servicio interno.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test de Llamada a Intranet</CardTitle>
          <CardDescription>
            Esta página demuestra cómo hacer una llamada a un servicio interno (intranet)
            de forma segura a través de un Genkit Flow que se ejecuta en el servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button onClick={handleFetchData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                "Cargar Datos del Servicio Interno"
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              La URL del servicio está configurada en la variable de entorno `INTRANET_API_URL`.
            </p>
          </div>

          {data && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Resultados Obtenidos:</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
