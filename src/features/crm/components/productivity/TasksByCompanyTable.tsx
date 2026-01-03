import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TaskWithDetails } from '../../hooks/useTeamProductivity';

interface TasksByCompanyTableProps {
  tasks: TaskWithDetails[];
}

const TASK_TYPE_LABELS: Record<string, string> = {
  call: 'Ligação',
  meeting: 'Reunião',
  whatsapp: 'WhatsApp',
  email: 'Email',
  task: 'Tarefa',
  follow_up: 'Follow-up',
};

const ITEMS_PER_PAGE = 10;

export function TasksByCompanyTable({ tasks }: TasksByCompanyTableProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = tasks.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividades por Empresa/Contato</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">Nenhuma atividade encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atividades por Empresa/Contato</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Negócio</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.map((task) => (
              <TableRow key={task.task_id}>
                <TableCell>
                  <span className="font-medium">{task.company_name || '-'}</span>
                </TableCell>
                <TableCell>{task.contact_name || '-'}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{task.deal_name || '-'}</span>
                </TableCell>
                <TableCell>{task.seller_name || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {TASK_TYPE_LABELS[task.task_type || ''] || task.task_type || 'Tarefa'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.task_due_date 
                    ? format(parseISO(task.task_due_date), 'dd/MM/yyyy', { locale: ptBR })
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-center">
                  {task.task_completed ? (
                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Concluída
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages} ({tasks.length} registros)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
