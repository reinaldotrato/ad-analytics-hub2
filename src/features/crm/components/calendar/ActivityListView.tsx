import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Phone, Users, CheckCircle2, Circle, CalendarIcon, Trash2, X, CheckSquare } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ActivityViewDialog, CalendarActivity } from './ActivityViewDialog';
import { TaskFormDialog } from '../deals/TaskFormDialog';
import { useTasks, useDealsSupabase, useUpdateTask, useDeleteTask, useBulkDeleteTasks } from '@/hooks/useCrmData';
import { toast } from 'sonner';
import type { DateRange } from 'react-day-picker';

const eventTypeLabels: Record<string, string> = {
  call: 'Ligação',
  meeting: 'Reunião',
  whatsapp: 'WhatsApp',
};

const eventTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  meeting: Users,
  whatsapp: WhatsAppIcon,
};

const eventTypeColors: Record<string, string> = {
  call: 'bg-cyan-500/20 text-cyan-500',
  meeting: 'bg-purple-500/20 text-purple-500',
  whatsapp: 'bg-emerald-500/20 text-emerald-500',
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return '-';
  if (minutes >= 60) {
    const hours = minutes / 60;
    return `${hours}h`;
  }
  return `${minutes} min`;
};

export function ActivityListView() {
  const [selectedActivity, setSelectedActivity] = useState<CalendarActivity | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'call' | 'meeting' | 'whatsapp'>('all');
  
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: deals = [], isLoading: dealsLoading } = useDealsSupabase();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const bulkDeleteTasks = useBulkDeleteTasks();

  const isLoading = tasksLoading || dealsLoading;

  const activities = useMemo<CalendarActivity[]>(() => {
    const items: CalendarActivity[] = [];

    // Add tasks with contact info
    tasks.forEach((task) => {
      const taskType = task.task_type || 'call';
      const contact = task.deal?.contact;
      
      items.push({
        id: task.id,
        title: task.title,
        date: task.due_date ? new Date(task.due_date) : new Date(task.created_at),
        type: taskType as 'call' | 'meeting' | 'whatsapp',
        dealId: task.deal_id || undefined,
        dealName: task.deal?.name,
        description: task.description || undefined,
        assignedTo: task.assigned_to_id || undefined,
        completed: task.completed,
        durationMinutes: task.duration_minutes,
        contactId: contact?.id,
        contactName: contact?.name,
        contactEmail: contact?.email,
        contactPhone: contact?.mobile_phone || contact?.phone,
      });
    });

    // Sort by date descending
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [tasks]);

  // Apply filters
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Status filter
      if (statusFilter !== 'all') {
        const isPast = activity.date < new Date() && !activity.completed;
        if (statusFilter === 'completed' && !activity.completed) return false;
        if (statusFilter === 'pending' && (activity.completed || isPast)) return false;
        if (statusFilter === 'overdue' && !isPast) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && activity.type !== typeFilter) return false;

      // Date filter
      if (dateRange?.from) {
        const activityDate = startOfDay(activity.date);
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(activityDate, { start: from, end: to })) return false;
      }

      return true;
    });
  }, [activities, statusFilter, typeFilter, dateRange]);

  const handleActivityClick = (activity: CalendarActivity) => {
    setSelectedActivity(activity);
    setViewDialogOpen(true);
  };

  const handleEditActivity = (activity: CalendarActivity) => {
    const task = tasks.find(t => t.id === activity.id);
    setTaskToEdit({
      id: activity.id,
      title: activity.title,
      description: activity.description || '',
      due_date: activity.date.toISOString(),
      completed: activity.completed || false,
      deal_id: activity.dealId,
      task_type: task?.task_type || 'call',
      duration_minutes: task?.duration_minutes || 30,
    });
    setViewDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      await updateTask.mutateAsync({
        id: activityId,
        updates: {
          completed: true,
          completed_at: new Date().toISOString(),
        }
      });
    } catch (error) {
      toast.error('Erro ao concluir tarefa');
    }
  };

  const handlePostponeActivity = async (activityId: string, newDate: Date) => {
    try {
      await updateTask.mutateAsync({
        id: activityId,
        updates: {
          due_date: newDate.toISOString(),
        }
      });
    } catch (error) {
      toast.error('Erro ao adiar tarefa');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteTask.mutateAsync(activityId);
    } catch (error) {
      toast.error('Erro ao excluir tarefa');
    }
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      await updateTask.mutateAsync({
        id: taskToEdit.id,
        updates: {
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          task_type: taskData.task_type,
          duration_minutes: taskData.duration_minutes,
        }
      });
      toast.success('Tarefa atualizada com sucesso!');
      setEditDialogOpen(false);
      setTaskToEdit(null);
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleSelectActivity = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredActivities.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteTasks.mutateAsync(Array.from(selectedIds));
      toast.success(`${selectedIds.size} tarefa(s) excluída(s)`);
      setSelectedIds(new Set());
      setSelectionMode(false);
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error('Erro ao excluir tarefas');
    }
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const hasFilters = dateRange || statusFilter !== 'all' || typeFilter !== 'all';
  const allSelected = filteredActivities.length > 0 && selectedIds.size === filteredActivities.length;

  const openWhatsApp = (e: React.MouseEvent, phone?: string) => {
    e.stopPropagation();
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Tarefas</CardTitle>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Selection Mode Toggle */}
              <Button 
                variant={selectionMode ? "secondary" : "outline"} 
                size="sm" 
                onClick={toggleSelectionMode}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Selecionar
              </Button>

              {/* Date Range Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 min-w-[180px]">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "dd/MM/yy")} - ${format(dateRange.to, "dd/MM/yy")}`
                      ) : (
                        `De: ${format(dateRange.from, "dd/MM/yyyy")}`
                      )
                    ) : (
                      'Período'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-4 space-y-4">
                    <div className="text-sm font-medium">Selecione o período</div>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      className="p-0 pointer-events-auto"
                      locale={ptBR}
                      numberOfMonths={2}
                    />
                    {dateRange?.from && (
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">
                          {format(dateRange.from, "dd/MM/yyyy")}
                          {dateRange.to && ` até ${format(dateRange.to, "dd/MM/yyyy")}`}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDateRange(undefined)}
                        >
                          Limpar
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="overdue">Atrasadas</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {selectionMode && (
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={allSelected} 
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                )}
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => {
                const Icon = eventTypeIcons[activity.type] || Phone;
                const isPast = activity.date < new Date() && !activity.completed;
                
                return (
                  <TableRow
                    key={activity.id}
                    className={cn(
                      'hover:bg-muted/50 cursor-pointer',
                      activity.completed && 'opacity-60',
                      selectedIds.has(activity.id) && 'bg-muted/30'
                    )}
                  >
                    {selectionMode && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={selectedIds.has(activity.id)} 
                          onCheckedChange={(checked) => handleSelectActivity(activity.id, !!checked)}
                        />
                      </TableCell>
                    )}
                    <TableCell onClick={() => handleActivityClick(activity)}>
                      {activity.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle
                          className={cn(
                            'h-5 w-5',
                            isPast ? 'text-destructive' : 'text-muted-foreground'
                          )}
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-sm" onClick={() => handleActivityClick(activity)}>
                      <div className={cn(isPast && !activity.completed && 'text-destructive')}>
                        {format(activity.date, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleActivityClick(activity)}>
                      <Badge
                        variant="secondary"
                        className={cn('gap-1', eventTypeColors[activity.type])}
                      >
                        <Icon className="h-3 w-3" />
                        {eventTypeLabels[activity.type] || activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground" onClick={() => handleActivityClick(activity)}>
                      {formatDuration(activity.durationMinutes)}
                    </TableCell>
                    <TableCell className={cn(activity.completed && 'line-through')} onClick={() => handleActivityClick(activity)}>
                      {activity.title}
                    </TableCell>
                    <TableCell onClick={() => handleActivityClick(activity)}>
                      {activity.contactName ? (
                        <span className="text-sm">{activity.contactName}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={() => handleActivityClick(activity)}>
                      {activity.dealName ? (
                        <span className="text-sm text-muted-foreground">
                          {activity.dealName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={(e) => openWhatsApp(e, activity.contactPhone)}
                        disabled={!activity.contactPhone}
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredActivities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={selectionMode ? 9 : 8} className="text-center py-8 text-muted-foreground">
                    Nenhuma tarefa encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="shadow-lg border-2">
            <CardContent className="p-3 flex items-center gap-4">
              <Badge variant="secondary">{selectedIds.size} selecionado(s)</Badge>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                Limpar seleção
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-2"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <ActivityViewDialog
        activity={selectedActivity}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onEdit={handleEditActivity}
        onComplete={handleCompleteActivity}
        onPostpone={handlePostponeActivity}
        onDelete={handleDeleteActivity}
      />

      <TaskFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={taskToEdit}
        dealId={taskToEdit?.deal_id}
        onSave={handleSaveTask}
      />

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedIds.size} tarefas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as tarefas selecionadas serão permanentemente excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}