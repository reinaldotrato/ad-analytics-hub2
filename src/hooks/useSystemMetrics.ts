import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { 
  systemMonitorService, 
  DatabaseHealth, 
  PerformanceSummary, 
  TableStatistic,
  PerformanceLog 
} from "@/services/systemMonitorService";
import { optimizationService } from "@/services/optimizationService";
import { Alert } from "@/components/monitor/CapacityAlerts";

export function useSystemMetrics() {
  const [clientMetrics, setClientMetrics] = useState({
    avgResponseTime: 0,
    avgPayloadSize: 0,
    totalRequests: 0,
    slowRequests: 0
  });

  // Start client-side monitoring
  useEffect(() => {
    systemMonitorService.startClientMonitoring();
    
    const interval = setInterval(() => {
      setClientMetrics(systemMonitorService.getClientMetricsSummary());
    }, 2000);

    return () => {
      clearInterval(interval);
      systemMonitorService.stopClientMonitoring();
    };
  }, []);

  const databaseHealthQuery = useQuery<DatabaseHealth | null>({
    queryKey: ['system-monitor', 'database-health'],
    queryFn: () => systemMonitorService.getDatabaseHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000
  });

  const tableStatsQuery = useQuery<TableStatistic[]>({
    queryKey: ['system-monitor', 'table-statistics'],
    queryFn: () => systemMonitorService.getTableStatistics(),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  });

  const performanceSummaryQuery = useQuery<PerformanceSummary | null>({
    queryKey: ['system-monitor', 'performance-summary'],
    queryFn: () => systemMonitorService.getPerformanceSummary(24),
    refetchInterval: 30000,
    staleTime: 10000
  });

  const recentLogsQuery = useQuery<PerformanceLog[]>({
    queryKey: ['system-monitor', 'recent-logs'],
    queryFn: () => systemMonitorService.getRecentLogs(50),
    refetchInterval: 10000,
    staleTime: 5000
  });

  const refetchAll = () => {
    databaseHealthQuery.refetch();
    tableStatsQuery.refetch();
    performanceSummaryQuery.refetch();
    recentLogsQuery.refetch();
  };

  // Calculate overall system status
  const getSystemStatus = (): 'online' | 'warning' | 'critical' => {
    const health = databaseHealthQuery.data;
    const summary = performanceSummaryQuery.data;

    if (!health || !summary) return 'online';

    if (health.status === 'critical') return 'critical';
    if (summary.error_count > 10) return 'critical';
    if (summary.slow_queries > 20) return 'warning';
    if (health.status === 'warning') return 'warning';

    return 'online';
  };

  // Generate alerts based on metrics with actionable CTAs
  const getAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const health = databaseHealthQuery.data;
    const summary = performanceSummaryQuery.data;

    if (health) {
      if (health.indexes_count < 5) {
        alerts.push({ 
          level: 'warning', 
          message: `Poucos índices de performance (${health.indexes_count})`,
          action: {
            label: 'Ver Tabelas',
            handler: () => window.open(optimizationService.getSupabaseTableEditorUrl(), '_blank')
          }
        });
      }
      if (health.rls_enabled_tables < 10) {
        alerts.push({ 
          level: 'info', 
          message: `${health.rls_enabled_tables} tabelas com RLS ativo` 
        });
      }
    }

    if (summary) {
      if (summary.avg_response_time > 500) {
        alerts.push({ 
          level: 'warning', 
          message: `Tempo médio de resposta alto: ${Math.round(summary.avg_response_time)}ms`,
          action: {
            label: 'Ver Logs',
            handler: () => window.open(optimizationService.getSupabaseLogsUrl(), '_blank')
          }
        });
      }
      if (summary.slow_queries > 10) {
        alerts.push({ 
          level: 'warning', 
          message: `${summary.slow_queries} queries lentas (>500ms) nas últimas 24h`,
          action: {
            label: 'Investigar',
            handler: () => window.open(optimizationService.getSupabaseLogsUrl(), '_blank')
          }
        });
      }
      if (summary.error_count > 0) {
        alerts.push({ 
          level: 'critical', 
          message: `${summary.error_count} erros registrados nas últimas 24h`,
          action: {
            label: 'Ver Erros',
            handler: () => window.open(optimizationService.getSupabaseLogsUrl(), '_blank')
          }
        });
      }
    }

    if (clientMetrics.avgResponseTime > 300) {
      alerts.push({ 
        level: 'warning', 
        message: `Response time atual: ${clientMetrics.avgResponseTime}ms`,
        action: {
          label: 'Diagnóstico',
          handler: () => window.open(optimizationService.getSupabaseLogsUrl(), '_blank')
        }
      });
    }

    if (alerts.length === 0) {
      alerts.push({ level: 'info', message: 'Todos os sistemas operando normalmente' });
    }

    return alerts;
  };

  return {
    databaseHealth: databaseHealthQuery.data,
    tableStats: tableStatsQuery.data || [],
    performanceSummary: performanceSummaryQuery.data,
    recentLogs: recentLogsQuery.data || [],
    clientMetrics,
    isLoading: databaseHealthQuery.isLoading || performanceSummaryQuery.isLoading,
    systemStatus: getSystemStatus(),
    alerts: getAlerts(),
    refetchAll
  };
}
