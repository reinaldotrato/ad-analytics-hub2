import { useState } from 'react';
import { startOfMonth, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getConsolidatedKpis, getWeeklyEvolution } from '@/services/consolidatedKpisService';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import { ExecutiveKpiCards } from '@/components/client-dashboard/ExecutiveKpiCards';
import { InvestmentPieChart } from '@/components/client-dashboard/InvestmentPieChart';
import { SalesFunnelChart } from '@/components/client-dashboard/SalesFunnelChart';
import { EfficiencyMetrics } from '@/components/client-dashboard/EfficiencyMetrics';
import { EvolutionChart } from '@/components/client-dashboard/EvolutionChart';
import { AnalystChatbot } from '@/components/chat/AnalystChatbot';
import { useGoals } from '@/features/crm/hooks/useGoals';
import { useGoalMetrics } from '@/features/crm/hooks/useGoalMetrics';
import { GoalEvolutionChart } from '@/features/crm/components/goals/GoalEvolutionChart';
import { SellerRankingTable } from '@/features/crm/components/goals/SellerRankingTable';
import { TrendingUp } from 'lucide-react';

export default function ClientDashboard() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId : clientId;
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Format dates for queries
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  // KPIs consolidados (Meta Ads + RD Station + Eduzz)
  const { data: consolidatedKpis, isLoading: loadingKpis } = useQuery({
    queryKey: ['executive-consolidated-kpis', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getConsolidatedKpis(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId,
  });

  // Dados semanais para o gráfico de evolução
  const { data: weeklyData, isLoading: loadingWeekly } = useQuery({
    queryKey: ['executive-weekly-evolution', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getWeeklyEvolution(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId,
  });

  // Dados de metas e vendedores
  const {
    currentGeneralGoal,
    currentSellerGoals,
    sellers,
    goalProgress,
    isLoading: loadingGoals,
  } = useGoals();

  const { dailyData, isLoading: loadingDailyData } = useGoalMetrics();

  const isLoading = loadingKpis || loadingWeekly || loadingGoals || loadingDailyData;

  // Dados para o ranking de vendedores
  const sellerRankingData = sellers.map(seller => ({
    seller,
    goal: currentSellerGoals.find(g => g.seller_id === seller.id),
    progress: goalProgress?.get(seller.id) || { sales: 0, value: 0, leads: 0, opportunities: 0 },
  }));

  const generalProgress = goalProgress?.get('general');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  // Dados para o gráfico de pizza (investimento por canal)
  const pieData = [
    { name: 'Google Ads', value: consolidatedKpis?.googleSpend || 0, color: '#8B5CF6' },
    { name: 'Meta Ads', value: consolidatedKpis?.metaSpend || 0, color: '#EC4899' },
  ];

  // Converter para formato esperado pelo ExecutiveKpiCards
  const currentKpisForCards = consolidatedKpis ? {
    cost: consolidatedKpis.investment,
    leads: consolidatedKpis.leads,
    sales: consolidatedKpis.sales,
    revenue: consolidatedKpis.revenue,
    reach: consolidatedKpis.reach,
  } : undefined;

  // Converter para formato esperado pelo EfficiencyMetrics
  const efficiencyKpis = consolidatedKpis ? {
    cost: consolidatedKpis.investment,
    leads: consolidatedKpis.leads,
    sales: consolidatedKpis.sales,
    revenue: consolidatedKpis.revenue,
    cpl: consolidatedKpis.cpl,
    roas: consolidatedKpis.roas,
    conversionRate: consolidatedKpis.conversionRate,
  } : undefined;

  // Dados do funil consolidado
  const funnelData = consolidatedKpis ? {
    reach: consolidatedKpis.reach,
    leads: consolidatedKpis.leads,
    opportunities: consolidatedKpis.opportunities,
    sales: consolidatedKpis.sales,
  } : { reach: 0, leads: 0, opportunities: 0, sales: 0 };

  // Converter dados semanais para formato do EvolutionChart
  const evolutionData = (weeklyData || []).map(week => ({
    month: week.week,
    leads: week.leads,
    sales: week.sales,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visão Executiva</h1>
          <p className="text-muted-foreground">Métricas de performance do seu negócio</p>
        </div>
        <PeriodFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Seção 1: KPIs Principais */}
      <ExecutiveKpiCards 
        current={currentKpisForCards} 
      />

      {/* Seção 2: Gráficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvestmentPieChart data={pieData} />
        <SalesFunnelChart data={funnelData} />
      </div>

      {/* Seção 3: Métricas de Eficiência */}
      <EfficiencyMetrics kpis={efficiencyKpis} />

      {/* Seção 4: Evolução Temporal */}
      <EvolutionChart data={evolutionData} />

      {/* Seção 5: Metas & Equipe */}
      {currentGeneralGoal && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Evolução & Equipe</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <GoalEvolutionChart
                goal={currentGeneralGoal.sales_value_goal}
                currentValue={generalProgress?.value || 0}
                dailyData={dailyData}
                title="Evolução de Vendas"
                type="currency"
              />
            </div>
            <div className="lg:col-span-2">
              <SellerRankingTable sellers={sellerRankingData} maxItems={5} />
            </div>
          </div>
        </section>
      )}

      <AnalystChatbot />
    </div>
  );
}
