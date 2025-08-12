
"use client"

import type { ImprovementAction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface LinkedActionSectionProps {
  action: ImprovementAction
}

export function LinkedActionSection({ action }: LinkedActionSectionProps) {
  const params = useParams()

  if (!action.originalActionId) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Acció Original (BIS)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Aquesta acció es va crear a partir del tancament no conforme de l'acció:</p>
        <p className="font-semibold">{action.originalActionTitle}</p>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/${params.locale}/actions/${action.originalActionId}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Veure Acció Original
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
