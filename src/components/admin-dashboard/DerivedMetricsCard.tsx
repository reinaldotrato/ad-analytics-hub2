import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, Percent, Target } from 'lucide-react';

interface DerivedMetricsCardProps {
  cal: number;
  cav: number;
  roas: number;
  conversionRate: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function DerivedMetricsCard({ cal, cav, roas, conversionRate }: DerivedMetricsCardProps) {
  const metrics = [
    {
      label: 'CAL (Custo por Lead)',
      value: formatCurrency(cal),
      icon: Calculator,
      description: 'Gasto total ÷ Leads',
    },
    {
      label: 'CAV (Custo por Venda)',
      value: formatCurrency(cav),
      icon: Target,
      description: 'Gasto total ÷ Vendas',
    },
    {
      label: 'ROAS',
      value: `${roas.toFixed(2)}x`,
      icon: TrendingUp,
      description: 'Receita ÷ Gasto',
    },
    {
      label: 'Taxa Conversão',
      value: `${conversionRate.toFixed(1)}%`,
      icon: Percent,
      description: 'Vendas ÷ Leads',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Métricas Derivadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{metric.label}</p>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </div>
            <span className="text-lg font-bold">{metric.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
