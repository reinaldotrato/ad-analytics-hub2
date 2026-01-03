import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { getDate, getDaysInMonth, isWeekend } from 'date-fns';

interface DailyGoalCardProps {
  monthlyGoal: number;
  todayValue: number;
  monthValue: number;
  type?: 'quantity' | 'currency';
}

export function DailyGoalCard({ monthlyGoal, todayValue, monthValue, type = 'quantity' }: DailyGoalCardProps) {
  const today = new Date();
  const currentDay = getDate(today);
  const totalDays = getDaysInMonth(today);
  
  // Calcular dias úteis (simplificado - exclui fins de semana)
  const getWorkingDaysInMonth = () => {
    let count = 0;
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      if (!isWeekend(date)) count++;
    }
    return count;
  };
  
  const workingDays = getWorkingDaysInMonth();
  const dailyGoal = monthlyGoal / workingDays;
  
  // Onde deveria estar hoje
  const getWorkingDaysUntilToday = () => {
    let count = 0;
    for (let i = 1; i <= currentDay; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      if (!isWeekend(date)) count++;
    }
    return count;
  };
  
  const workingDaysUntilToday = getWorkingDaysUntilToday();
  const expectedValue = dailyGoal * workingDaysUntilToday;
  
  const dailyProgress = dailyGoal > 0 ? (todayValue / dailyGoal) * 100 : 0;
  const monthProgress = monthlyGoal > 0 ? (monthValue / monthlyGoal) * 100 : 0;
  const isAhead = monthValue >= expectedValue;

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

  const getStatusIcon = () => {
    if (dailyProgress >= 100) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (dailyProgress >= 50) {
      return <Target className="h-5 w-5 text-amber-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-destructive" />;
  };

  const getStatusText = () => {
    if (dailyProgress >= 100) return 'Meta diária atingida!';
    if (dailyProgress >= 80) return 'Quase lá!';
    if (dailyProgress >= 50) return 'Metade do caminho';
    return 'Foco na meta!';
  };

  const getStatusColor = () => {
    if (dailyProgress >= 100) return 'text-green-500';
    if (dailyProgress >= 50) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <Card className="relative overflow-hidden">
      {dailyProgress >= 100 && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" />
      )}
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Dia {currentDay} de {totalDays}
          </span>
        </div>

        <div className="space-y-4">
          {/* Meta diária */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Meta do dia</span>
              <span className="text-sm font-medium">{formatValue(Math.ceil(dailyGoal))}</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress 
                value={Math.min(dailyProgress, 100)} 
                className="h-2 flex-1"
              />
              <span className={`text-xs font-medium w-12 text-right ${getStatusColor()}`}>
                {formatValue(todayValue)}
              </span>
            </div>
          </div>

          {/* Progresso acumulado */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Acumulado no mês</span>
              <div className="flex items-center gap-2">
                {isAhead ? (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Adiantado
                  </span>
                ) : (
                  <span className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Atrasado
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{formatValue(monthValue)}</span>
              <span className="text-muted-foreground">
                / {formatValue(monthlyGoal)} ({monthProgress.toFixed(0)}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Esperado até hoje: {formatValue(Math.ceil(expectedValue))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
