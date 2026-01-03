import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { LostOpportunity } from '../../lib/types';
import { useMemo } from 'react';

interface LostBySellerChartProps {
  opportunities: LostOpportunity[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))',
];

export function LostBySellerChart({ opportunities }: LostBySellerChartProps) {
  const chartData = useMemo(() => {
    if (!opportunities.length) return [];

    const grouped = opportunities.reduce((acc, item) => {
      const seller = item.seller_name || 'Não atribuído';
      
      if (!acc[seller]) {
        acc[seller] = { seller, count: 0, value: 0 };
      }
      acc[seller].count++;
      acc[seller].value += item.value || 0;
      return acc;
    }, {} as Record<string, { seller: string; count: number; value: number }>);

    return Object.values(grouped)
      .sort((a, b) => b.value - a.value)
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
          <CardTitle className="text-base">Perdas por Vendedor</CardTitle>
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
        <CardTitle className="text-base">Perdas por Vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="seller"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
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
              formatter={(value: number, name: string, props: { payload: { count: number } }) => {
                if (name === 'value') {
                  return [
                    <span key="value">
                      {formatCurrency(value)} ({props.payload.count} negócios)
                    </span>,
                    'Valor Perdido',
                  ];
                }
                return [value, name];
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
