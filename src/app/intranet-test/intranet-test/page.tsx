
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
        title: "Dades Carregades",
        description: "Les dades del servei intern s'han carregat correctament.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error en la Càrrega",
        description: error.message || "No s'han pogut carregar les dades del servei intern.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test de Crida a Intranet</CardTitle>
          <CardDescription>
            Aquesta pàgina demostra com fer una crida a un servei intern (intranet)
            de manera segura a través d'un Genkit Flow que s'executa al servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button onClick={handleFetchData} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregant...
                </>
              ) : (
                "Carregar Dades del Servei Intern"
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              La URL del servei està configurada a la variable d'entorn `INTRANET_API_URL`.
            </p>
          </div>

          {data && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Resultats Obtinguts:</h3>
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
