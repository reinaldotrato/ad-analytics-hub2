import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Target, ShoppingCart, TrendingUp } from 'lucide-react';

interface GlobalKpiCardsProps {
  totals: {
    totalSpend: number;
    leads: number;
    opportunities: number;
    sales: number;
    revenue: number;
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function GlobalKpiCards({ totals }: GlobalKpiCardsProps) {
  const kpis = [
    {
      label: 'Gasto Total',
      value: formatCurrency(totals.totalSpend),
      icon: DollarSign,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Leads',
      value: formatNumber(totals.leads),
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Oportunidades',
      value: formatNumber(totals.opportunities),
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Vendas',
      value: formatNumber(totals.sales),
      icon: ShoppingCart,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Receita',
      value: formatCurrency(totals.revenue),
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
