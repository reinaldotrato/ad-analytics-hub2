import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, ShoppingCart } from 'lucide-react';

interface FunnelData {
  reach: number;
  leads: number;
  opportunities: number;
  sales: number;
}

interface SalesFunnelChartProps {
  data: FunnelData;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return new Intl.NumberFormat('pt-BR').format(value);
}

function calculateRate(current: number, previous: number): string {
  if (previous === 0) return '0%';
  return ((current / previous) * 100).toFixed(2) + '%';
}

export function SalesFunnelChart({ data }: SalesFunnelChartProps) {
  // Calcular larguras proporcionais (mínimo 15% para visibilidade)
  const leadsWidth = data.reach > 0 ? Math.max(60, (data.leads / data.reach) * 100) : 60;
  const opportunitiesWidth = data.reach > 0 ? Math.max(40, (data.opportunities / data.reach) * 100) : 40;
  const salesWidth = data.reach > 0 ? Math.max(25, (data.sales / data.reach) * 100) : 25;

  const stages = [
    {
      name: 'Alcance',
      value: data.reach,
      icon: Users,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-500/20',
      width: '100%',
    },
    {
      name: 'Leads',
      value: data.leads,
      icon: Target,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-500/20',
      width: `${leadsWidth}%`,
      rate: calculateRate(data.leads, data.reach),
    },
    {
      name: 'Oportunidades',
      value: data.opportunities,
      icon: Target,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-500/20',
      width: `${opportunitiesWidth}%`,
      rate: calculateRate(data.opportunities, data.leads),
    },
    {
      name: 'Vendas',
      value: data.sales,
      icon: ShoppingCart,
      color: 'from-cyan-400 to-cyan-600',
      bgColor: 'bg-cyan-500/20',
      width: `${salesWidth}%`,
      rate: calculateRate(data.sales, data.opportunities),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.name} className="space-y-2">
            {/* Label e valor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stage.bgColor}`}>
                  <stage.icon className="h-4 w-4 text-foreground" />
                </div>
                <span className="font-medium text-foreground">{stage.name}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-foreground">
                  {formatNumber(stage.value)}
                </span>
                {stage.rate && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({stage.rate})
                  </span>
                )}
              </div>
            </div>
            
            {/* Barra do funil */}
            <div className="relative">
              <div 
                className={`h-10 rounded-lg bg-gradient-to-r ${stage.color} transition-all duration-500 flex items-center justify-center`}
                style={{ width: stage.width }}
              >
                <span className="text-white text-sm font-medium drop-shadow-sm">
                  {formatNumber(stage.value)}
                </span>
              </div>
            </div>
            
            {/* Seta de conversão entre etapas */}
            {index < stages.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="flex flex-col items-center">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-muted-foreground/30" />
                  {stages[index + 1].rate && (
                    <span className="text-xs text-muted-foreground mt-1">
                      Taxa: {stages[index + 1].rate}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Resumo final */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Conversão Total (Alcance → Vendas)</span>
            <span className="text-lg font-bold text-emerald-500">
              {calculateRate(data.sales, data.reach)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
