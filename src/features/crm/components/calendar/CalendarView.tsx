import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Phone, Users } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ActivityViewDialog, CalendarActivity } from './ActivityViewDialog';
import { TaskFormDialog } from '../deals/TaskFormDialog';
import { useTasks, useDealsSupabase, useUpdateTask, useDeleteTask } from '@/hooks/useCrmData';
import { toast } from 'sonner';

const eventTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  meeting: Users,
  whatsapp: WhatsAppIcon,
};

const eventTypeColors: Record<string, string> = {
  call: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  meeting: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  whatsapp: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
};

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<CalendarActivity | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: deals = [], isLoading: dealsLoading } = useDealsSupabase();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isLoading = tasksLoading || dealsLoading;

  const activities = useMemo<CalendarActivity[]>(() => {
    const items: CalendarActivity[] = [];

    // Add tasks with contact info
    tasks.forEach((task) => {
      if (task.due_date) {
        const taskType = task.task_type || 'call';
        const contact = task.deal?.contact;
        
        items.push({
          id: task.id,
          title: task.title,
          date: new Date(task.due_date),
          type: taskType as 'call' | 'meeting' | 'whatsapp',
          dealId: task.deal_id || undefined,
          dealName: task.deal?.name,
          description: task.description || undefined,
          completed: task.completed,
          durationMinutes: task.duration_minutes,
          contactId: contact?.id,
          contactName: contact?.name,
          contactEmail: contact?.email,
          contactPhone: contact?.mobile_phone || contact?.phone,
        });
      }
    });

    return items;
  }, [tasks]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start of the month to align with the correct day of week
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array(startDayOfWeek).fill(null);

  const getActivitiesForDay = (date: Date) => {
    return activities.filter((a) => isSameDay(a.date, date));
  };

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

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding days */}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="min-h-[100px] p-1" />
            ))}

            {/* Actual days */}
            {days.map((day) => {
              const dayActivities = getActivitiesForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[100px] p-1 border border-border rounded-lg',
                    !isSameMonth(day, currentMonth) && 'opacity-50',
                    isToday && 'border-primary bg-primary/5'
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-medium mb-1 text-center',
                      isToday && 'text-primary'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayActivities.slice(0, 3).map((activity) => {
                      const Icon = eventTypeIcons[activity.type];
                      return (
                        <button
                          key={activity.id}
                          onClick={() => handleActivityClick(activity)}
                          className={cn(
                            'w-full text-left text-xs p-1 rounded border truncate flex items-center gap-1 transition-opacity hover:opacity-80',
                            eventTypeColors[activity.type],
                            activity.completed && 'opacity-50 line-through'
                          )}
                          title={`${activity.title}${activity.dealName ? ` - ${activity.dealName}` : ''}`}
                        >
                          <Icon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{activity.title}</span>
                        </button>
                      );
                    })}
                    {dayActivities.length > 3 && (
                      <Badge variant="secondary" className="text-xs w-full justify-center">
                        +{dayActivities.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
    </>
  );
}
