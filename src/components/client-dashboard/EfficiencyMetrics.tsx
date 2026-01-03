import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Percent, TrendingUp, Receipt } from 'lucide-react';

interface KpiData {
  cost?: number;
  leads?: number;
  sales?: number;
  revenue?: number;
}

interface EfficiencyMetricsProps {
  kpis?: KpiData | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function EfficiencyMetrics({ kpis }: EfficiencyMetricsProps) {
  const cost = kpis?.cost || 0;
  const leads = kpis?.leads || 0;
  const sales = kpis?.sales || 0;
  const revenue = kpis?.revenue || 0;

  const cpl = leads > 0 ? cost / leads : 0;
  const conversionRate = leads > 0 ? (sales / leads) * 100 : 0;
  const roas = cost > 0 ? revenue / cost : 0;
  const averageTicket = sales > 0 ? revenue / sales : 0;

  const metrics = [
    {
      title: 'CPL',
      subtitle: 'Custo por Lead',
      value: formatCurrency(cpl),
      description: 'Quanto você paga por cada lead captado',
      icon: DollarSign,
      colorClass: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Taxa de Conversão',
      subtitle: 'Leads → Vendas',
      value: `${conversionRate.toFixed(1)}%`,
      description: 'Percentual de leads que se tornaram clientes',
      icon: Percent,
      colorClass: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'ROAS',
      subtitle: 'Retorno sobre Investimento',
      value: `${roas.toFixed(1)}x`,
      description: `Para cada R$1 investido, você faturou R$${roas.toFixed(2)}`,
      icon: TrendingUp,
      colorClass: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Ticket Médio',
      subtitle: 'Valor por Venda',
      value: formatCurrency(averageTicket),
      description: 'Valor médio de cada venda realizada',
      icon: Receipt,
      colorClass: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {metric.title}
                </p>
                <p className={`text-2xl font-bold ${metric.colorClass} mt-1`}>
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {metric.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}