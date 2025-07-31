
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PromptGalleryPage() {
    const t = useTranslations("PromptGalleryPage");
    const { toast } = useToast();

    const prompts = [
        {
            title: t("prompts.createRoadmap.title"),
            description: t("prompts.createRoadmap.description"),
            prompt: `Crea una pàgina de Roadmap del projecte a la ruta \`/roadmap\`. Vull que analitzis l'estat actual de l'aplicació per a determinar les fases de desenvolupament que ja estan completades i les que queden pendents. Mostra aquesta informació de manera visual, utilitzant targetes (Card) i icones per a diferenciar les tasques finalitzades (CheckCircle2) de les pendents (CircleDot). Afegeix també un enllaç a aquesta nova pàgina al menú lateral.`
        },
        {
            title: t("prompts.createDashboard.title"),
            description: t("prompts.createDashboard.description"),
            prompt: `Crea una pàgina de Dashboard a la ruta \`/dashboard\`. La pàgina ha de mostrar un conjunt de targetes (Card) amb mètriques clau (KPIs) rellevants per a l'aplicació. Analitza les dades disponibles a \`src/lib/data.ts\` per a extreure estadístiques significatives i mostra-les amb un títol, un valor i una icona a cada targeta. A més, genera un gràfic de barres o circular que representi alguna distribució important de les dades.`
        },
    ];

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: t("copy.toastTitle"),
            description: t("copy.toastDescription"),
        });
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground mt-1">{t("description")}</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                {prompts.map((p, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{p.title}</CardTitle>
                            <CardDescription>{p.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                                <code>
                                    {p.prompt}
                                </code>
                            </pre>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" onClick={() => handleCopy(p.prompt)}>
                                <Copy className="mr-2 h-4 w-4" /> {t("copy.button")}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
