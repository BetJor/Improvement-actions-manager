"use client"

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
import type { ImprovementAction } from "@/lib/types"
import { useMemo } from "react"
import { Activity, CheckCircle, Clock, FileText, ListTodo } from "lucide-react"

interface DashboardClientProps {
  actions: ImprovementAction[]
}

const COLORS = {
  Borrador: "hsl(var(--chart-5))",
  "Pendiente Análisis": "hsl(var(--chart-4))",
  "Pendiente Comprobación": "hsl(var(--chart-2))",
  "Pendiente de Cierre": "hsl(var(--chart-3))",
  Finalizada: "hsl(var(--chart-1))",
};


export function DashboardClient({ actions }: DashboardClientProps) {
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
    value: { label: "Actions" },
    ...Object.keys(COLORS).reduce((acc, key) => {
      acc[key] = { label: key, color: COLORS[key as keyof typeof COLORS] };
      return acc;
    }, {} as any)
  };


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Actions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finalized Actions</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.finalized}</div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.drafts}</div>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Actions by Status</CardTitle>
          <CardDescription>Distribution of actions across different workflow statuses.</CardDescription>
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
          <CardTitle>Actions by Type</CardTitle>
          <CardDescription>Breakdown of actions by their designated type.</CardDescription>
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
  )
}
