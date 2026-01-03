import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { LostOpportunity } from '../../lib/types';
import { useMemo } from 'react';

interface LostByReasonChartProps {
  opportunities: LostOpportunity[];
}

const COLORS = [
  'hsl(var(--destructive))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))',
];

export function LostByReasonChart({ opportunities }: LostByReasonChartProps) {
  const chartData = useMemo(() => {
    if (!opportunities.length) return [];

    const grouped = opportunities.reduce((acc, item) => {
      const reason = item.reason || 'Não especificado';
      
      if (!acc[reason]) {
        acc[reason] = { reason, count: 0, value: 0 };
      }
      acc[reason].count++;
      acc[reason].value += item.value || 0;
      return acc;
    }, {} as Record<string, { reason: string; count: number; value: number }>);

    return Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [opportunities]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perdas por Motivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Sem dados disponíveis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Perdas por Motivo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              type="category"
              dataKey="reason"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={120}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              formatter={(value: number, name: string, props: { payload: { value: number } }) => {
                if (name === 'count') {
                  return [
                    <span key="count">
                      {value} negócios ({formatCurrency(props.payload.value)})
                    </span>,
                    'Quantidade',
                  ];
                }
                return [value, name];
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
