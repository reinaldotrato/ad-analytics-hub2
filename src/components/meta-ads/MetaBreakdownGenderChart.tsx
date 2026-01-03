import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MetaGenderBreakdown } from '@/services/metaAdsService';

interface MetaBreakdownGenderChartProps {
  data: MetaGenderBreakdown[];
}

const GENDER_COLORS: Record<string, string> = {
  male: '#3B82F6',      // Blue
  female: '#EC4899',    // Pink
  unknown: '#9CA3AF',   // Gray
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatNumber = (value: number) => value.toLocaleString('pt-BR');

export function MetaBreakdownGenderChart({ data }: MetaBreakdownGenderChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Resultados por Gênero</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.genderLabel,
    value: item.results,
    gender: item.gender,
    spend: item.spend,
    cpr: item.cpr,
  }));

  const totalResults = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / totalResults) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            Resultados: {formatNumber(item.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Participação: {percentage}%
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
        <CardTitle className="text-base font-medium">Resultados por Gênero</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={GENDER_COLORS[entry.gender] || '#9CA3AF'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
