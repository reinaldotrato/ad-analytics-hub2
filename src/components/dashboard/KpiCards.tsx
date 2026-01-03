import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricTooltip } from "./MetricTooltip";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiData {
  spend?: number;
  impressions?: number;
  clicks?: number;
  leads?: number;
  cpl?: number;
  ctr?: number;
  cpc?: number;
  conversions?: number;
  revenue?: number;
  roas?: number;
}

interface KpiCardsProps {
  data?: KpiData;
  currentMonth?: KpiData;
  previousMonth?: KpiData;
  previousData?: KpiData;
  isLoading?: boolean;
  channel?: string;
}

export function KpiCards({ data, currentMonth, previousMonth, previousData, isLoading, channel }: KpiCardsProps) {
  // Support both data prop and currentMonth/previousMonth props
  const kpiData = data || currentMonth;
  const prevData = previousData || previousMonth;
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return "0";
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null) return "0%";
    return `${value.toFixed(2)}%`;
  };

  const calculateChange = (current?: number, previous?: number) => {
    if (!current || !previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const kpis = [
    {
      title: "Investimento",
      value: formatCurrency(kpiData?.spend),
      change: calculateChange(kpiData?.spend, prevData?.spend),
      icon: DollarSign,
      tooltip: "Total investido em mídia paga no período",
    },
    {
      title: "Leads",
      value: formatNumber(kpiData?.leads),
      change: calculateChange(kpiData?.leads, prevData?.leads),
      icon: Users,
      tooltip: "Quantidade de leads gerados",
    },
    {
      title: "CPL",
      value: formatCurrency(kpiData?.cpl),
      change: calculateChange(kpiData?.cpl, prevData?.cpl),
      icon: Target,
      tooltip: "Custo por Lead (Investimento / Leads)",
      inverseChange: true,
    },
    {
      title: "ROAS",
      value: kpiData?.roas ? `${kpiData.roas.toFixed(2)}x` : "0x",
      change: calculateChange(kpiData?.roas, prevData?.roas),
      icon: BarChart3,
      tooltip: "Retorno sobre investimento em anúncios",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {kpi.title}
              <MetricTooltip content={kpi.tooltip} />
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            {kpi.change !== null && (
              <p
                className={cn(
                  "text-xs flex items-center gap-1",
                  kpi.inverseChange
                    ? kpi.change < 0
                      ? "text-green-600"
                      : "text-red-600"
                    : kpi.change > 0
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {kpi.change > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(kpi.change).toFixed(1)}% vs período anterior
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
