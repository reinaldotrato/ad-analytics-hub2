import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Users, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalProgressCardProps {
  title: string;
  icon: 'sales' | 'value' | 'leads' | 'opportunities';
  goal: number;
  current: number;
  format?: 'number' | 'currency';
  className?: string;
}

export function GoalProgressCard({ 
  title, 
  icon, 
  goal, 
  current, 
  format = 'number',
  className 
}: GoalProgressCardProps) {
  const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isOnTrack = progress >= 50; // Simplificado: considera no ritmo se >= 50%
  
  const formatValue = (value: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const IconComponent = {
    sales: Target,
    value: DollarSign,
    leads: Users,
    opportunities: BarChart3,
  }[icon];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconComponent className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
          </div>
          {isOnTrack ? (
            <div className="flex items-center gap-1 text-xs text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span>No ritmo</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <TrendingDown className="h-3 w-3" />
              <span>Atenção</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">{formatValue(current)}</span>
          <span className="text-sm text-muted-foreground">
            de {formatValue(goal)}
          </span>
        </div>
        <div className="space-y-1">
          <Progress 
            value={progress} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.toFixed(0)}% completo</span>
            <span>Falta: {formatValue(Math.max(goal - current, 0))}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
