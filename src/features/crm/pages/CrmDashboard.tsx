import { CrmMetricCards } from '../components/dashboard/CrmMetricCards';
import { CrmFunnelChart } from '../components/dashboard/CrmFunnelChart';
import { CrmConversionChart } from '../components/dashboard/CrmConversionChart';
import { useCrmMetrics } from '../hooks/useCrmMetrics';

export function CrmDashboard() {
  const { metrics, funnelData } = useCrmMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard CRM</h1>
        <p className="text-muted-foreground">
          Visão geral das métricas e performance do seu pipeline
        </p>
      </div>

      <CrmMetricCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrmFunnelChart data={funnelData} />
        <CrmConversionChart data={funnelData} />
      </div>
    </div>
  );
}
