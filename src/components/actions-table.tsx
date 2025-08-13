
"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ActionStatusBadge } from "./action-status-badge"
import type { ImprovementAction, ImprovementActionStatus, ImprovementActionType, User } from "@/lib/types"
import { ArrowUpDown, ChevronDown, GanttChartSquare } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTabs } from "@/hooks/use-tabs"
import { getActionById, getActionTypes, getCategories, getSubcategories, getAffectedAreas, getUsers } from "@/lib/data"
import { ActionDetailsTab } from "@/components/action-details-tab"

interface ActionsTableProps {
  actions: ImprovementAction[]
}

type SortKey = keyof ImprovementAction | 'responsible'

export function ActionsTable({ actions }: ActionsTableProps) {
  const t = useTranslations("Actions.table")
  const { openTab } = useTabs();

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<Set<ImprovementActionStatus>>(new Set())
  const [typeFilter, setTypeFilter] = useState<Set<ImprovementActionType>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)
  
  const allStatuses = useMemo(() => Array.from(new Set(actions.map(a => a.status))), [actions])
  const allTypes = useMemo(() => Array.from(new Set(actions.map(a => a.type))), [actions])

  const filteredAndSortedActions = useMemo(() => {
    let filtered = actions.filter(action => {
      const searchMatch =
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.actionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (action.responsibleUser && action.responsibleUser.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        action.responsibleGroupId.toLowerCase().includes(searchTerm.toLowerCase())

      const statusMatch = statusFilter.size === 0 || statusFilter.has(action.status)
      const typeMatch = typeFilter.size === 0 || typeFilter.has(action.type)

      return searchMatch && statusMatch && typeMatch
    })

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'responsible') {
            aValue = a.responsibleUser?.name || a.responsibleGroupId;
            bValue = b.responsibleUser?.name || b.responsibleGroupId;
        } else if (sortConfig.key === 'actionId') { 
            aValue = a['actionId'];
            bValue = b['actionId'];
        } else {
            aValue = a[sortConfig.key as keyof ImprovementAction];
            bValue = b[sortConfig.key as keyof ImprovementAction];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [actions, searchTerm, statusFilter, typeFilter, sortConfig])

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? 
        <ArrowUpDown className="ml-2 h-4 w-4" /> : 
        <ArrowUpDown className="ml-2 h-4 w-4" />; 
  };

  const handleOpenAction = (e: React.MouseEvent, action: ImprovementAction) => {
      e.preventDefault();
      
      const actionLoader = async () => {
        const actionData = await getActionById(action.id);
        if (!actionData) {
            throw new Error("Action not found");
        }
        const [types, cats, subcats, areas] = await Promise.all([
            getActionTypes(),
            getCategories(),
            getSubcategories(),
            getAffectedAreas(),
        ]);
        const masterData = { actionTypes: types, categories: cats, subcategories: subcats, affectedAreas: areas };
        return <ActionDetailsTab initialAction={actionData} masterData={masterData} />;
      };

      openTab({
          path: `/actions/${action.id}`,
          title: `Acció ${action.actionId}`,
          icon: GanttChartSquare,
          isClosable: true,
          loader: actionLoader
      });
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder={t("filterPlaceholder")}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {t("status")} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allStatuses.map(status => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.has(status)}
                onCheckedChange={checked => {
                  setStatusFilter(prev => {
                    const newSet = new Set(prev)
                    if (checked) newSet.add(status)
                    else newSet.delete(status)
                    return newSet
                  })
                }}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {t("type")} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allTypes.map(type => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={typeFilter.has(type)}
                onCheckedChange={checked => {
                  setTypeFilter(prev => {
                    const newSet = new Set(prev)
                    if (checked) newSet.add(type)
                    else newSet.delete(type)
                    return newSet
                  })
                }}
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Button variant="ghost" onClick={() => requestSort('actionId')}>{t("col.id")} {getSortIcon('actionId')}</Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => requestSort('title')}>{t("col.title")} {getSortIcon('title')}</Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => requestSort('status')}>{t("col.status")} {getSortIcon('status')}</Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => requestSort('type')}>{t("col.type")} {getSortIcon('type')}</Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => requestSort('responsible')}>{t("col.responsible")} {getSortIcon('responsible')}</Button></TableHead>
              <TableHead><Button variant="ghost" onClick={() => requestSort('implementationDueDate')}>{t("col.dueDate")} {getSortIcon('implementationDueDate')}</Button></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedActions.length > 0 ? (
              filteredAndSortedActions.map(action => (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">
                     <Button variant="link" asChild className="p-0 h-auto">
                        <a href={`/actions/${action.id}`} onClick={(e) => handleOpenAction(e, action)}>{action.actionId}</a>
                    </Button>
                  </TableCell>
                  <TableCell>{action.title}</TableCell>
                  <TableCell>
                    <ActionStatusBadge status={action.status} />
                  </TableCell>
                  <TableCell>{action.type}</TableCell>
                  <TableCell>{action.responsibleUser?.name || action.responsibleGroupId}</TableCell>
                  <TableCell>{action.implementationDueDate}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {t("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
