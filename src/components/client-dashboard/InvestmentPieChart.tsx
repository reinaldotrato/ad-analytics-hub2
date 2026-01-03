import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface InvestmentPieChartProps {
  data: PieData[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-medium">{data.name}</p>
        <p className="text-lg font-bold" style={{ color: data.color }}>
          {formatCurrency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  const total = payload.reduce((sum: number, entry: any) => sum + entry.payload.value, 0);
  
  return (
    <div className="flex flex-col gap-2 mt-4">
      {payload.map((entry: any, index: number) => {
        const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : 0;
        return (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-sm text-muted-foreground">{entry.value}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(entry.payload.value)}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                ({percentage}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function InvestmentPieChart({ data }: InvestmentPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Distribuição do Investimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            Sem dados de investimento
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Total no centro (visual) */}
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">Total Investido</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
