
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PromptGalleryPage() {
    const t = useTranslations("PromptGalleryPage");
    const { toast } = useToast();

    const prompts = [
        {
            key: 'createRoadmap',
            title: t("prompts.createRoadmap.title"),
            description: t("prompts.createRoadmap.description"),
            prompt: `Crea una pàgina de Roadmap del projecte a la ruta \`/roadmap\`. Vull que analitzis l'estat actual de l'aplicació per a determinar les fases de desenvolupament que ja estan completades i les que queden pendents. Mostra aquesta informació de manera visual, utilitzant targetes (Card) i icones per a diferenciar les tasques finalitzades (CheckCircle2) de les pendents (CircleDot). Afegeix també un enllaç a aquesta nova pàgina al menú lateral.`
        },
        {
            key: 'createDashboard',
            title: t("prompts.createDashboard.title"),
            description: t("prompts.createDashboard.description"),
            prompt: `Crea una pàgina de Dashboard a la ruta \`/dashboard\`. La pàgina ha de mostrar un conjunt de targetes (Card) amb mètriques clau (KPIs) rellevants per a l'aplicació. Analitza les dades disponibles a \`src/lib/data.ts\` per a extreure estadístiques significatives i mostra-les amb un títol, un valor i una icona a cada targeta. A més, genera un gràfic de barres o circular que representi alguna distribució important de les dades.`
        },
        {
            key: 'integrateGoogleLogin',
            title: t("prompts.integrateGoogleLogin.title"),
            description: t("prompts.integrateGoogleLogin.description"),
            prompt: `Integra l'autenticació d'usuaris amb Google Sign-In utilitzant Firebase. Necessito que creïs tota l'estructura necessària: un fitxer de configuració de Firebase (\`src/lib/firebase.ts\`), un hook d'autenticació (\`src/hooks/use-auth.tsx\`) per gestionar la sessió de l'usuari, una pàgina de login a \`/login\` i un layout protegit (\`src/components/protected-layout.tsx\`) que redirigeixi els usuaris no autenticats a la pàgina de login.`
        }
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
            
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Títol</TableHead>
                                <TableHead>Descripció i Prompt</TableHead>
                                <TableHead className="text-right">Accions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prompts.map((p) => (
                                <TableRow key={p.key}>
                                    <TableCell className="font-semibold align-top">{p.title}</TableCell>
                                    <TableCell>
                                        <p className="text-muted-foreground">{p.description}</p>
                                        <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                                            <code>
                                                {p.prompt}
                                            </code>
                                        </pre>
                                    </TableCell>
                                    <TableCell className="text-right align-top">
                                        <Button variant="outline" size="sm" onClick={() => handleCopy(p.prompt)}>
                                            <Copy className="mr-2 h-4 w-4" /> {t("copy.button")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
