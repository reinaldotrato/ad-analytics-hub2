import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FunnelStageWithMetrics } from '../../lib/types';

interface CrmFunnelChartProps {
  data: FunnelStageWithMetrics[];
}

export function CrmFunnelChart({ data }: CrmFunnelChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter active stages only (not won/lost)
  const activeStages = data.filter(s => !s.is_won && !s.is_lost);
  const closedStages = data.filter(s => s.is_won || s.is_lost);
  
  // Calculate max for relative widths
  const maxDeals = Math.max(...activeStages.map(s => s.deals_count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Funnel Stages */}
        <div className="space-y-3">
          {activeStages.map((stage, index) => {
            const widthPercent = Math.max(20, (stage.deals_count / maxDeals) * 100);
            
            return (
              <div key={stage.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{stage.deals_count} deals</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(stage.deals_value)}
                    </span>
                  </div>
                </div>
                <div className="h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-center"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: stage.color,
                    }}
                  >
                    {stage.deals_count > 0 && (
                      <span className="text-xs font-medium text-white">
                        {stage.deals_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closed Stages Summary */}
        {closedStages.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-3">Fechados</p>
            <div className="grid grid-cols-2 gap-4">
              {closedStages.map(stage => (
                <div
                  key={stage.id}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: stage.color + '15' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-medium">{stage.name}</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: stage.color }}>
                    {stage.deals_count}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stage.deals_value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
