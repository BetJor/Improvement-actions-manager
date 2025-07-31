
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
            title: t("prompts.improveWriting.title"),
            description: t("prompts.improveWriting.description"),
            prompt: `Ets un expert en la redacció de documentació per a sistemes de gestió de qualitat (SGC). La teva tasca és millorar la claredat, precisió i professionalitat del text que et proporcionen, que descriu una no-conformitat o una àrea de millora.

            Regles:
            1.  Mantén el significat original del text. No inventis fets ni detalls que no hi siguin presents.
            2.  Utilitza un llenguatge formal, objectiu i tècnic, propi d'un informe de SGC.
            3.  Estructura la descripció de manera lògica: identifica clarament el problema, la seva ubicació o context, i l'evidència observada.
            4.  Elimina ambigüitats, argot o expressions col·loquials.
            5.  La resposta ha de ser únicament el text millorat, sense incloure cap títol, capçalera ni introducció prèvia. Ha de ser una cadena de text pla.
            
            Text a millorar:
            {{{text}}}`
        },
        {
            title: t("prompts.analysisSuggestion.title"),
            description: t("prompts.analysisSuggestion.description"),
            prompt: `Ets un consultor expert en sistemes de gestió de qualitat, especialitzat en l'anàlisi de causes arrel (metodologia 5 Whys, Ishikawa, etc.) i la definició de plans d'acció eficaços.

            A partir de la descripció d'una no-conformitat, has de generar una proposta estructurada en format JSON.
            
            El JSON ha de contenir:
            1.  'causesAnalysis': Un text detallat que explori les possibles causes arrel del problema. Has de considerar factors com processos, persones, materials, maquinària i entorn.
            2.  'proposedActions': Un array d'objectes, on cada objecte representa una acció correctiva específica i accionable. Cada objecte ha de tenir una única clau 'description'.
            
            Regles:
            - Basa't exclusivament en la informació proporcionada a les observacions.
            - Les accions proposades han de ser concretes, realistes i directament relacionades amb les causes identificades.
            - El resultat ha de ser un objecte JSON vàlid, sense cap text addicional ni explicacions.
            
            Observacions del problema a analitzar:
            {{{observations}}}`
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
