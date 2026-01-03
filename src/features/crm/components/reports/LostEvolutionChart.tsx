import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { LostOpportunity } from '../../lib/types';
import { useMemo } from 'react';

interface LostEvolutionChartProps {
  opportunities: LostOpportunity[];
}

export function LostEvolutionChart({ opportunities }: LostEvolutionChartProps) {
  const chartData = useMemo(() => {
    if (!opportunities.length) return [];

    // Group by month
    const grouped = opportunities.reduce((acc, item) => {
      const date = item.closed_at ? format(parseISO(item.closed_at), 'yyyy-MM') : null;
      if (!date) return acc;
      
      if (!acc[date]) {
        acc[date] = { period: date, count: 0, value: 0 };
      }
      acc[date].count++;
      acc[date].value += item.value || 0;
      return acc;
    }, {} as Record<string, { period: string; count: number; value: number }>);

    // Sort by period and format labels
    return Object.values(grouped)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map(item => ({
        ...item,
        label: format(parseISO(`${item.period}-01`), 'MMM/yy', { locale: ptBR }),
      }));
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
          <CardTitle className="text-base">Evolução de Perdas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Sem dados de evolução disponíveis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução de Perdas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lostGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              formatter={(value: number, name: string) => {
                if (name === 'value') return [formatCurrency(value), 'Valor Perdido'];
                return [value, 'Quantidade'];
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--destructive))"
              fill="url(#lostGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
