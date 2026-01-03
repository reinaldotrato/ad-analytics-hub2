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

interface EvolutionDataItem {
  month: string;
  leads: number;
  sales: number;
}

interface EvolutionChartProps {
  data: EvolutionDataItem[];
}

const formatNumber = (value: number) => {
  return value.toLocaleString('pt-BR');
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }} 
            />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-medium text-foreground">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function EvolutionChart({ data }: EvolutionChartProps) {
  // Preparar dados para o gráfico - filtrar apenas meses com dados
  const chartData = data
    .filter(item => item.leads > 0 || item.sales > 0)
    .slice(-6) // Últimos 6 meses com dados
    .map((item) => ({
      name: item.month.substring(0, 3), // Pega as 3 primeiras letras do mês
      Leads: item.leads || 0,
      Vendas: item.sales || 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Evolução: Leads vs Vendas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Sem dados de evolução
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="name" 
                  className="text-muted-foreground"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                />
                <Bar 
                  dataKey="Leads" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                <Bar 
                  dataKey="Vendas" 
                  fill="#06B6D4" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
