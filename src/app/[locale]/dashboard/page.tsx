
"use client"

import { useEffect, useState, useMemo } from "react"
import { getActions } from "@/lib/data"
import type { ImprovementAction } from "@/lib/types"
import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"
import { Activity, CheckCircle, FileText, ListTodo, Loader2 } from "lucide-react"


const COLORS = {
  Borrador: "hsl(var(--chart-5))",
  "Pendiente Análisis": "hsl(var(--chart-4))",
  "Pendiente Comprobación": "hsl(var(--chart-2))",
  "Pendiente de Cierre": "hsl(var(--chart-3))",
  Finalizada: "hsl(var(--chart-1))",
};


export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActions() {
      setIsLoading(true);
      try {
        const data = await getActions();
        setActions(data);
      } catch (error) {
        console.error("Failed to load actions", error);
        // Optionally show a toast or error message
      } finally {
        setIsLoading(false);
      }
    }
    loadActions();
  }, []);

  const stats = useMemo(() => {
    return {
      total: actions.length,
      pending: actions.filter(a => a.status !== 'Finalizada' && a.status !== 'Borrador').length,
      finalized: actions.filter(a => a.status === 'Finalizada').length,
      drafts: actions.filter(a => a.status === 'Borrador').length,
    }
  }, [actions])

  const statusDistribution = useMemo(() => {
    const counts = actions.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [actions])

  const typeDistribution = useMemo(() => {
    const counts = actions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [actions])
  
  const chartConfig = {
    value: { label: t("chartLabel") },
    ...Object.keys(COLORS).reduce((acc, key) => {
      acc[key] = { label: key, color: COLORS[key as keyof typeof COLORS] };
      return acc;
    }, {} as any)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Carregant dades...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalActions")}</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeActions")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("finalizedActions")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.finalized}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("drafts")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("actionsByStatus.title")}</CardTitle>
            <CardDescription>{t("actionsByStatus.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart data={statusDistribution} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" layout="vertical" radius={5}>
                  {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("actionsByType.title")}</CardTitle>
            <CardDescription>{t("actionsByType.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--primary))" label>
                    {
                      typeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />)
                    }
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
