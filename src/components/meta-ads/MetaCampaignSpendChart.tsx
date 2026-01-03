import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MetaCampaignMetrics } from '@/services/metaAdsService';
import { formatCurrency } from '@/services/metricsService';
import { BarChart3 } from 'lucide-react';

interface MetaCampaignSpendChartProps {
  data: MetaCampaignMetrics[];
}

const GRADIENT_COLORS = [
  '#8B5CF6',
  '#A78BFA',
  '#C4B5FD',
  '#DDD6FE',
  '#EDE9FE',
];

export function MetaCampaignSpendChart({ data }: MetaCampaignSpendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Nenhuma campanha encontrada para exibir.
        </CardContent>
      </Card>
    );
  }


  // Sort by spend and take top campaigns
  const chartData = [...data]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8)
    .map((campaign) => ({
      name:
        campaign.campaignName.length > 30
          ? campaign.campaignName.substring(0, 30) + '...'
          : campaign.campaignName,
      fullName: campaign.campaignName,
      spend: campaign.spend,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl max-w-xs">
          <p className="font-medium text-foreground text-sm break-words">{data.fullName}</p>
          <p className="text-lg font-bold text-purple-400 mt-1">
            {formatCurrency(data.spend)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Gasto por Campanha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={150}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
