import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import type { CrmMetrics } from '../../lib/types';

interface CrmMetricCardsProps {
  metrics: ReturnType<typeof import('../../lib/mock-data').getCrmMetrics>;
}

export function CrmMetricCards({ metrics }: CrmMetricCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const cards = [
    {
      title: 'Deals em Aberto',
      value: metrics.open_deals,
      subValue: formatCurrency(metrics.open_value),
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Deals Ganhos',
      value: metrics.won_deals,
      subValue: formatCurrency(metrics.won_value),
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Deals Perdidos',
      value: metrics.lost_deals,
      subValue: formatCurrency(metrics.lost_value),
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Taxa de Conversão',
      value: formatPercent(metrics.conversion_rate),
      subValue: `${metrics.won_deals} de ${metrics.won_deals + metrics.lost_deals}`,
      icon: metrics.conversion_rate >= 50 ? TrendingUp : TrendingDown,
      color: metrics.conversion_rate >= 50 ? 'text-green-500' : 'text-orange-500',
      bgColor: metrics.conversion_rate >= 50 ? 'bg-green-500/10' : 'bg-orange-500/10',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(metrics.average_deal_value),
      subValue: `${metrics.total_deals} deals no total`,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Tarefas Pendentes',
      value: metrics.pending_tasks,
      subValue: metrics.overdue_tasks > 0 
        ? `${metrics.overdue_tasks} atrasadas` 
        : 'Nenhuma atrasada',
      icon: metrics.overdue_tasks > 0 ? AlertTriangle : Clock,
      color: metrics.overdue_tasks > 0 ? 'text-destructive' : 'text-muted-foreground',
      bgColor: metrics.overdue_tasks > 0 ? 'bg-destructive/10' : 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-1.5 rounded-md ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.subValue}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
