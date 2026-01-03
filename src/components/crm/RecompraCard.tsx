import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface RecompraCardProps {
  data?: {
    totalRecompras?: number;
    taxaRecompra?: number;
    valorMedioRecompra?: number;
  };
  isLoading?: boolean;
}

export function RecompraCard({ data, isLoading }: RecompraCardProps) {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recompra</CardTitle>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recompra</CardTitle>
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{data?.totalRecompras || 0}</div>
            <p className="text-xs text-muted-foreground">Total de recompras</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-semibold">
                {(data?.taxaRecompra || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Taxa de recompra</p>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {formatCurrency(data?.valorMedioRecompra)}
              </div>
              <p className="text-xs text-muted-foreground">Valor médio</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
