import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Database, Zap } from "lucide-react";

interface SystemStatusCardsProps {
  systemStatus: 'online' | 'warning' | 'critical';
  avgResponseTime: number;
  totalRequests: number;
  avgPayloadSize: number;
}

const statusConfig = {
  online: { label: 'Online', color: 'text-green-500', bg: 'bg-green-500/10' },
  warning: { label: 'Atenção', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  critical: { label: 'Crítico', color: 'text-red-500', bg: 'bg-red-500/10' },
};

export function SystemStatusCards({ 
  systemStatus, 
  avgResponseTime, 
  totalRequests, 
  avgPayloadSize 
}: SystemStatusCardsProps) {
  const status = statusConfig[systemStatus];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <Activity className={`h-4 w-4 ${status.color}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${status.color}`}>{status.label}</div>
          <p className="text-xs text-muted-foreground">Sistema operacional</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
          <p className="text-xs text-muted-foreground">Média atual</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requisições</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests}</div>
          <p className="text-xs text-muted-foreground">Total na sessão</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payload Médio</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(avgPayloadSize / 1024).toFixed(1)}KB
          </div>
          <p className="text-xs text-muted-foreground">Por requisição</p>
        </CardContent>
      </Card>
    </div>
  );
}
