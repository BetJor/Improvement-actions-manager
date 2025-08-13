
"use client"

import React, { useMemo } from 'react';
import type { ImprovementAction } from "@/lib/types"
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
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, LabelList } from "recharts"

const COLORS = {
  Borrador: "hsl(var(--chart-5))",
  "Pendiente Análisis": "hsl(var(--chart-4))",
  "Pendiente Comprobación": "hsl(var(--chart-2))",
  "Pendiente de Cierre": "hsl(var(--chart-3))",
  Finalizada: "hsl(var(--chart-1))",
};

interface ReportsClientProps {
    actions: ImprovementAction[];
    t: any;
}

export function ReportsClient({ actions, t }: ReportsClientProps) {

  const statusDistribution = useMemo(() => {
    const counts = actions.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [actions]);

  const typeDistribution = useMemo(() => {
    const counts = actions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [actions]);

  const categoryDistribution = useMemo(() => {
    const counts = actions.reduce((acc, action) => {
        acc[action.category] = (acc[action.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: `hsl(var(--chart-${(Object.keys(counts).indexOf(name) % 5) + 1}))` }));
  }, [actions]);

  const chartConfig = useMemo(() => ({
    value: { label: t.chartLabel },
    ...Object.keys(COLORS).reduce((acc, key) => {
      acc[key] = { label: key, color: COLORS[key as keyof typeof COLORS] };
      return acc;
    }, {} as any)
  }), [t.chartLabel]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">{t.description}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
        <CardHeader>
            <CardTitle>{t.actionsByStatus.title}</CardTitle>
            <CardDescription>{t.actionsByStatus.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={statusDistribution} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" layout="vertical" radius={5}>
                    {statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                    <LabelList dataKey="value" position="right" offset={8} className="fill-foreground" fontSize={12} />
                </Bar>
            </BarChart>
            </ChartContainer>
        </CardContent>
        </Card>
        <Card>
        <CardHeader>
            <CardTitle>{t.actionsByType.title}</CardTitle>
            <CardDescription>{t.actionsByType.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideIndicator />} />
                <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--primary))">
                    {typeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index % 5 + 1}))`} />)}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
            </ChartContainer>
        </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>{t.actionsByCategory.title}</CardTitle>
            <CardDescription>{t.actionsByCategory.description}</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                <BarChart data={categoryDistribution} margin={{ top: 20 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                    <Bar dataKey="value" radius={8} />
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
