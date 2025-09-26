
"use client"
import React, { useMemo, useState } from 'react';
import { useActionState } from '@/hooks/use-action-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ImprovementAction } from '@/lib/types';
import { differenceInDays, parseISO, format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Users, FileText, Clock } from 'lucide-react';

function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <Skeleton className="h-10 w-1/3 mb-4" />
            <Card><CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle></CardHeader><CardContent><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div></CardContent></Card>
            <Card><CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle></CardHeader><CardContent><Skeleton className="h-80 w-full" /></CardContent></Card>
        </div>
    );
}
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884D8', '#FF5733', '#C70039'];
type GroupByOption = 'phase' | 'type' | 'status' | 'center';

export function ReportsClient() {
    const { actions, isLoading, error } = useActionState();
    const [groupBy, setGroupBy] = useState<GroupByOption>('phase');

    const { 
        globalStats,
        typeStats,
        pieChartData,
        efficiencyStats,
        qualityStats
    } = useMemo(() => {
        if (!actions || actions.length === 0) return { globalStats: null, typeStats: [], pieChartData: [], efficiencyStats: null, qualityStats: null };

        const finalizedActions = actions.filter(a => a.status === 'Finalizada' && a.closure?.date);
        const compliantActions = finalizedActions.filter(a => a.closure?.isCompliant === true).length;
        const globalStats = { totalActions: actions.length, activeActions: actions.length - finalizedActions.length, totalFinalized: finalizedActions.length, compliantActions };

        const actionsByType = actions.reduce((acc, action) => { const type = action.type || 'Sin Tipo'; if (!acc[type]) acc[type] = []; acc[type].push(action); return acc; }, {} as Record<string, ImprovementAction[]>);
        const typeStats = Object.keys(actionsByType).map(type => { const typeActions = actionsByType[type]; const finalized = typeActions.filter(a => a.status === 'Finalizada'); const compliant = finalized.filter(a => a.closure?.isCompliant === true).length; const successRate = finalized.length > 0 ? (compliant / finalized.length) * 100 : 0; return { name: type, total: typeActions.length, active: typeActions.length - finalized.length, successRate: Math.round(successRate) }; });
        const pieChartData = Object.keys(actionsByType).map(type => ({ name: type, value: actionsByType[type].length }));

        const resolutionTimes = finalizedActions.length > 0 ? finalizedActions.map(a => differenceInDays(parseISO(a.closure!.date), parseISO(a.creationDate))) : [0];
        const totalResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0);
        const firstAttemptActions = actions.filter(a => !a.originalActionId);
        const successfulFirstAttempt = firstAttemptActions.filter(a => a.status === 'Finalizada' && a.closure?.isCompliant).length;
        const firstDate = actions.length > 0 ? actions.reduce((min, a) => a.creationDate < min ? a.creationDate : min, actions[0].creationDate) : new Date().toISOString();
        const monthlyFlow = eachMonthOfInterval({ start: startOfMonth(parseISO(firstDate)), end: endOfMonth(new Date()) }).map(month => ({ name: format(month, 'MMM yy'), opened: 0, closed: 0 }));
        const monthlyFlowMap = monthlyFlow.reduce((acc, item) => ({...acc, [item.name]: item }), {});
        actions.forEach(action => { const openedMonth = format(parseISO(action.creationDate), 'MMM yy'); if(monthlyFlowMap[openedMonth]) monthlyFlowMap[openedMonth].opened++; if(action.status === 'Finalizada' && action.closure?.date){ const closedMonth = format(parseISO(action.closure.date), 'MMM yy'); if(monthlyFlowMap[closedMonth]) monthlyFlowMap[closedMonth].closed++; } });
        const efficiencyStats = { avgResolutionTime: finalizedActions.length > 0 ? Math.round(totalResolutionTime / finalizedActions.length) : 0, maxResolutionTime: Math.max(...resolutionTimes), firstAttemptSuccessRate: firstAttemptActions.length > 0 ? Math.round((successfulFirstAttempt / firstAttemptActions.length) * 100) : 0, monthlyFlow: Object.values(monthlyFlowMap) };

        const problemCounts = actions.reduce((acc, action) => { const title = action.title.trim(); acc[title] = (acc[title] || 0) + 1; return acc; }, {} as Record<string, number>);
        const top5Problems = Object.entries(problemCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
        const qualityStats = { top5Problems };

        return { globalStats, typeStats, pieChartData, efficiencyStats, qualityStats };
    }, [actions]);

    const mainChartData = useMemo(() => { if (!actions || !globalStats) return []; const groupAndCount = (keyAccessor: (action: ImprovementAction) => string | undefined) => { const grouped = actions.reduce((acc, action) => { const key = keyAccessor(action) || 'No Especificado'; acc[key] = (acc[key] || 0) + 1; return acc; }, {} as Record<string, number>); return Object.entries(grouped).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] })); }; switch (groupBy) { case 'type': return groupAndCount(a => a.type); case 'center': return groupAndCount(a => a.center); case 'status': return groupAndCount(a => a.status); case 'phase': default: const { compliantActions, totalFinalized } = globalStats; const nonCompliantActions = totalFinalized - compliantActions; return [ { name: 'Borrador/Análisis', value: actions.filter(a => ['Borrador', 'Pendiente Análisis'].includes(a.status)).length, fill: '#f59e0b' }, { name: 'Comprob./Cierre', value: actions.filter(a => ['Pendiente Comprobación', 'Pendiente de Cierre'].includes(a.status)).length, fill: '#3b82f6' }, { name: 'Finalizadas OK', value: compliantActions, fill: '#22c55e' }, { name: 'Finalizadas KO', value: nonCompliantActions, fill: '#ef4444' }, ]; } }, [actions, groupBy, globalStats]);

    if (isLoading) return <DashboardSkeleton />;
    if (error || !globalStats || !efficiencyStats || !qualityStats) return <div className="p-8"><Card><CardHeader><CardTitle>No hay datos</CardTitle></CardHeader><CardContent><p>Actualmente no hay acciones en el sistema para mostrar informes.</p></CardContent></Card></div>;

    return (
        <div className="p-4 md:p-8">
            <Tabs defaultValue="efficiency" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="efficiency">Análisis de Eficiencia</TabsTrigger>
                    <TabsTrigger value="quality">Análisis de Calidad e Impacto</TabsTrigger>
                    <TabsTrigger value="adoption">Uso y Adopción</TabsTrigger>
                </TabsList>

                {/* PESTAÑA 1: EFICIENCIA */}
                <TabsContent value="efficiency" className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Visión General</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Acciones</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{globalStats.totalActions}</p></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Activas</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{globalStats.activeActions}</p></CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Finalizadas</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{globalStats.totalFinalized}</p></CardContent></Card>
                            <Card className={globalStats.totalFinalized > 0 && globalStats.compliantActions / globalStats.totalFinalized < 0.8 ? "border-red-500" : "border-green-500"}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tasa de Éxito Global (%)</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{globalStats.totalFinalized > 0 ? `${((globalStats.compliantActions / globalStats.totalFinalized) * 100).toFixed(0)}%` : 'N/D'}</p></CardContent></Card>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Análisis de Eficiencia</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card className="bg-slate-50"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tiempo Medio de Resolución</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{efficiencyStats.avgResolutionTime} días</p></CardContent></Card>
                                <Card className="bg-slate-50"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tiempo Máximo de Resolución</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{efficiencyStats.maxResolutionTime} días</p></CardContent></Card>
                                <Card className="bg-slate-50"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Resolución al 1er Intento</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{efficiencyStats.firstAttemptSuccessRate}%</p></CardContent></Card>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-center text-sm text-muted-foreground">Flujo Mensual: Aperturas vs. Cierres</h4>
                                <ResponsiveContainer width="100%" height={250}><LineChart data={efficiencyStats.monthlyFlow} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize: 12}}/><YAxis allowDecimals={false}/><Tooltip /><Legend /><Line type="monotone" dataKey="opened" name="Nuevas" stroke="#f59e0b" strokeWidth={2} /><Line type="monotone" dataKey="closed" name="Cerradas" stroke="#22c55e" strokeWidth={2} /></LineChart></ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Análisis de Datos</CardTitle>
                            <div className="flex items-center gap-2"><span className="text-sm font-medium text-muted-foreground">Agrupar por</span><Select value={groupBy} onValueChange={(value: GroupByOption) => setGroupBy(value)}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="phase">Fase</SelectItem><SelectItem value="type">Tipo</SelectItem><SelectItem value="status">Estado</SelectItem><SelectItem value="center">Centro</SelectItem></SelectContent></Select></div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3"><ResponsiveContainer width="100%" height={350}><BarChart data={mainChartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 12}} angle={-15} textAnchor="end" interval={0} /><YAxis allowDecimals={false}/><Tooltip cursor={{fill: 'rgba(240, 240, 240, 0.5)'}}/><Bar dataKey="value" name="Nº Acciones">{mainChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar></BarChart></ResponsiveContainer></div>
                            <div className="lg:col-span-2"><h4 className="font-semibold mb-2 text-center text-sm text-muted-foreground">Distribución por Tipo</h4><ResponsiveContainer width="100%" height={350}><PieChart><Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Resumen por Tipo de Acción</CardTitle></CardHeader>
                        <CardContent><Table><TableHeader><TableRow><TableHead>Tipo de Acción</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Activas</TableHead><TableHead className="text-right">Tasa Éxito</TableHead></TableRow></TableHeader><TableBody>{typeStats.map(stat => (<TableRow key={stat.name}><TableCell className="font-medium">{stat.name}</TableCell><TableCell className="text-right">{stat.total}</TableCell><TableCell className="text-right">{stat.active}</TableCell><TableCell className="text-right font-semibold">{stat.successRate}%</TableCell></TableRow>))}</TableBody></Table></CardContent>
                    </Card>
                </TabsContent>

                {/* PESTAÑA 2: CALIDAD E IMPACTO */}
                <TabsContent value="quality" className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Análisis de Problemas Recurrentes</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-4 text-center text-sm text-muted-foreground">Top 5 - Problemas Más Frecuentes</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart layout="vertical" data={qualityStats.top5Problems} margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12 }} interval={0} />
                                        <Tooltip wrapperStyle={{ zIndex: 1000, whiteSpace: 'normal', width: 300 }} />
                                        <Legend />
                                        <Bar dataKey="value" name="Ocurrencias" fill="#8884d8">
                                            {qualityStats.top5Problems.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Evolución de Incidencias</CardTitle></CardHeader>
                        <CardContent>
                            <h4 className="font-semibold mb-4 text-center text-sm text-muted-foreground">Nuevas Acciones Creadas por Mes</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={efficiencyStats.monthlyFlow} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="name" tick={{fontSize: 12}}/>
                                    <YAxis allowDecimals={false}/>
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="opened" name="Nuevas incidencias" stroke="#f59e0b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PESTAÑA 3: USO Y ADOPCIÓN */}
                <TabsContent value="adoption" className="space-y-8">
                    <Card>
                        <CardHeader><CardTitle>Indicadores Clave de Adopción</CardTitle></CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Usuarios Activos (Mensual)</CardTitle>
                                    <Users className="h-5 w-5 text-blue-600" />
                                </CardHeader>
                                <CardContent><p className="text-3xl font-bold">N/D</p><p className="text-xs text-muted-foreground">Requiere integración con Analytics</p></CardContent>
                            </Card>
                             <Card className="bg-green-50 border-green-200">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Reportes Generados</CardTitle>
                                    <FileText className="h-5 w-5 text-green-600" />
                                </CardHeader>
                                <CardContent><p className="text-3xl font-bold">N/D</p><p className="text-xs text-muted-foreground">Requiere integración con Analytics</p></CardContent>
                            </Card>
                             <Card className="bg-orange-50 border-orange-200">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">Tiempo Medio de Sesión</CardTitle>
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </CardHeader>
                                <CardContent><p className="text-3xl font-bold">N/D</p><p className="text-xs text-muted-foreground">Requiere integración con Analytics</p></CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-200">
                         <CardHeader><CardTitle className="text-amber-800">Próximo Paso: Integración de Analíticas</CardTitle></CardHeader>
                         <CardContent>
                            <div className="text-sm text-amber-900">
                                <p>Estos indicadores miden cómo los usuarios interactúan con la aplicación. Para obtener datos reales, es necesario integrar un servicio de analítica de producto.</p>
                                <br/>
                                <p><strong>Recomendación:</strong> Integrar la aplicación con <a href="https://firebase.google.com/docs/analytics" target="_blank" rel="noopener noreferrer" className="font-bold underline">Google Analytics para Firebase</a>. Esta herramienta le permitirá registrar eventos, monitorizar la actividad de los usuarios en tiempo real y entender la adopción de la herramienta en su organización.</p>
                                <p className="mt-2">Una vez integrado, podremos visualizar aquí los datos reales de uso.</p>
                            </div>
                         </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
