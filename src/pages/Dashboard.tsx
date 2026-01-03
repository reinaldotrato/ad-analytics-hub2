import { useState } from 'react';
import { startOfMonth } from 'date-fns';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { AnalystChatbot } from '@/components/chat/AnalystChatbot';
import { KpiTable } from '@/components/dashboard/KpiTable';
import { MonthlyCharts } from '@/components/dashboard/MonthlyCharts';
import { ChannelBarChart } from '@/components/dashboard/ChannelBarChart';
import { CampaignCostTable } from '@/components/dashboard/CampaignCostTable';
import { CampaignPerformanceTable } from '@/components/dashboard/CampaignPerformanceTable';
import { KeywordPerformanceTable } from '@/components/dashboard/KeywordPerformanceTable';
import { ChannelTabs } from '@/components/dashboard/ChannelTabs';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useDashboardData } from '@/hooks/useDashboardData';

// Consolidated components for "Total" tab
import { ConsolidatedKpiCards } from '@/components/dashboard/ConsolidatedKpiCards';
import { FullFunnelChart } from '@/components/dashboard/FullFunnelChart';
import { WeeklyEvolutionChart } from '@/components/dashboard/WeeklyEvolutionChart';
import { CampaignAttributionTable } from '@/components/dashboard/CampaignAttributionTable';
import { AdsetPerformanceTable } from '@/components/dashboard/AdsetPerformanceTable';
import { TopAdsTable } from '@/components/dashboard/TopAdsTable';

// Meta Ads components
import { MetaAdsKpiCards } from '@/components/meta-ads/MetaAdsKpiCards';
import { MetaCampaignTable } from '@/components/meta-ads/MetaCampaignTable';
import { MetaTopAdsTable } from '@/components/meta-ads/MetaTopAdsTable';
import { MetaCampaignSpendChart } from '@/components/meta-ads/MetaCampaignSpendChart';
import { MetaBreakdownPlatformChart } from '@/components/meta-ads/MetaBreakdownPlatformChart';
import { MetaBreakdownAgeChart } from '@/components/meta-ads/MetaBreakdownAgeChart';
import { MetaBreakdownRegionChart } from '@/components/meta-ads/MetaBreakdownRegionChart';
import { MetaBreakdownGenderChart } from '@/components/meta-ads/MetaBreakdownGenderChart';
import { MetaBreakdownPositionChart } from '@/components/meta-ads/MetaBreakdownPositionChart';
import { MetaDailyEvolutionChart } from '@/components/meta-ads/MetaDailyEvolutionChart';

// CRM components
import { CrmKpiCards } from '@/components/crm/CrmKpiCards';
import { SalesFunnelChart } from '@/components/crm/SalesFunnelChart';
import { LostReasonsChart } from '@/components/crm/LostReasonsChart';
import { DealsEvolutionChart } from '@/components/crm/DealsEvolutionChart';
import { DealsByOriginChart } from '@/components/crm/DealsByOriginChart';
import { DealsByStageChart } from '@/components/crm/DealsByStageChart';
import { RecompraCard } from '@/components/crm/RecompraCard';

type Channel = 'all' | 'google_ads' | 'meta_ads' | 'crm';

export default function Dashboard() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('all');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const { 
    currentMonthKpis, 
    previousMonthKpis, 
    monthlyKpis, 
    googleKpis, 
    metaKpis, 
    campaignData,
    keywordData,
    // RD Station Leads
    rdStationLeads,
    rdStationLeadsPrevious,
    // Consolidated data for "Total" tab
    consolidatedKpis,
    campaignAttribution,
    adsetPerformance,
    topAds,
    weeklyEvolution,
    monthlyConsolidatedKpis,
    // Meta Ads data
    metaCampaigns,
    metaTopAds,
    metaPlatformData,
    metaDemographicData,
    metaKpiTotals,
    metaKpiTotalsPrevious,
    // Meta Ads Breakdown data
    metaPlatformBreakdown,
    metaAgeBreakdown,
    metaRegionBreakdown,
    metaGenderBreakdown,
    metaPositionBreakdown,
    metaDailyEvolution,
    // CRM Deals data
    crmKpiTotals,
    crmFunnelData,
    crmLostReasons,
    crmEvolutionData,
    crmDealsByStage,
    crmDealsByOrigin,
    crmRecompraEvolution,
    channelStatus,
    isLoading
  } = useDashboardData(startDate, endDate, selectedChannel);

  // Show skeleton while loading - progressive loading experience
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {selectedChannel === 'meta_ads' 
                ? 'Relatório Meta Ads' 
                : 'Relatório Geral de Performance'}
            </h1>
            <p className="text-muted-foreground">
              {selectedChannel === 'meta_ads' 
                ? 'Análise detalhada de campanhas Meta' 
                : 'Visão Geral'}
            </p>
          </div>
          
          <PeriodFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        <ChannelTabs 
          selectedChannel={selectedChannel} 
          onChannelChange={setSelectedChannel} 
          channelStatus={channelStatus}
        />

        <DashboardSkeleton channel={selectedChannel} />
        
        <AnalystChatbot />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {selectedChannel === 'meta_ads' 
              ? 'Relatório Meta Ads' 
              : 'Relatório Geral de Performance'}
          </h1>
          <p className="text-muted-foreground">
            {selectedChannel === 'meta_ads' 
              ? 'Análise detalhada de campanhas Meta' 
              : 'Visão Geral'}
          </p>
        </div>
        
        <PeriodFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      <ChannelTabs 
        selectedChannel={selectedChannel} 
        onChannelChange={setSelectedChannel} 
        channelStatus={channelStatus}
      />

      {selectedChannel === 'meta_ads' ? (
        <div className="space-y-6">
          {/* Meta Ads KPIs */}
          <MetaAdsKpiCards data={metaKpiTotals} previousData={metaKpiTotalsPrevious} />

          {/* Gráficos de Breakdown - 2 rows */}
          <div className="grid gap-6 lg:grid-cols-2">
            <MetaBreakdownPlatformChart data={metaPlatformBreakdown || []} />
            <MetaBreakdownGenderChart data={metaGenderBreakdown || []} />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <MetaBreakdownAgeChart data={metaAgeBreakdown || []} />
            <MetaBreakdownRegionChart data={metaRegionBreakdown || []} />
            <MetaBreakdownPositionChart data={metaPositionBreakdown || []} />
          </div>

          {/* Gráfico de evolução diária */}
          <MetaDailyEvolutionChart data={metaDailyEvolution || []} />

          {/* Gasto por campanha */}
          <MetaCampaignSpendChart data={metaCampaigns || []} />

          {/* Tabela de campanhas */}
          <MetaCampaignTable data={metaCampaigns || []} />

          {/* Top 10 anúncios */}
          <MetaTopAdsTable data={metaTopAds || []} />
        </div>
      ) : selectedChannel === 'google_ads' ? (
        <div className="space-y-6">
          <KpiCards
            currentMonth={currentMonthKpis}
            previousMonth={previousMonthKpis}
            channel={selectedChannel}
          />
          <CampaignPerformanceTable data={campaignData || []} />
          <KeywordPerformanceTable data={keywordData || []} />
        </div>
      ) : selectedChannel === 'crm' ? (
        <div className="space-y-6">
          {/* Row 1: CRM KPI Cards */}
          <CrmKpiCards data={crmKpiTotals} />

          {/* Row 2: Funil de Vendas (60%) + Card Recompra (40%) */}
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <SalesFunnelChart data={crmFunnelData} />
            </div>
            <div className="lg:col-span-2">
              <RecompraCard 
                totalClientes={crmKpiTotals?.wonDeals || 0} 
                receita={crmKpiTotals?.recompraRevenue || 0} 
                taxaRecompra={crmKpiTotals?.conversionRate || 0} 
              />
            </div>
          </div>

          {/* Row 3: Gráfico Origem (50%) + Gráfico Fase (50%) */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DealsByOriginChart data={crmDealsByOrigin} />
            <DealsByStageChart data={crmDealsByStage} />
          </div>

          {/* Row 4: Evolução */}
          <DealsEvolutionChart data={crmEvolutionData} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Consolidated KPI Cards */}
          <ConsolidatedKpiCards data={consolidatedKpis || null} />

          {/* Row 2: Full Funnel Chart */}
          <FullFunnelChart data={consolidatedKpis || null} />

          {/* Row 3: 4 Monthly Charts */}
          <MonthlyCharts 
            data={monthlyConsolidatedKpis?.consolidated || []} 
            channel="all" 
          />

          {/* Row 4: Weekly Evolution + Channel Bar Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <WeeklyEvolutionChart data={weeklyEvolution || []} />
            <ChannelBarChart googleData={googleKpis || []} metaData={metaKpis || []} />
          </div>

          {/* Row 5: KPI Table */}
          <KpiTable 
            data={monthlyConsolidatedKpis?.consolidated || []} 
            channel="all" 
          />

          {/* Row 6: Campaign Attribution Table */}
          <CampaignAttributionTable data={campaignAttribution || []} />

          {/* Row 7: Adset Performance Table */}
          <AdsetPerformanceTable data={adsetPerformance || []} />

          {/* Row 8: Top 5 Ads Table */}
          <TopAdsTable data={topAds || []} />

          {/* Row 9: Campaign Cost Table */}
          <CampaignCostTable 
            googleData={monthlyConsolidatedKpis?.google || []} 
            metaData={monthlyConsolidatedKpis?.meta || []} 
          />
        </div>
      )}

      <AnalystChatbot />
    </div>
  );
}
