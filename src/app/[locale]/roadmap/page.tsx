
"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { CheckCircle2, CircleDot } from "lucide-react"

  
export default function RoadmapPage() {
    const t = useTranslations("Roadmap");

    const timeline = [
        {
          key: "phase1",
          title: "Fase 1: Configuració Inicial i Estructura",
          duration: "Estimat: 1-2 dies",
          completed_tasks: [
            "Configurar projecte Next.js amb TypeScript i Tailwind CSS.",
            "Estructurar l'aplicació amb el directori App i i18n.",
            "Implementar la disposició principal, incloent-hi la barra lateral i la capçalera."
          ],
          pending_tasks: []
        },
        {
          key: "phase2",
          title: "Fase 2: Autenticació i Gestió d'Usuaris",
          duration: "Estimat: 2-3 dies",
          completed_tasks: [
            "Integrar Firebase Authentication per a l'inici de sessió amb Google.",
            "Crear rutes protegides i gestionar les sessions dels usuaris."
          ],
          pending_tasks: []
        },
        {
          key: "phase3",
          title: "Fase 3: Funcionalitat Principal (Accions de Millora)",
          duration: "Estimat: 3-5 dies",
          completed_tasks: [
            "Crear la pàgina per a veure, filtrar i ordenar les accions de millora.",
            "Desenvolupar el formulari per a crear noves accions de millora.",
            "Implementar la pàgina de detall per a cada acció de millora.",
            "Implementar formularis d'Anàlisi i Verificació per interactuar amb el workflow.",
            "Implementar sistema de comentaris en les accions.",
            "Implementar la pujada de fitxers adjunts (integració amb Firebase Storage)."
          ],
          pending_tasks: []
        },
        {
          key: "phase4",
          title: "Fase 4: Integració d'IA amb Genkit",
          duration: "Estimat: 2-3 dies",
          completed_tasks: [
            "Crear un flux de Genkit per a obtenir els grups d'un usuari (amb dades de mostra).",
            "Implementar el planificador de workflows intel·ligent per a generar planes de treball dinàmics.",
            "Implementar un assistent per a millorar la redacció d'observacions.",
            "Implementar un assistent d'IA per a la proposta d'anàlisi de causes i accions correctives."
          ],
          pending_tasks: [
            "Pendent: Connectar el flux de Genkit a l'API real de Google Groups.",
            "Pendent: Crear un assistent d'IA per a la proposta d'accions correctives."
          ]
        },
        {
          key: "phase5",
          title: "Fase 5: Gestió de Dades Mestres (CRUD)",
          duration: "Estimat: 1-2 dies",
          completed_tasks: [
            "Desenvolupar la pàgina de configuració amb pestanyes per a les taules de dades mestres.",
            "Implementar funcionalitats CRUD (Crear, Llegir, Actualitzar, Esborrar) per a les dades.",
            "Crear la pàgina de configuració dels prompts de l'IA."
          ],
          pending_tasks: []
        },
        {
          key: "phase6",
          title: "Fase 6: Rols i Permisos d'Usuari",
          duration: "Estimat: 3-4 dies",
          completed_tasks: [
            "Definir una estructura de dades a Firestore per a rols i permisos."
          ],
          pending_tasks: [
            "Pendent: Crear un mecanisme per a assignar rols als usuaris (p. ex., en un panell d'administració).",
            "Pendent: Protegir rutes i components de la interfície segons el rol de l'usuari."
          ]
        },
        {
          key: "phase7",
          title: "Fase 7: Subscripcions i Notificacions",
          duration: "Estimat: 3-4 dies",
          completed_tasks: [],
          pending_tasks: [
            "Pendent: Implementar un sistema de subscripció a les accions de millora.",
            "Pendent: Configurar l'enviament de notificacions (p. ex., per email) quan hi hagi actualitzacions rellevants (nous comentaris, canvis d'estat)."
          ]
        },
        {
          key: "phase8",
          title: "Fase 8: Millores d'Experiència d'Usuari (UX)",
          duration: "Estimat: 2-3 dies",
          completed_tasks: [],
          pending_tasks: [
            "Pendent: Implementar la reordenació de les seccions (Detalls, Comentaris, Adjunts) del panell lateral amb 'drag-and-drop' per a desar la preferència de l'usuari."
          ]
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground mt-1">{t("description")}</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Fases del Desenvolupament</CardTitle>
                    <CardDescription>Les grans fites de desenvolupament que ja s'han assolit i les que queden pendents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {timeline.map((phase, index) => (
                      <div key={index} className="relative pl-10">
                         <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold">{index + 1}</span>
                         </div>
                        <h3 className="text-xl font-semibold">{phase.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{phase.duration}</p>
                        
                        <div className="space-y-3">
                            {phase.completed_tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                    <span>{task}</span>
                                </div>
                            ))}
                            {phase.pending_tasks.map((task, taskIndex) => (
                                <div key={taskIndex} className="flex items-start gap-3">
                                    <CircleDot className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                                    <span className="font-semibold">{task}</span>
                                </div>
                            ))}
                        </div>

                      </div>
                    ))}
                </CardContent>
            </Card>
      </div>
    )
  }

    
