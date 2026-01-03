import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Area, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalEvolutionChartProps {
  goal: number;
  currentValue: number;
  dailyData: { date: string; value: number }[];
  title?: string;
  type?: 'quantity' | 'currency';
}

const chartConfig = {
  real: {
    label: "Realizado",
    color: "hsl(var(--primary))",
  },
  ideal: {
    label: "Meta Ideal",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

export function GoalEvolutionChart({ 
  goal, 
  currentValue, 
  dailyData, 
  title = "Evolução da Meta",
  type = 'quantity'
}: GoalEvolutionChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const dailyGoal = goal / daysInMonth.length;

    // Criar mapa de dados reais por data
    const realDataMap = new Map<string, number>();
    let accumulated = 0;
    dailyData.forEach(d => {
      accumulated += d.value;
      realDataMap.set(d.date, accumulated);
    });

    // Gerar dados do gráfico
    let lastRealValue = 0;
    return daysInMonth.map((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const idealValue = dailyGoal * (index + 1);
      const realValue = realDataMap.get(dateStr);
      
      if (realValue !== undefined) {
        lastRealValue = realValue;
      }

      const isPast = isBefore(day, now) || isToday(day);

      return {
        day: format(day, 'dd', { locale: ptBR }),
        fullDate: format(day, 'dd/MM', { locale: ptBR }),
        ideal: Math.round(idealValue),
        real: isPast ? (realDataMap.has(dateStr) ? realValue : lastRealValue) : undefined,
        isToday: isToday(day),
      };
    });
  }, [goal, dailyData]);

  const progress = goal > 0 ? (currentValue / goal) * 100 : 0;
  const isOnTrack = currentValue >= (chartData.find(d => d.isToday)?.ideal || 0);

  const formatValue = (value: number) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString('pt-BR');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className={`flex items-center gap-1 text-sm ${isOnTrack ? 'text-green-500' : 'text-amber-500'}`}>
            {isOnTrack ? (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>No ritmo</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4" />
                <span>Abaixo</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatValue(currentValue)}</span>
          <span className="text-muted-foreground">/ {formatValue(goal)}</span>
          <span className="text-sm text-muted-foreground">({progress.toFixed(0)}%)</span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              tickFormatter={(value) => type === 'currency' ? `${(value / 1000).toFixed(0)}k` : value}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine y={goal} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
            <Area 
              type="monotone" 
              dataKey="real" 
              fill="url(#gradientReal)"
              stroke="none"
            />
            <Line 
              type="monotone" 
              dataKey="ideal" 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              dot={false}
              strokeWidth={1.5}
            />
            <Line 
              type="monotone" 
              dataKey="real" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
