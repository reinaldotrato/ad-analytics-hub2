import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Target, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiData {
  cost?: number;
  leads?: number;
  sales?: number;
  revenue?: number;
  reach?: number;
}

interface ExecutiveKpiCardsProps {
  current?: KpiData | null;
  previous?: KpiData | null;
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

function calculateChange(current: number, previous: number): { value: number; isPositive: boolean } {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(change), isPositive: change >= 0 };
}

export function ExecutiveKpiCards({ current, previous }: ExecutiveKpiCardsProps) {
  const cards = [
    {
      title: 'Investimento Total',
      icon: DollarSign,
      value: current?.cost || 0,
      prevValue: previous?.cost || 0,
      format: formatCurrency,
      colorClass: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/20',
      invertChange: true, // Menos gasto é positivo
    },
    {
      title: 'Leads Gerados',
      icon: Users,
      value: current?.leads || 0,
      prevValue: previous?.leads || 0,
      format: formatNumber,
      colorClass: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-500/20',
    },
    {
      title: 'Vendas Realizadas',
      icon: Target,
      value: current?.sales || 0,
      prevValue: previous?.sales || 0,
      format: formatNumber,
      colorClass: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500/20',
    },
    {
      title: 'Receita Total',
      icon: TrendingUp,
      value: current?.revenue || 0,
      prevValue: previous?.revenue || 0,
      format: formatCurrency,
      colorClass: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const change = calculateChange(card.value, card.prevValue);
        const isPositive = card.invertChange ? !change.isPositive : change.isPositive;

        return (
          <Card 
            key={card.title} 
            className="relative"
          >
            {/* Gradient top border */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.colorClass} rounded-t-2xl z-20`} />
            
            {/* Background glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.iconBg} rounded-full blur-3xl opacity-30`} />
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground">{card.format(card.value)}</p>
                  
                  {/* Comparação com período anterior */}
                  {change.value > 0 && (
                    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span>{change.value.toFixed(1)}% vs mês anterior</span>
                    </div>
                  )}
                </div>
                
                <div className={`p-3 rounded-xl ${card.iconBg}`}>
                  <card.icon className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
