import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDate } from 'date-fns';

interface SellerGoalAlertBannerProps {
  sellerName: string;
  goalProgress: number; // 0-100 baseado em valor (R$)
  avatarUrl?: string;
  remainingValue?: number;
}

export function SellerGoalAlertBanner({ 
  sellerName, 
  goalProgress, 
  avatarUrl,
  remainingValue 
}: SellerGoalAlertBannerProps) {
  const today = getDate(new Date());
  const isEndOfMonth = today >= 25;
  const firstName = sellerName.split(' ')[0];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  // Determinar tipo de alerta
  const getAlertType = () => {
    if (goalProgress >= 100) {
      return {
        type: 'success',
        icon: CheckCircle2,
        title: `${firstName} bateu a meta! 🎉`,
        message: 'Parabéns pelo excelente resultado!',
        bgClass: 'bg-green-500/10 border-green-500/30',
        iconClass: 'text-green-500',
        textClass: 'text-green-700 dark:text-green-400',
      };
    }
    if (goalProgress >= 80) {
      const remaining = remainingValue ? ` Faltam ${formatCurrency(remainingValue)}.` : '';
      return {
        type: 'almost',
        icon: TrendingUp,
        title: `${firstName} está a ${(100 - goalProgress).toFixed(0)}% da meta`,
        message: `Quase lá! Continue assim.${remaining}`,
        bgClass: 'bg-amber-500/10 border-amber-500/30',
        iconClass: 'text-amber-500',
        textClass: 'text-amber-700 dark:text-amber-400',
      };
    }
    if (isEndOfMonth && goalProgress < 80) {
      return {
        type: 'warning',
        icon: AlertTriangle,
        title: `${firstName}, atenção!`,
        message: `Meta em ${goalProgress.toFixed(0)}% no dia ${today}. É hora de intensificar!`,
        bgClass: 'bg-destructive/10 border-destructive/30',
        iconClass: 'text-destructive',
        textClass: 'text-destructive',
      };
    }
    if (goalProgress < 50) {
      return {
        type: 'behind',
        icon: Clock,
        title: `${firstName}, vamos acelerar!`,
        message: 'Abaixo de 50% do objetivo. Foque em fechar negócios.',
        bgClass: 'bg-muted border-muted-foreground/20',
        iconClass: 'text-muted-foreground',
        textClass: 'text-muted-foreground',
      };
    }
    return null;
  };

  const alert = getAlertType();

  if (!alert) return null;

  const Icon = alert.icon;

  return (
    <Card className={`border ${alert.bgClass}`}>
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xs">
              {sellerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className={`p-1.5 rounded-full ${alert.bgClass}`}>
            <Icon className={`h-4 w-4 ${alert.iconClass}`} />
          </div>
          <div className="flex-1">
            <h4 className={`font-medium text-sm ${alert.textClass}`}>{alert.title}</h4>
            <p className={`text-xs ${alert.textClass} opacity-80`}>{alert.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
