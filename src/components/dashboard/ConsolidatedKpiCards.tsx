import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3 } from "lucide-react";

interface ConsolidatedKpiCardsProps {
  data?: {
    totalSpend?: number;
    totalLeads?: number;
    totalConversions?: number;
    totalRevenue?: number;
    avgCpl?: number;
    avgRoas?: number;
  };
  isLoading?: boolean;
}

export function ConsolidatedKpiCards({ data, isLoading }: ConsolidatedKpiCardsProps) {
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

  const kpis = [
    {
      title: "Investimento Total",
      value: formatCurrency(data?.totalSpend),
      icon: DollarSign,
    },
    {
      title: "Total de Leads",
      value: formatNumber(data?.totalLeads),
      icon: Users,
    },
    {
      title: "CPL Médio",
      value: formatCurrency(data?.avgCpl),
      icon: Target,
    },
    {
      title: "ROAS Médio",
      value: data?.avgRoas ? `${data.avgRoas.toFixed(2)}x` : "0x",
      icon: BarChart3,
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
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
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
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
