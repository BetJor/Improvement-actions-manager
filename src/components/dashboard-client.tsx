
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '@/hooks/use-auth';
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
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"
import { Activity, CheckCircle, FileText, ListTodo, GanttChartSquare, GripVertical, Star } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ActionStatusBadge } from "./action-status-badge"
import { Button } from "./ui/button"
import { useTabs } from "@/hooks/use-tabs"
import { getActionById, getActionTypes, getCategories, getCenters, getResponsibilityRoles, getSubcategories, getAffectedAreas, toggleFollowAction, getFollowedActions } from "@/lib/data"
import { ActionDetailsTab } from "./action-details-tab"
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useFollowAction } from '@/hooks/use-follow-action';

const COLORS = {
  Borrador: "hsl(var(--chart-5))",
  "Pendiente Análisis": "hsl(var(--chart-4))",
  "Pendiente Comprobación": "hsl(var(--chart-2))",
  "Pendiente de Cierre": "hsl(var(--chart-3))",
  Finalizada: "hsl(var(--chart-1))",
};

interface DashboardClientProps {
    actions: ImprovementAction[];
    assignedActions: ImprovementAction[];
    initialFollowedActions: ImprovementAction[];
    t: any;
}

const defaultLayout = ["pendingActions", "followedActions", "charts"];

function SortableItem({ id, children }: { id: string, children: React.ReactNode }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({id});
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    
    return (
      <div ref={setNodeRef} style={style} className="relative">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="absolute top-2 right-2 cursor-grab h-8 w-8 text-muted-foreground z-10">
           <GripVertical className="h-5 w-5" />
        </Button>
        {children}
      </div>
    );
}


export function DashboardClient({ actions: initialActions, assignedActions: initialAssignedActions, initialFollowedActions, t }: DashboardClientProps) {
  const { openTab } = useTabs();
  const { user, updateDashboardLayout } = useAuth();
  const [items, setItems] = useState<string[]>(user?.dashboardLayout || defaultLayout);
  
  const [allActions, setAllActions] = useState(initialActions);
  const [assignedActions, setAssignedActions] = useState(initialAssignedActions);
  const [followedActions, setFollowedActions] = useState(initialFollowedActions);

  const { handleToggleFollow: handleFollowAssigned, isFollowing: isFollowingAssigned } = useFollowAction(assignedActions, setAssignedActions);
  const { handleToggleFollow: handleFollowGeneral, isFollowing: isFollowingGeneral } = useFollowAction(allActions, setAllActions);

  useEffect(() => {
    // Sync with user layout if it changes (e.g. on login)
    setItems(user?.dashboardLayout || defaultLayout);
  }, [user?.dashboardLayout]);

  useEffect(() => {
    setAllActions(initialActions);
    setAssignedActions(initialAssignedActions);
    setFollowedActions(initialFollowedActions);
  }, [initialActions, initialAssignedActions, initialFollowedActions]);
  
  useEffect(() => {
    // When the list of all actions is updated (e.g. an action is followed/unfollowed elsewhere),
    // update the followedActions list.
    if(user) {
        setFollowedActions(allActions.filter(a => a.followers?.includes(user.id)));
    }
  }, [allActions, user]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id as string);
        const newIndex = currentItems.indexOf(over.id as string);
        const newOrder = arrayMove(currentItems, oldIndex, newIndex);
        
        // Persist the new order
        if(user) updateDashboardLayout(newOrder);

        return newOrder;
      });
    }
  }

  const handleOpenAction = (e: React.MouseEvent, action: ImprovementAction) => {
    e.preventDefault();
    const actionLoader = async () => {
      const actionData = await getActionById(action.id);
      if (!actionData) throw new Error("Action not found");
      const [types, cats, subcats, areas, centers, roles] = await Promise.all([
          getActionTypes(), getCategories(), getSubcategories(), getAffectedAreas(), getCenters(), getResponsibilityRoles(),
      ]);
      const masterData = { actionTypes: types, categories: cats, subcategories: subcats, affectedAreas: areas, centers: centers, responsibilityRoles: roles };
      return <ActionDetailsTab initialAction={actionData} masterData={masterData} />;
    };
    openTab({ path: `/actions/${action.id}`, title: `Acció ${action.actionId}`, icon: GanttChartSquare, isClosable: true, loader: actionLoader });
  }

  const statusDistribution = useMemo(() => {
    const counts = allActions.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [allActions]);

  const typeDistribution = useMemo(() => {
    const counts = allActions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [allActions]);
  
  const chartConfig = useMemo(() => ({
    value: { label: t.chartLabel },
    ...Object.keys(COLORS).reduce((acc, key) => {
      acc[key] = { label: key, color: COLORS[key as keyof typeof COLORS] };
      return acc;
    }, {} as any)
  }), [t.chartLabel]);

  const handleUnfollowFromDashboard = (actionId: string, e: React.MouseEvent) => {
    // This function will be used by both tables, so it needs to update both lists.
    handleFollowGeneral(actionId, e);
    handleFollowAssigned(actionId, e);
    setFollowedActions(prev => prev.filter(action => action.id !== actionId));
  };


  const widgets: { [key: string]: React.ReactNode } = {
    pendingActions: (
      <Card className="col-span-full">
        <CardHeader><CardTitle>{t.myPendingActions.title}</CardTitle><CardDescription>{t.myPendingActions.description}</CardDescription></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead className="w-12"></TableHead><TableHead>{t.myPendingActions.col.id}</TableHead><TableHead>{t.myPendingActions.col.title}</TableHead><TableHead>{t.myPendingActions.col.status}</TableHead></TableRow></TableHeader>
            <TableBody>
              {assignedActions.length > 0 ? (
                assignedActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleUnfollowFromDashboard(action.id, e)}
                        title={isFollowingAssigned(action.id) ? t.followedActions.unfollow : "Seguir acció"}
                      >
                        <Star className={cn("h-4 w-4", isFollowingAssigned(action.id) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                      </Button>
                    </TableCell>
                    <TableCell><Button variant="link" asChild className="p-0 h-auto"><a href={`/actions/${action.id}`} onClick={(e) => handleOpenAction(e, action)}>{action.actionId}</a></Button></TableCell>
                    <TableCell>{action.title}</TableCell>
                    <TableCell><ActionStatusBadge status={action.status} /></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center h-24">{t.myPendingActions.noActions}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    ),
    followedActions: (
      <Card className="col-span-full">
        <CardHeader><CardTitle>{t.followedActions.title}</CardTitle><CardDescription>{t.followedActions.description}</CardDescription></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead className="w-12"></TableHead><TableHead>{t.followedActions.col.id}</TableHead><TableHead>{t.followedActions.col.title}</TableHead><TableHead>{t.followedActions.col.status}</TableHead></TableRow></TableHeader>
            <TableBody>
              {followedActions.length > 0 ? (
                followedActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleUnfollowFromDashboard(action.id, e)}
                        title={t.followedActions.unfollow}
                      >
                        <Star className={cn("h-4 w-4 text-yellow-400 fill-yellow-400")} />
                      </Button>
                    </TableCell>
                    <TableCell><Button variant="link" asChild className="p-0 h-auto"><a href={`/actions/${action.id}`} onClick={(e) => handleOpenAction(e, action)}>{action.actionId}</a></Button></TableCell>
                    <TableCell>{action.title}</TableCell>
                    <TableCell><ActionStatusBadge status={action.status} /></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center h-24">{t.followedActions.noActions}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    ),
    charts: (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
            <CardHeader><CardTitle>{t.actionsByStatus.title}</CardTitle><CardDescription>{t.actionsByStatus.description}</CardDescription></CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart data={statusDistribution} layout="vertical" margin={{ left: 20 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={150} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="value" layout="vertical" radius={5}>{statusDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />))}</Bar></BarChart>
                </ChartContainer>
            </CardContent>
            </Card>
            <Card>
            <CardHeader><CardTitle>{t.actionsByType.title}</CardTitle><CardDescription>{t.actionsByType.description}</CardDescription></CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <PieChart><ChartTooltip content={<ChartTooltipContent />} /><Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--primary))" label>{typeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />)}</Pie><ChartLegend content={<ChartLegendContent nameKey="name" />} /></PieChart>
                </ChartContainer>
            </CardContent>
            </Card>
        </div>
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-6">
                {items.map(id => (
                    widgets[id] ? (
                        <SortableItem key={id} id={id}>
                            {widgets[id]}
                        </SortableItem>
                    ) : null
                ))}
            </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
