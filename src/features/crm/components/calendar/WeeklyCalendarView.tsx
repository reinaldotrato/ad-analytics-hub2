import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Phone, Users } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { 
  format, 
  isSameDay, 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  getHours,
  getMinutes,
  isToday as isDateToday
} from 'date-fns';
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

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 to 19:00

export function WeeklyCalendarView() {
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

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  const getActivitiesForDayAndHour = (day: Date, hour: number) => {
    return activities.filter(a => {
      if (!isSameDay(a.date, day)) return false;
      const activityHour = getHours(a.date);
      return activityHour === hour;
    });
  };

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
              {format(weekStart, "d", { locale: ptBR })} - {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
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
                onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-auto">
            <div className="min-w-[800px]">
              {/* Header with days */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b sticky top-0 bg-background z-10">
                <div className="p-2 border-r bg-muted/30" /> {/* Empty corner */}
                {weekDays.map((day) => {
                  const isToday = isDateToday(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'p-2 text-center border-r last:border-r-0',
                        isToday && 'bg-primary/10'
                      )}
                    >
                      <div className="text-xs text-muted-foreground">
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className={cn(
                        'text-lg font-semibold',
                        isToday && 'text-primary'
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hourly grid */}
              {HOURS.map((hour) => {
                const isCurrentHour = isDateToday(currentDate) && currentHour === hour;

                return (
                  <div
                    key={hour}
                    className={cn(
                      'grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0 min-h-[50px]',
                      isCurrentHour && 'bg-primary/5'
                    )}
                  >
                    <div className={cn(
                      'p-2 text-xs text-muted-foreground border-r bg-muted/30 text-right',
                      isCurrentHour && 'text-primary font-medium'
                    )}>
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    {weekDays.map((day) => {
                      const cellActivities = getActivitiesForDayAndHour(day, hour);
                      const isToday = isDateToday(day);

                      return (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          className={cn(
                            'p-1 border-r last:border-r-0',
                            isToday && 'bg-primary/5'
                          )}
                        >
                          {cellActivities.map((activity) => {
                            const Icon = eventTypeIcons[activity.type];
                            return (
                              <button
                                key={activity.id}
                                onClick={() => handleActivityClick(activity)}
                                className={cn(
                                  'w-full text-left text-xs p-1 rounded border flex items-center gap-1 mb-1 transition-opacity hover:opacity-80',
                                  eventTypeColors[activity.type],
                                  activity.completed && 'opacity-50 line-through'
                                )}
                                title={activity.title}
                              >
                                <Icon className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{activity.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
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
