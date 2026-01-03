import { supabase } from "@/integrations/supabase/client";

export interface DatabaseHealth {
  indexes_count: number;
  rls_enabled_tables: number;
  views_count: number;
  tables_count: number;
  status: 'healthy' | 'warning' | 'critical';
  checked_at: string;
}

export interface TableStatistic {
  table_name: string;
  row_count: number;
  dead_tuples: number;
  last_vacuum: string | null;
  last_autovacuum: string | null;
  last_analyze: string | null;
}

export interface PerformanceSummary {
  avg_response_time: number;
  avg_payload_size: number;
  total_queries: number;
  error_count: number;
  slow_queries: number;
  period_start: string;
  period_end: string;
}

export interface PerformanceLog {
  id: string;
  metric_type: string;
  metric_name: string;
  value: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  transferSize: number;
  timestamp: number;
}

class SystemMonitorService {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver | null = null;

  async getDatabaseHealth(): Promise<DatabaseHealth | null> {
    const { data, error } = await supabase.rpc('check_database_health');
    if (error) {
      console.error('Error fetching database health:', error);
      return null;
    }
    return data as unknown as DatabaseHealth;
  }

  async getTableStatistics(): Promise<TableStatistic[]> {
    const { data, error } = await supabase.rpc('get_table_statistics');
    if (error) {
      console.error('Error fetching table statistics:', error);
      return [];
    }
    return (data || []) as unknown as TableStatistic[];
  }

  async getPerformanceSummary(hoursBack: number = 24): Promise<PerformanceSummary | null> {
    const { data, error } = await supabase.rpc('get_performance_summary', {
      hours_back: hoursBack
    });
    if (error) {
      console.error('Error fetching performance summary:', error);
      return null;
    }
    return data as unknown as PerformanceSummary;
  }

  async getRecentLogs(limit: number = 50): Promise<PerformanceLog[]> {
    const { data, error } = await supabase
      .from('system_performance_logs')
      .select('id, metric_type, metric_name, value, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent logs:', error);
      return [];
    }
    return data as PerformanceLog[];
  }

  async logMetric(
    metricType: string,
    metricName: string,
    value: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await supabase.rpc('log_performance_metric', {
      p_metric_type: metricType,
      p_metric_name: metricName,
      p_value: value,
      p_metadata: (metadata || null) as unknown as Record<string, never>
    });
    
    if (error) {
      console.error('Error logging metric:', error);
    }
  }

  startClientMonitoring(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.name.includes('supabase') || 
                resourceEntry.name.includes('oorsclbnzfujgxzxfruj')) {
              this.metrics.push({
                name: this.extractEndpointName(resourceEntry.name),
                duration: resourceEntry.duration,
                transferSize: resourceEntry.transferSize || 0,
                timestamp: Date.now()
              });

              // Keep only last 100 metrics in memory
              if (this.metrics.length > 100) {
                this.metrics.shift();
              }

              // Log slow queries
              if (resourceEntry.duration > 500) {
                this.logMetric('response_time', this.extractEndpointName(resourceEntry.name), resourceEntry.duration, {
                  transferSize: resourceEntry.transferSize,
                  url: resourceEntry.name
                });
              }
            }
          }
        }
      });

      this.observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('PerformanceObserver not supported:', e);
    }
  }

  stopClientMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  getClientMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getClientMetricsSummary(): {
    avgResponseTime: number;
    avgPayloadSize: number;
    totalRequests: number;
    slowRequests: number;
  } {
    if (this.metrics.length === 0) {
      return {
        avgResponseTime: 0,
        avgPayloadSize: 0,
        totalRequests: 0,
        slowRequests: 0
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const totalSize = this.metrics.reduce((sum, m) => sum + m.transferSize, 0);
    const slowCount = this.metrics.filter(m => m.duration > 500).length;

    return {
      avgResponseTime: Math.round(totalDuration / this.metrics.length),
      avgPayloadSize: Math.round(totalSize / this.metrics.length / 1024), // KB
      totalRequests: this.metrics.length,
      slowRequests: slowCount
    };
  }

  private extractEndpointName(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      // Extract table name or function name from Supabase URL
      const match = path.match(/\/rest\/v1\/([^?]+)/);
      if (match) return match[1];
      const rpcMatch = path.match(/\/rest\/v1\/rpc\/([^?]+)/);
      if (rpcMatch) return `rpc:${rpcMatch[1]}`;
      return path.split('/').pop() || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

export const systemMonitorService = new SystemMonitorService();
