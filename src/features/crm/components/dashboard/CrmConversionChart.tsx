import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { FunnelStageWithMetrics } from '../../lib/types';

interface CrmConversionChartProps {
  data: FunnelStageWithMetrics[];
}

export function CrmConversionChart({ data }: CrmConversionChartProps) {
  // Prepare data for stacked bar chart showing deals value by stage
  const chartData = data
    .filter(s => !s.is_lost) // Exclude lost from value chart
    .sort((a, b) => a.order - b.order)
    .map(stage => ({
      name: stage.name,
      value: stage.deals_value,
      count: stage.deals_count,
      fill: stage.color,
    }));

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">
            Valor:{' '}
            <span className="text-foreground font-medium">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(payload[0].value)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Deals: <span className="text-foreground font-medium">{payload[0].payload.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valor por Etapa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
