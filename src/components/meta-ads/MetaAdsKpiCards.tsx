import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Eye, Monitor, MessageCircle, FileText } from 'lucide-react';
import { MetaKpiTotals } from '@/services/metaAdsService';
import { formatCurrency, formatNumber } from '@/services/metricsService';

interface MetaAdsKpiCardsProps {
  data: MetaKpiTotals | undefined;
  previousData?: MetaKpiTotals;
}

export const MetaAdsKpiCards = memo(function MetaAdsKpiCards({ data, previousData }: MetaAdsKpiCardsProps) {
  if (!data) return null;

  const calculateChange = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Linha 1: Métricas Base
  const baseKpis = [
    {
      title: 'Gasto Total',
      value: formatCurrency(data.totalSpend),
      change: previousData ? calculateChange(data.totalSpend, previousData.totalSpend) : null,
      icon: DollarSign,
      colorClass: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Impressões',
      value: formatNumber(data.totalImpressions),
      change: previousData ? calculateChange(data.totalImpressions, previousData.totalImpressions) : null,
      icon: Eye,
      colorClass: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Alcance',
      value: formatNumber(data.totalReach),
      change: previousData ? calculateChange(data.totalReach, previousData.totalReach) : null,
      icon: Users,
      colorClass: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  // Linha 2: Métricas de Resultado
  const resultKpis = [
    {
      title: 'Leads',
      value: formatNumber(data.totalLeads),
      change: previousData ? calculateChange(data.totalLeads, previousData.totalLeads) : null,
      icon: FileText,
      colorClass: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Mensagens',
      value: formatNumber(data.totalMessages),
      change: previousData ? calculateChange(data.totalMessages, previousData.totalMessages) : null,
      icon: MessageCircle,
      colorClass: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Visualizações de Página',
      value: formatNumber(data.totalPageViews),
      change: previousData ? calculateChange(data.totalPageViews, previousData.totalPageViews) : null,
      icon: Monitor,
      colorClass: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  // Linha 3: Métricas de Custo
  const costKpis = [
    {
      title: 'Custo/Lead',
      value: data.costPerLead ? formatCurrency(data.costPerLead) : '-',
      change: previousData?.costPerLead
        ? calculateChange(data.costPerLead || 0, previousData.costPerLead)
        : null,
      icon: FileText,
      colorClass: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      invertColor: true,
    },
    {
      title: 'Custo/Mensagem',
      value: data.costPerMessage ? formatCurrency(data.costPerMessage) : '-',
      change: previousData?.costPerMessage
        ? calculateChange(data.costPerMessage || 0, previousData.costPerMessage)
        : null,
      icon: MessageCircle,
      colorClass: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      invertColor: true,
    },
    {
      title: 'Custo/Visualização',
      value: data.costPerPageView ? formatCurrency(data.costPerPageView) : '-',
      change: previousData?.costPerPageView
        ? calculateChange(data.costPerPageView || 0, previousData.costPerPageView)
        : null,
      icon: Monitor,
      colorClass: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      invertColor: true,
    },
  ];

  const renderCard = (kpi: typeof baseKpis[0] & { invertColor?: boolean }) => {
    const Icon = kpi.icon;
    const invertColor = kpi.invertColor || false;
    const isPositive = invertColor
      ? kpi.change !== null && kpi.change < 0
      : kpi.change !== null && kpi.change > 0;

    return (
      <Card key={kpi.title} className="hover:scale-[1.02] transition-transform">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {kpi.title}
            </span>
            <div className={`p-2 rounded-xl ${kpi.bgColor}`}>
              <Icon className={`h-4 w-4 ${kpi.colorClass}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${kpi.colorClass} mb-1`}>{kpi.value}</div>
          {kpi.change !== null && (
            <div
              className={`text-xs font-medium ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? '▲' : '▼'} {Math.abs(kpi.change).toFixed(1)}% vs período anterior
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Linha 1: Métricas Base */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {baseKpis.map((kpi) => renderCard(kpi))}
      </div>

      {/* Linha 2: Métricas de Resultado */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {resultKpis.map((kpi) => renderCard(kpi))}
      </div>

      {/* Linha 3: Métricas de Custo */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {costKpis.map((kpi) => renderCard(kpi))}
      </div>
    </div>
  );
});
