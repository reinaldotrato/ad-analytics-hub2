import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import type { CrmTask } from '@/services/crmService';
import { cn } from '@/lib/utils';

interface DealTasksProps {
  tasks: CrmTask[];
}

export function DealTasks({ tasks: initialTasks }: DealTasksProps) {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              completed: !task.completed,
              completed_at: !task.completed ? new Date().toISOString() : undefined
            }
          : task
      )
    );
  };

  const isOverdue = (task: CrmTask) => {
    if (task.completed || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tarefas</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma tarefa cadastrada
          </p>
        ) : (
          <>
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Pendentes ({pendingTasks.length})
                </p>
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border',
                      isOverdue(task) && 'border-destructive/50 bg-destructive/5'
                    )}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      {task.due_date && (
                        <div className={cn(
                          'flex items-center gap-1 mt-2 text-xs',
                          isOverdue(task) ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {isOverdue(task) ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <Calendar className="h-3 w-3" />
                          )}
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          {isOverdue(task) && (
                            <Badge variant="destructive" className="text-[10px] ml-1">
                              Atrasada
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Concluídas ({completedTasks.length})
                </p>
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground line-through">
                        {task.title}
                      </p>
                      {task.completed_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Concluída em {new Date(task.completed_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
