import { AlertTriangle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { getDate } from 'date-fns';

interface GoalAlertBannerProps {
  goalProgress: number; // 0-100
  variant?: 'default' | 'compact';
}

export function GoalAlertBanner({ goalProgress, variant = 'compact' }: GoalAlertBannerProps) {
  const today = getDate(new Date());
  const isEndOfMonth = today >= 25;
  
  // Determinar tipo de alerta
  const getAlertType = () => {
    if (goalProgress >= 100) {
      return {
        type: 'success',
        icon: CheckCircle2,
        title: 'Meta Batida! 🎉',
        message: 'Parabéns! Continue vendendo!',
        bgClass: 'bg-green-500/10',
        iconClass: 'text-green-500',
        textClass: 'text-green-700 dark:text-green-400',
      };
    }
    if (goalProgress >= 80) {
      return {
        type: 'almost',
        icon: TrendingUp,
        title: `Faltam ${(100 - goalProgress).toFixed(0)}% para a meta`,
        message: 'Quase lá!',
        bgClass: 'bg-amber-500/10',
        iconClass: 'text-amber-500',
        textClass: 'text-amber-700 dark:text-amber-400',
      };
    }
    if (isEndOfMonth && goalProgress < 80) {
      return {
        type: 'warning',
        icon: AlertTriangle,
        title: `Meta em ${goalProgress.toFixed(0)}%`,
        message: `Dia ${today} - intensifique os esforços!`,
        bgClass: 'bg-destructive/10',
        iconClass: 'text-destructive',
        textClass: 'text-destructive',
      };
    }
    if (goalProgress < 50) {
      return {
        type: 'behind',
        icon: Clock,
        title: `${goalProgress.toFixed(0)}% da meta`,
        message: 'Foque em fechar novos negócios',
        bgClass: 'bg-muted',
        iconClass: 'text-muted-foreground',
        textClass: 'text-muted-foreground',
      };
    }
    return null;
  };

  const alert = getAlertType();

  if (!alert) return null;

  const Icon = alert.icon;

  // Modo compacto - apenas uma linha inline
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${alert.bgClass}`}>
        <Icon className={`h-4 w-4 ${alert.iconClass}`} />
        <span className={`font-medium ${alert.textClass}`}>{alert.title}</span>
      </div>
    );
  }

  // Modo default - card completo (mantido para compatibilidade)
  return (
    <div className={`rounded-lg border p-3 ${alert.bgClass}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${alert.bgClass}`}>
          <Icon className={`h-5 w-5 ${alert.iconClass}`} />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${alert.textClass}`}>{alert.title}</h4>
          <p className={`text-sm ${alert.textClass} opacity-80`}>{alert.message}</p>
        </div>
      </div>
    </div>
  );
}
