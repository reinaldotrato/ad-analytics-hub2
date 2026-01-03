import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Target, TrendingUp } from "lucide-react";

interface CrmKpiCardsProps {
  data?: {
    totalDeals?: number;
    totalValue?: number;
    wonDeals?: number;
    wonValue?: number;
    avgDealValue?: number;
    conversionRate?: number;
  };
  isLoading?: boolean;
}

export function CrmKpiCards({ data, isLoading }: CrmKpiCardsProps) {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const kpis = [
    {
      title: "Total de Negócios",
      value: data?.totalDeals || 0,
      icon: Users,
    },
    {
      title: "Valor Total",
      value: formatCurrency(data?.totalValue),
      icon: DollarSign,
    },
    {
      title: "Negócios Ganhos",
      value: data?.wonDeals || 0,
      icon: Target,
    },
    {
      title: "Taxa de Conversão",
      value: `${(data?.conversionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
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
