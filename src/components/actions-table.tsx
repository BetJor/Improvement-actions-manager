

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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ActionStatusBadge } from "./action-status-badge"
import type { ImprovementAction, ImprovementActionStatus, ImprovementActionType, User } from "@/lib/types"
import { ArrowUpDown, ChevronDown, GanttChartSquare, Star, X, FileSpreadsheet } from "lucide-react"
import { useTabs } from "@/hooks/use-tabs"
import { getActionById, getActionTypes, getCategories, getSubcategories, getAffectedAreas, getCenters, getResponsibilityRoles, getUsers } from "@/lib/data"
import { ActionDetailsTab } from "@/components/action-details-tab"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { useFollowAction } from "@/hooks/use-follow-action"
import { Badge } from "./ui/badge"
import { format, parseISO } from "date-fns"
import { ActionStatusIndicator } from "./action-status-indicator"
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"


interface ActionsTableProps {
  actions: ImprovementAction[];
}

type SortKey = keyof ImprovementAction | 'responsible'

const safeFormatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        return format(date, 'dd/MM/yyyy HH:mm');
    } catch {
        return dateString; // Return original string if it's not a valid ISO date
    }
}

type ExportableSection = "details" | "plan" | "comments" | "attachments";


export function ActionsTable({ actions }: ActionsTableProps) {
  const { openTab } = useTabs();
  const { handleToggleFollow, isFollowing } = useFollowAction();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ImprovementActionStatus>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [centerFilter, setCenterFilter] = useState<Set<string>>(new Set());
  const [originFilter, setOriginFilter] = useState<Set<string>>(new Set());
  const [classificationFilter, setClassificationFilter] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  
  const [selectedSections, setSelectedSections] = useState<Set<ExportableSection>>(new Set(["details"]));
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    }
    loadUsers();
  }, []);


  const allStatuses = useMemo(() => Array.from(new Set(actions.map(a => a.status))), [actions]);
  const allTypes = useMemo(() => Array.from(new Set(actions.map(a => a.type))), [actions]);
  const allCenters = useMemo(() => Array.from(new Set(actions.map(a => a.center).filter(Boolean))) as string[], [actions]);
  const allOrigins = useMemo(() => Array.from(new Set(actions.map(a => a.category).filter(Boolean))) as string[], [actions]);
  const allClassifications = useMemo(() => Array.from(new Set(actions.map(a => a.subcategory).filter(Boolean))) as string[], [actions]);

  const removeFilter = (filterSetState: React.Dispatch<React.SetStateAction<Set<any>>>, value: any) => {
    filterSetState(prev => {
        const newSet = new Set(prev);
        newSet.delete(value);
        return newSet;
    });
  };

  const clearAllFilters = () => {
    setStatusFilter(new Set());
    setTypeFilter(new Set());
    setCenterFilter(new Set());
    setOriginFilter(new Set());
    setClassificationFilter(new Set());
    setSearchTerm("");
  }

  const activeFiltersCount = statusFilter.size + typeFilter.size + centerFilter.size + originFilter.size + classificationFilter.size + (searchTerm ? 1 : 0);

  const filteredAndSortedActions = useMemo(() => {
    let filtered = actions.filter(action => {
      const searchMatch =
        searchTerm === "" ||
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.actionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.category.toLowerCase().includes(searchTerm.toLowerCase())

      const statusMatch = statusFilter.size === 0 || statusFilter.has(action.status)
      const typeMatch = typeFilter.size === 0 || typeFilter.has(action.type)
      const centerMatch = centerFilter.size === 0 || (action.center && centerFilter.has(action.center));
      const originMatch = originFilter.size === 0 || (action.category && originFilter.has(action.category));
      const classificationMatch = classificationFilter.size === 0 || (action.subcategory && classificationFilter.has(action.subcategory));


      return searchMatch && statusMatch && typeMatch && centerMatch && originMatch && classificationMatch;
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
  }, [actions, searchTerm, statusFilter, typeFilter, centerFilter, originFilter, classificationFilter, sortConfig])

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
        const [types, cats, subcats, areas, centers, roles] = await Promise.all([
            getActionTypes(),
            getCategories(),
            getSubcategories(),
            getAffectedAreas(),
            getCenters(),
            getResponsibilityRoles(),
        ]);
        const masterData = { actionTypes: types, categories: cats, subcategories: subcats, affectedAreas: areas, centers: centers, responsibilityRoles: roles };
        return <ActionDetailsTab initialAction={actionData} masterData={masterData} />;
      };

      openTab({
          path: `/actions/${action.id}`,
          title: `Acción ${action.actionId}`,
          icon: GanttChartSquare,
          isClosable: true,
          loader: actionLoader
      });
  }

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();

    if (selectedSections.has("details")) {
        const detailsData = filteredAndSortedActions.map(action => ({
            'ID': action.actionId,
            'Título': action.title,
            'Estado': action.status,
            'Creador': action.creator.name,
            'Fecha Creación': safeFormatDate(action.creationDate),
            'Responsable Análisis': action.responsibleUser?.name || action.responsibleGroupId,
            'Ámbito': action.type,
            'Origen': action.category,
            'Clasificación': action.subcategory,
            'Centro': action.center,
            'Áreas Afectadas': action.affectedAreas.join(', '),
            'Descripción': action.description,
            'Análisis Causas': action.analysis?.causes,
            'Resp. Verificación': users.find(u => u.id === action.analysis?.verificationResponsibleUserId)?.name || '',
            'Observaciones Verificación': action.verification?.notes,
            'Observaciones Cierre': action.closure?.notes,
            'Resultado Cierre': action.closure ? (action.closure.isCompliant ? 'Conforme' : 'No Conforme') : '',
            'Fecha Cierre': safeFormatDate(action.closure?.date),
        }));
        const ws = XLSX.utils.json_to_sheet(detailsData);
        XLSX.utils.book_append_sheet(wb, ws, "Detalles Acciones");
    }

    if (selectedSections.has("plan")) {
        const planData: any[] = [];
        filteredAndSortedActions.forEach(action => {
            if (action.analysis?.proposedActions) {
                action.analysis.proposedActions.forEach(pa => {
                    planData.push({
                        'ID Acción': action.actionId,
                        'Acción Propuesta': pa.description,
                        'Responsable': users.find(u => u.id === pa.responsibleUserId)?.name || '',
                        'Fecha Límite': safeFormatDate(pa.dueDate as string),
                        'Estado': pa.status,
                        'Fecha Estado': safeFormatDate(pa.statusUpdateDate),
                        'Verificación': action.verification?.proposedActionsVerificationStatus?.[pa.id] || '',
                    });
                });
            }
        });
        const ws = XLSX.utils.json_to_sheet(planData);
        XLSX.utils.book_append_sheet(wb, ws, "Planes de Acción");
    }

    if (selectedSections.has("comments")) {
        const commentsData: any[] = [];
        filteredAndSortedActions.forEach(action => {
            if (action.comments) {
                action.comments.forEach(c => {
                    commentsData.push({
                        'ID Acción': action.actionId,
                        'Fecha': safeFormatDate(c.date),
                        'Autor': c.author.name,
                        'Comentario': c.text,
                    });
                });
            }
        });
        const ws = XLSX.utils.json_to_sheet(commentsData);
        XLSX.utils.book_append_sheet(wb, ws, "Comentarios");
    }
    
    if (selectedSections.has("attachments")) {
        const attachmentsData: any[] = [];
        filteredAndSortedActions.forEach(action => {
            if (action.attachments) {
                action.attachments.forEach(a => {
                    attachmentsData.push({
                        'ID Acción': action.actionId,
                        'Nombre Archivo': a.fileName,
                        'Subido Por': a.uploadedBy.name,
                        'Fecha Subida': safeFormatDate(a.uploadedAt),
                        'URL': a.fileUrl,
                    });
                });
            }
        });
        const ws = XLSX.utils.json_to_sheet(attachmentsData);
        XLSX.utils.book_append_sheet(wb, ws, "Adjuntos");
    }

    XLSX.writeFile(wb, "Export_Acciones_Mejora.xlsx");
};


  const toggleSection = (section: ExportableSection) => {
    setSelectedSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(section)) {
            newSet.delete(section);
        } else {
            newSet.add(section);
        }
        return newSet;
    });
  };


  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Acciones de Mejora</CardTitle>
            <CardDescription>
              Aquí puedes encontrar todas las acciones de mejora. Usa los filtros para acotar tu búsqueda.
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Selecciona los datos a exportar</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                    checked={selectedSections.has("details")} 
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => toggleSection("details")}
                >
                    Detalles de la Acción
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={selectedSections.has("plan")} 
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => toggleSection("plan")}
                >
                    Plan de Acción
                </DropdownMenuCheckboxItem>
                 <DropdownMenuCheckboxItem 
                    checked={selectedSections.has("comments")}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => toggleSection("comments")}
                >
                    Comentarios
                </DropdownMenuCheckboxItem>
                 <DropdownMenuCheckboxItem 
                    checked={selectedSections.has("attachments")} 
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => toggleSection("attachments")}
                >
                    Adjuntos
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportToExcel} className="bg-green-600 text-white focus:bg-green-700 focus:text-white">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar a Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <div className="flex flex-wrap items-center py-4 gap-2">
            <Input
              placeholder="Filtrar por título, ID u origen..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Estado <ChevronDown className="ml-2 h-4 w-4" />
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
                    Ámbito <ChevronDown className="ml-2 h-4 w-4" />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Origen <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {allOrigins.map(origin => (
                    <DropdownMenuCheckboxItem
                      key={origin}
                      checked={originFilter.has(origin)}
                      onCheckedChange={checked => {
                        setOriginFilter(prev => {
                          const newSet = new Set(prev)
                          if (checked) newSet.add(origin)
                          else newSet.delete(origin)
                          return newSet
                        })
                      }}
                    >
                      {origin}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Clasificación <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {allClassifications.map(classification => (
                    <DropdownMenuCheckboxItem
                      key={classification}
                      checked={classificationFilter.has(classification)}
                      onCheckedChange={checked => {
                        setClassificationFilter(prev => {
                          const newSet = new Set(prev)
                          if (checked) newSet.add(classification)
                          else newSet.delete(classification)
                          return newSet
                        })
                      }}
                    >
                      {classification}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Centro <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {allCenters.map(center => (
                    <DropdownMenuCheckboxItem
                      key={center}
                      checked={centerFilter.has(center)}
                      onCheckedChange={checked => {
                        setCenterFilter(prev => {
                          const newSet = new Set(prev)
                          if (checked) newSet.add(center)
                          else newSet.delete(center)
                          return newSet
                        })
                      }}
                    >
                      {center}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">Filtros activos:</span>
                  <div className="flex flex-wrap gap-1">
                      {searchTerm && (
                        <Badge variant="secondary" className="pl-2 pr-1">
                            Texto: "{searchTerm}"
                            <button onClick={() => setSearchTerm('')} className="ml-1 rounded-full hover:bg-background/80 p-0.5"><X className="h-3 w-3"/></button>
                        </Badge>
                      )}
                      {[...statusFilter].map(value => (
                          <Badge key={value} variant="secondary" className="pl-2 pr-1">
                              Estado: {value}
                              <button onClick={() => removeFilter(setStatusFilter, value)} className="ml-1 rounded-full hover:bg-background/80 p-0.5"><X className="h-3 w-3"/></button>
                          </Badge>
                      ))}
                      {[...typeFilter].map(value => (
                          <Badge key={value} variant="secondary" className="pl-2 pr-1">
                              Ámbito: {value}
                              <button onClick={() => removeFilter(setTypeFilter, value)} className="ml-1 rounded-full hover:bg-background/80 p-0.5"><X className="h-3 w-3"/></button>
                          </Badge>
                      ))}
                      {[...originFilter].map(value => (
                          <Badge key={value} variant="secondary" className="pl-2 pr-1">
                              Origen: {value}
                              <button onClick={() => removeFilter(setOriginFilter, value)} className="ml-1 rounded-full hover:bg-background/80 p-0.5"><X className="h-3 w-3"/></button>
                          </Badge>
                      ))}
                      {[...classificationFilter].map(value => (
                          <Badge key={value} variant="secondary" className="pl-2 pr-1">
                              Clasificación: {value}
                              <button onClick={() => removeFilter(setClassificationFilter, value)} className="ml-1 rounded-full hover:bg-background/80 p-0.5"><X className="h-3 w-3"/></button>
                          </Badge>
                      ))}
                      {[...centerFilter].map(value => (
                          <Badge key={value} variant="secondary" className="pl-2 pr-1">
                              Centro: {value}
                              <button onClick={() => removeFilter(setCenterFilter, value)} className="ml-1 rounded-full hover:bg-background/80 p-0.5"><X className="h-3 w-3"/></button>
                          </Badge>
                      ))}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="ml-auto text-sm h-auto px-2 py-1">
                      <X className="mr-1 h-4 w-4" />
                      Limpiar filtros
                  </Button>
              </div>
          )}

          <div className="rounded-md border flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('actionId')}>ID {getSortIcon('actionId')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('title')}>Título {getSortIcon('title')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('status')}>Estado {getSortIcon('status')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('type')}>Ámbito {getSortIcon('type')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('category')}>Origen {getSortIcon('category')}</Button></TableHead>
                  <TableHead><Button variant="ghost" onClick={() => requestSort('implementationDueDate')}>Fecha Vencimiento {getSortIcon('implementationDueDate')}</Button></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedActions.length > 0 ? (
                  filteredAndSortedActions.map(action => (
                    <TableRow key={action.id}>
                      <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleToggleFollow(action.id, e)}
                            title={isFollowing(action.id) ? "Dejar de seguir la acción" : "Seguir acción"}
                          >
                            <Star className={cn("h-4 w-4", isFollowing(action.id) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                          </Button>
                        </TableCell>
                      <TableCell className="font-medium">
                        <Button variant="link" asChild className="p-0 h-auto">
                            <a href={`/actions/${action.id}`} onClick={(e) => handleOpenAction(e, action)}>{action.actionId}</a>
                        </Button>
                      </TableCell>
                      <TableCell>{action.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <ActionStatusIndicator status={action.status} isCompliant={action.closure?.isCompliant} />
                            <ActionStatusBadge status={action.status} isCompliant={action.closure?.isCompliant} />
                        </div>
                      </TableCell>
                      <TableCell>{action.type}</TableCell>
                      <TableCell>{action.category}</TableCell>
                      <TableCell>{safeFormatDate(action.implementationDueDate)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
    </Card>
  )
}
