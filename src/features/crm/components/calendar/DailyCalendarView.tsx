import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Phone, Users } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { format, isSameDay, addDays, subDays, setHours, setMinutes, getHours, getMinutes } from 'date-fns';
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

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6:00 to 20:00

export function DailyCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const dayActivities = useMemo(() => {
    return activities.filter((a) => isSameDay(a.date, currentDate));
  }, [activities, currentDate]);

  const allDayActivities = useMemo(() => {
    return dayActivities.filter(a => {
      const hours = getHours(a.date);
      return hours === 0;
    });
  }, [dayActivities]);

  const getActivitiesForHour = (hour: number) => {
    return dayActivities.filter(a => {
      const activityHour = getHours(a.date);
      return activityHour === hour;
    });
  };

  const isToday = isSameDay(currentDate, new Date());
  const currentHour = getHours(new Date());

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

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subDays(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addDays(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* All-day activities */}
          {allDayActivities.length > 0 && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-2">Dia inteiro</div>
              <div className="flex flex-wrap gap-2">
                {allDayActivities.map((activity) => {
                  const Icon = eventTypeIcons[activity.type];
                  return (
                    <button
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded border flex items-center gap-2 transition-opacity hover:opacity-80',
                        eventTypeColors[activity.type],
                        activity.completed && 'opacity-50 line-through'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{activity.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hourly grid */}
          <div className="space-y-0 border rounded-lg overflow-hidden">
            {HOURS.map((hour) => {
              const hourActivities = getActivitiesForHour(hour);
              const isCurrentHour = isToday && currentHour === hour;

              return (
                <div
                  key={hour}
                  className={cn(
                    'flex border-b last:border-b-0 min-h-[60px]',
                    isCurrentHour && 'bg-primary/5'
                  )}
                >
                  <div className={cn(
                    'w-16 flex-shrink-0 text-xs text-muted-foreground p-2 border-r bg-muted/30 flex items-start justify-end',
                    isCurrentHour && 'text-primary font-medium'
                  )}>
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 p-2 space-y-1">
                    {hourActivities.map((activity) => {
                      const Icon = eventTypeIcons[activity.type];
                      const minutes = getMinutes(activity.date);
                      return (
                        <button
                          key={activity.id}
                          onClick={() => handleActivityClick(activity)}
                          className={cn(
                            'w-full text-left text-sm px-3 py-2 rounded border flex items-center gap-2 transition-opacity hover:opacity-80',
                            eventTypeColors[activity.type],
                            activity.completed && 'opacity-50 line-through'
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {String(hour).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
                          </span>
                          <span className="truncate font-medium">{activity.title}</span>
                          {activity.dealName && (
                            <span className="text-xs opacity-70 truncate">• {activity.dealName}</span>
                          )}
                          {activity.durationMinutes && (
                            <span className="text-xs opacity-70 ml-auto">
                              {activity.durationMinutes}min
                            </span>
                          )}
                        </button>
                      );
                    })}
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
