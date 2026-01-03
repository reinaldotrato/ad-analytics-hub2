import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { MetaPositionBreakdown } from '@/services/metaAdsService';

interface MetaBreakdownPositionChartProps {
  data: MetaPositionBreakdown[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatNumber = (value: number) => value.toLocaleString('pt-BR');

export function MetaBreakdownPositionChart({ data }: MetaBreakdownPositionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Resultados por Posição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data
    .sort((a, b) => b.results - a.results)
    .map((item) => ({
      name: item.positionLabel,
      value: item.results,
      spend: item.spend,
      cpr: item.cpr,
    }));

  const maxValue = Math.max(...chartData.map((d) => d.value));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            Resultados: {formatNumber(item.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Investimento: {formatCurrency(item.spend)}
          </p>
          <p className="text-sm text-muted-foreground">
            CPR: {formatCurrency(item.cpr)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Resultados por Posição</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => {
                const intensity = 0.4 + (entry.value / maxValue) * 0.6;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(280, 70%, ${50 + (1 - intensity) * 30}%)`}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
