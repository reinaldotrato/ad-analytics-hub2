import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SpendByChannelChartProps {
  googleSpend: number;
  metaSpend: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function SpendByChannelChart({ googleSpend, metaSpend }: SpendByChannelChartProps) {
  const data = [
    { name: 'Meta Ads', value: metaSpend, color: 'hsl(var(--primary))' },
    { name: 'Google Ads', value: googleSpend, color: 'hsl(var(--chart-2))' },
  ];

  const totalSpend = googleSpend + metaSpend;
  const metaPercent = totalSpend > 0 ? ((metaSpend / totalSpend) * 100).toFixed(1) : 0;
  const googlePercent = totalSpend > 0 ? ((googleSpend / totalSpend) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Gastos por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => formatCurrency(value)} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Gasto']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Meta Ads:</span>
            <span className="font-medium">{formatCurrency(metaSpend)} ({metaPercent}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span className="text-muted-foreground">Google Ads:</span>
            <span className="font-medium">{formatCurrency(googleSpend)} ({googlePercent}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
