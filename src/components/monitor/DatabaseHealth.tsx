import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Shield, Layers } from "lucide-react";

interface DatabaseHealthData {
  status: 'healthy' | 'warning' | 'critical';
  tables_count: number;
  rls_enabled_tables: number;
  indexes_count: number;
}

interface DatabaseHealthProps {
  health: DatabaseHealthData | null;
  isLoading: boolean;
}

export function DatabaseHealth({ health, isLoading }: DatabaseHealthProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Saúde do Banco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Saúde do Banco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Dados não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    healthy: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className={`h-5 w-5 ${statusColors[health.status]}`} />
          Saúde do Banco
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tabelas</span>
          </div>
          <span className="font-medium">{health.tables_count}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tabelas com RLS</span>
          </div>
          <span className="font-medium">{health.rls_enabled_tables}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Índices</span>
          </div>
          <span className="font-medium">{health.indexes_count}</span>
        </div>
      </CardContent>
    </Card>
  );
}
