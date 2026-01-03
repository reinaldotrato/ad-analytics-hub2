import { Button } from "@/components/ui/button";
import { RefreshCw, Monitor } from "lucide-react";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { SystemStatusCards } from "@/components/monitor/SystemStatusCards";
import { CapacityAlerts } from "@/components/monitor/CapacityAlerts";
import { DatabaseHealth } from "@/components/monitor/DatabaseHealth";
import { QueryLogsTable } from "@/components/monitor/QueryLogsTable";
import { PerformanceChart } from "@/components/monitor/PerformanceChart";
import { TableStatistics } from "@/components/monitor/TableStatistics";

export default function SystemMonitor() {
  const {
    databaseHealth,
    tableStats,
    recentLogs,
    clientMetrics,
    isLoading,
    systemStatus,
    alerts,
    refetchAll
  } = useSystemMetrics();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Monitor do Sistema</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe a performance e saúde do aplicativo em tempo real
            </p>
          </div>
        </div>
        <Button onClick={refetchAll} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status Cards */}
      <SystemStatusCards
        systemStatus={systemStatus}
        avgResponseTime={clientMetrics.avgResponseTime}
        totalRequests={clientMetrics.totalRequests}
        avgPayloadSize={clientMetrics.avgPayloadSize}
      />

      {/* Alerts */}
      <CapacityAlerts alerts={alerts} />

      {/* Charts and Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart logs={recentLogs} />
        <DatabaseHealth health={databaseHealth} isLoading={isLoading} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QueryLogsTable logs={recentLogs} isLoading={false} />
        <TableStatistics stats={tableStats} isLoading={isLoading} />
      </div>
    </div>
  );
}
