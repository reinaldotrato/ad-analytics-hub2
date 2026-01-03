import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MetaDailyEvolution } from '@/services/metaAdsService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetaDailyEvolutionChartProps {
  data: MetaDailyEvolution[];
}

export const MetaDailyEvolutionChart = memo(function MetaDailyEvolutionChart({ data }: MetaDailyEvolutionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Evolução Diária</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    date: item.date,
    dateFormatted: format(parseISO(item.date), 'dd/MM', { locale: ptBR }),
    investimento: item.spend,
    resultados: item.results,
    impressoes: item.impressions,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      const dateFormatted = item?.date 
        ? format(parseISO(item.date), "dd 'de' MMMM", { locale: ptBR })
        : '';
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{dateFormatted}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{' '}
              {entry.name === 'Investimento'
                ? `R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Evolução Diária</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="dateFormatted"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `R$ ${(value / 1).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString('pt-BR')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="investimento"
              name="Investimento"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="resultados"
              name="Resultados"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
