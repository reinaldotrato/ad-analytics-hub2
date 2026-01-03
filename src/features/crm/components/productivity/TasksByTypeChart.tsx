import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface TasksByTypeChartProps {
  tasksByType: Record<string, { total: number; completed: number; pending: number }>;
}

const TASK_TYPE_LABELS: Record<string, string> = {
  call: 'Ligação',
  meeting: 'Reunião',
  whatsapp: 'WhatsApp',
  email: 'Email',
  task: 'Tarefa',
  follow_up: 'Follow-up',
  'Sem tipo': 'Sem tipo',
};

const COLORS = {
  completed: 'hsl(var(--chart-2))',
  pending: 'hsl(var(--chart-4))',
};

export function TasksByTypeChart({ tasksByType }: TasksByTypeChartProps) {
  const data = Object.entries(tasksByType).map(([type, values]) => ({
    name: TASK_TYPE_LABELS[type] || type,
    completed: values.completed,
    pending: values.pending,
    total: values.total,
  })).sort((a, b) => b.total - a.total);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tarefas por Tipo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tarefas por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="completed" name="Concluídas" stackId="a" fill={COLORS.completed} radius={[0, 4, 4, 0]} />
            <Bar dataKey="pending" name="Pendentes" stackId="a" fill={COLORS.pending} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
