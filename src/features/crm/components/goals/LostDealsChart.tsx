import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface LostDeal {
  reason: string;
  count: number;
  value: number;
}

interface LostDealsChartProps {
  data: LostDeal[];
  viewMode?: 'pie' | 'bar';
}

const COLORS = [
  'hsl(var(--destructive))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function LostDealsChart({ data, viewMode = 'bar' }: LostDealsChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
  }));

  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.reason] = {
      label: item.reason,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Motivos de Perda
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">Nenhum negócio perdido no período</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Motivos de Perda
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{total} negócios perdidos</span>
          <span>{formatCurrency(totalValue)} em valor</span>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'pie' ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                nameKey="reason"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-lg">
                        <p className="font-medium">{data.reason}</p>
                        <p className="text-sm text-muted-foreground">{data.count} negócios ({data.percentage}%)</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="reason" 
                tick={{ fontSize: 11 }} 
                width={95}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-lg">
                        <p className="font-medium">{data.reason}</p>
                        <p className="text-sm text-muted-foreground">{data.count} negócios ({data.percentage}%)</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
