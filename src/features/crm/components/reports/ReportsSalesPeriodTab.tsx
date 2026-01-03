import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SalesPeriodData } from '../../lib/types';

interface ReportsSalesPeriodTabProps {
  getSalesByPeriod: (groupBy: 'day' | 'week' | 'month') => SalesPeriodData[];
}

export function ReportsSalesPeriodTab({ getSalesByPeriod }: ReportsSalesPeriodTabProps) {
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');
  
  const data = getSalesByPeriod(groupBy);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Valor: <span className="font-medium text-foreground">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Vendas: <span className="font-medium text-foreground">{payload[0].payload.deals_count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalValue = data.reduce((sum, d) => sum + d.total_value, 0);
  const totalDeals = data.reduce((sum, d) => sum + d.deals_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total no período</p>
          <p className="text-3xl font-semibold">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-muted-foreground">{totalDeals} vendas</p>
        </div>
        <Tabs value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
          <TabsList>
            <TabsTrigger value="day">Diário</TabsTrigger>
            <TabsTrigger value="week">Semanal</TabsTrigger>
            <TabsTrigger value="month">Mensal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total_value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
