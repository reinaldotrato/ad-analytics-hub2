import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Trophy, TrendingUp, DollarSign } from 'lucide-react';

interface OverviewMetrics {
  total_leads: number;
  total_opportunities: number;
  total_sales: number;
  conversion_rate: number;
  average_ticket: number;
}

interface ReportsOverviewTabProps {
  metrics: OverviewMetrics;
}

export function ReportsOverviewTab({ metrics }: ReportsOverviewTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const kpiCards = [
    {
      title: 'Total de Leads',
      value: metrics.total_leads.toString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total de Oportunidades',
      value: metrics.total_opportunities.toString(),
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Vendas Fechadas',
      value: metrics.total_sales.toString(),
      icon: Trophy,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Taxa de Conversão',
      value: formatPercent(metrics.conversion_rate),
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(metrics.average_ticket),
      icon: DollarSign,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpiCards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className={`absolute top-4 right-4 p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
            <p className="text-2xl font-semibold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
