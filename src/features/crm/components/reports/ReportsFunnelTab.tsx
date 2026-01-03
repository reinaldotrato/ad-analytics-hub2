import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { FunnelStage } from '../../lib/types';

interface FunnelMetric {
  stage: FunnelStage;
  deals_count: number;
  deals_value: number;
  conversion_rate: number | null;
}

interface ReportsFunnelTabProps {
  metrics: FunnelMetric[];
}

export function ReportsFunnelTab({ metrics }: ReportsFunnelTabProps) {
  const chartData = metrics.map((m, index) => ({
    name: m.stage.name,
    deals: m.deals_count,
    value: m.deals_value,
    color: m.stage.color,
    conversionRate: m.conversion_rate,
    prevStage: index > 0 ? metrics[index - 1].stage.name : null,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Deals: <span className="font-medium text-foreground">{data.deals}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Valor: <span className="font-medium text-foreground">{formatCurrency(data.value)}</span>
          </p>
          {data.conversionRate !== null && (
            <p className="text-sm text-muted-foreground">
              Conversão: <span className="font-medium text-foreground">{data.conversionRate.toFixed(1)}%</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Nenhuma etapa de funil configurada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Funil de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 80, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="deals" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList 
                    dataKey="deals" 
                    position="right" 
                    fill="hsl(var(--foreground))"
                    formatter={(value: number) => value}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rates Card */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Taxas de Conversão por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chartData.slice(1).map((stage) => (
                <div 
                  key={stage.name}
                  className="p-4 rounded-lg border border-border bg-muted/30"
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    {stage.prevStage} → {stage.name}
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: stage.color }}>
                    {stage.conversionRate !== null ? `${stage.conversionRate.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
