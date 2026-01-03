import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { MetaPlatformBreakdown } from '@/services/metaAdsService';

interface MetaBreakdownPlatformChartProps {
  data: MetaPlatformBreakdown[];
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  messenger: '#0084FF',
  audience_network: '#4267B2',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatNumber = (value: number) => value.toLocaleString('pt-BR');

export function MetaBreakdownPlatformChart({ data }: MetaBreakdownPlatformChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resultados por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.platformLabel,
    value: item.results,
    platform: item.platform,
    spend: item.spend,
    cpr: item.cpr,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{item.name}</p>
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
        <CardTitle className="text-lg">Resultados por Plataforma</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PLATFORM_COLORS[entry.platform] || '#8B5CF6'} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
