import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MetaRegionBreakdown } from '@/services/metaAdsService';

interface MetaBreakdownRegionChartProps {
  data: MetaRegionBreakdown[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatNumber = (value: number) => value.toLocaleString('pt-BR');

export function MetaBreakdownRegionChart({ data }: MetaBreakdownRegionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Regiões por Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data
    .sort((a, b) => b.results - a.results)
    .slice(0, 10)
    .map((item) => ({
      region: item.region,
      results: item.results,
      spend: item.spend,
      cpr: item.cpr,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Resultados: {formatNumber(item.results)}
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

  // Color gradient based on results
  const maxResults = Math.max(...chartData.map((d) => d.results));
  const getColor = (results: number) => {
    const intensity = results / maxResults;
    return `hsl(199, 89%, ${55 - intensity * 20}%)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top 10 Regiões por Resultados</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()}
              className="text-muted-foreground text-xs"
            />
            <YAxis 
              dataKey="region" 
              type="category" 
              width={100}
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="results" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.results)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
