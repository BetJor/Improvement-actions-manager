
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
import { GanttChartSquare, GripVertical, Star, CheckCircle, FileText, FolderClock, Inbox } from "lucide-react"
import { Button } from "./ui/button"
import { useTabs } from "@/hooks/use-tabs"
import { getActionById, getActionTypes, getCategories, getCenters, getResponsibilityRoles, getSubcategories, getAffectedAreas, toggleFollowAction, getFollowedActions } from "@/lib/data"
import { ActionDetailsTab } from "./action-details-tab"
import { cn } from '@/lib/utils';
import { useFollowAction } from '@/hooks/use-follow-action';
import { useTranslations } from 'next-intl';
import { ActionStatusBadge } from './action-status-badge';

interface DashboardClientProps {
    actions: ImprovementAction[];
    assignedActions: ImprovementAction[];
}

const defaultLayout = ["pendingActions", "followedActions"];

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

const StatCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export function DashboardClient({ actions, assignedActions }: DashboardClientProps) {
  const t = useTranslations("Dashboard");
  const { openTab } = useTabs();
  const { user, updateDashboardLayout } = useAuth();
  const [items, setItems] = useState<string[]>(user?.dashboardLayout || defaultLayout);
  
  const { handleToggleFollow, isFollowing } = useFollowAction();

  const followedActions = useMemo(() => {
    if (!user || !actions) return [];
    return actions.filter(action => action.followers?.includes(user.id));
  }, [actions, user]);

  const stats = useMemo(() => {
      const total = actions.length;
      const finalized = actions.filter(a => a.status === 'Finalizada').length;
      const drafts = actions.filter(a => a.status === 'Borrador').length;
      const active = total - finalized - drafts;
      return { total, active, finalized, drafts };
  }, [actions]);


  useEffect(() => {
    setItems(user?.dashboardLayout || defaultLayout);
  }, [user?.dashboardLayout]);

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

  const widgets: { [key: string]: React.ReactNode } = {
    pendingActions: (
      <Card className="col-span-full xl:col-span-2">
        <CardHeader><CardTitle>{t("myPendingActions.title")}</CardTitle><CardDescription>{t("myPendingActions.description")}</CardDescription></CardHeader>
        <CardContent>
            {assignedActions.length > 0 ? (
                <div className="space-y-4">
                    {assignedActions.map(action => (
                        <div key={action.id} className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleToggleFollow(action.id, e)}
                              title={isFollowing(action.id) ? "Deixar de seguir" : "Seguir acció"}
                            >
                              <Star className={cn("h-5 w-5", isFollowing(action.id) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                            </Button>
                            <div className="grid gap-1 flex-1">
                                <a href={`/actions/${action.id}`} onClick={(e) => handleOpenAction(e, action)} className="font-semibold hover:underline">{action.title}</a>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{action.actionId}</span>
                                    <ActionStatusBadge status={action.status}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (<p className="text-sm text-muted-foreground text-center py-10">{t("myPendingActions.noActions")}</p>)}
        </CardContent>
      </Card>
    ),
    followedActions: (
      <Card className="col-span-full xl:col-span-2">
        <CardHeader><CardTitle>{t("followedActions.title")}</CardTitle><CardDescription>{t("followedActions.description")}</CardDescription></CardHeader>
        <CardContent>
            {followedActions.length > 0 ? (
                <div className="space-y-4">
                    {followedActions.map(action => (
                        <div key={action.id} className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleToggleFollow(action.id, e)}
                              title={"Deixar de seguir"}
                            >
                              <Star className={cn("h-5 w-5 text-yellow-400 fill-yellow-400")} />
                            </Button>
                            <div className="grid gap-1 flex-1">
                               <a href={`/actions/${action.id}`} onClick={(e) => handleOpenAction(e, action)} className="font-semibold hover:underline">{action.title}</a>
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{action.actionId}</span>
                                    <ActionStatusBadge status={action.status}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (<p className="text-sm text-muted-foreground text-center py-10">{t("followedActions.noActions")}</p>)}
        </CardContent>
      </Card>
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("totalActions")} value={stats.total} icon={Inbox} />
            <StatCard title={t("activeActions")} value={stats.active} icon={FolderClock} />
            <StatCard title={t("finalizedActions")} value={stats.finalized} icon={CheckCircle} />
            <StatCard title={t("drafts")} value={stats.drafts} icon={FileText} />
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.filter(id => widgets[id])} strategy={verticalListSortingStrategy}>
                    {items.map(id => (
                        widgets[id] ? (
                            <SortableItem key={id} id={id}>
                                {widgets[id]}
                            </SortableItem>
                        ) : null
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    </div>
  )
}
