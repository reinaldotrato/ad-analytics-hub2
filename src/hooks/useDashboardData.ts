import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { calculateKpis, getMonthlyKpis, getCampaignPerformance, getKeywordPerformance } from '@/services/metricsService';
import { getAggregatedKpis } from '@/services/aggregatedKpisService';
import { getRdStationLeadsByPeriod, getRdStationDailyEvolution, type RdStationLeadsData, type RdStationDailyEvolution } from '@/services/rdStationService';
import {
  getMetaCampaigns,
  getMetaTopAds,
  getMetaPlatformPerformance,
  getMetaDemographicPerformance,
  getMetaKpiTotals,
  getMetaPlatformBreakdown,
  getMetaAgeBreakdown,
  getMetaRegionBreakdown,
  getMetaGenderBreakdown,
  getMetaPositionBreakdown,
  getMetaDailyEvolution,
} from '@/services/metaAdsService';
import {
  getCrmKpiTotals,
  getSalesFunnelData,
  getLostReasons,
  getDealsEvolution,
  getDealsByStage,
  getDealsByOrigin,
  getRecompraEvolution,
} from '@/services/crmDealsService';
import {
  getConsolidatedKpis,
  getCampaignPerformance as getConsolidatedCampaigns,
  getAdsetPerformance,
  getTopAds,
  getWeeklyEvolution,
  getMonthlyConsolidatedKpis,
} from '@/services/consolidatedKpisService';
import { formatDateForQuery, getPreviousPeriodDates } from '@/lib/dateUtils';

type Channel = 'all' | 'google_ads' | 'meta_ads' | 'crm';

// Cache configuration - dados de marketing não mudam frequentemente
const CACHE_CONFIG = {
  // Dados que mudam pouco (agregações, histórico)
  long: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos
  },
  // Dados que podem mudar mais (KPIs atuais)
  medium: {
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 15 * 60 * 1000,    // 15 minutos
  },
  // Verificações de disponibilidade
  short: {
    staleTime: 2 * 60 * 1000,  // 2 minutos
    gcTime: 5 * 60 * 1000,     // 5 minutos
  },
};

export function useDashboardData(
  startDate: Date,
  endDate: Date,
  channel: Channel = 'all'
) {
  const { clientId, selectedClientId, role } = useAuth();
  
  // Admins usam o selectedClientId, usuários comuns usam seu próprio clientId
  const effectiveClientId = role === 'admin' ? selectedClientId : clientId;

  const startDateStr = formatDateForQuery(startDate);
  const endDateStr = formatDateForQuery(endDate);
  
  const { prevStartDate, prevEndDate } = getPreviousPeriodDates(startDate, endDate);
  const prevStartDateStr = formatDateForQuery(prevStartDate);
  const prevEndDateStr = formatDateForQuery(prevEndDate);

  const currentYear = new Date().getFullYear();

  // Helper para verificar se a aba está ativa
  const isTabActive = (tab: Channel) => channel === tab;
  const isAllTab = isTabActive('all');
  const isGoogleTab = isTabActive('google_ads');
  const isMetaTab = isTabActive('meta_ads');
  const isCrmTab = isTabActive('crm');

  // ========================================
  // QUERIES COMPARTILHADAS (carregam sempre)
  // ========================================
  
  const { data: currentMonthKpis, isLoading: loadingCurrent } = useQuery({
    queryKey: ['kpis', 'current', effectiveClientId, channel, startDateStr, endDateStr],
    queryFn: () => calculateKpis(effectiveClientId!, startDateStr, endDateStr, channel),
    enabled: !!effectiveClientId,
    ...CACHE_CONFIG.medium,
  });

  const { data: previousMonthKpis, isLoading: loadingPrevious } = useQuery({
    queryKey: ['kpis', 'previous', effectiveClientId, channel, prevStartDateStr, prevEndDateStr],
    queryFn: () => calculateKpis(effectiveClientId!, prevStartDateStr, prevEndDateStr, channel),
    enabled: !!effectiveClientId,
    ...CACHE_CONFIG.long,
  });

  // ========================================
  // ABA "TOTAL" - Lazy load
  // ========================================
  
  const { data: monthlyKpis, isLoading: loadingMonthly } = useQuery({
    queryKey: ['kpis', 'monthly', effectiveClientId, currentYear, channel],
    queryFn: () => getMonthlyKpis(effectiveClientId!, currentYear, channel),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: googleKpis } = useQuery({
    queryKey: ['kpis', 'google', effectiveClientId, currentYear],
    queryFn: () => getMonthlyKpis(effectiveClientId!, currentYear, 'google_ads'),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaKpis } = useQuery({
    queryKey: ['kpis', 'meta', effectiveClientId, currentYear],
    queryFn: () => getMonthlyKpis(effectiveClientId!, currentYear, 'meta_ads'),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: aggregatedKpis, isLoading: loadingAggregated } = useQuery({
    queryKey: ['aggregated-kpis-total', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getAggregatedKpis(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.medium,
  });

  const { data: aggregatedKpisPrevious } = useQuery({
    queryKey: ['aggregated-kpis-total-prev', effectiveClientId, prevStartDateStr, prevEndDateStr],
    queryFn: () => getAggregatedKpis(effectiveClientId!, prevStartDateStr, prevEndDateStr),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: rdStationLeads, isLoading: loadingRdStation } = useQuery({
    queryKey: ['rd-station-leads', effectiveClientId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => getRdStationLeadsByPeriod(effectiveClientId!, startDate, endDate),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.medium,
  });

  const { data: rdStationLeadsPrevious } = useQuery({
    queryKey: ['rd-station-leads-prev', effectiveClientId, prevStartDate.toISOString(), prevEndDate.toISOString()],
    queryFn: () => getRdStationLeadsByPeriod(effectiveClientId!, prevStartDate, prevEndDate),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: rdStationDailyEvolution, isLoading: loadingRdStationDaily } = useQuery({
    queryKey: ['rd-station-daily', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getRdStationDailyEvolution(effectiveClientId!, startDate, endDate),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.medium,
  });

  const { data: consolidatedKpis, isLoading: loadingConsolidated } = useQuery({
    queryKey: ['consolidated-kpis', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getConsolidatedKpis(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.medium,
  });

  const { data: campaignAttribution, isLoading: loadingCampaignAttribution } = useQuery({
    queryKey: ['campaign-attribution', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getConsolidatedCampaigns(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: adsetPerformance, isLoading: loadingAdsetPerformance } = useQuery({
    queryKey: ['adset-performance', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getAdsetPerformance(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: topAds, isLoading: loadingTopAds } = useQuery({
    queryKey: ['top-ads', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getTopAds(effectiveClientId!, startDateStr, endDateStr, 5),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: weeklyEvolution, isLoading: loadingWeeklyEvolution } = useQuery({
    queryKey: ['weekly-evolution', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getWeeklyEvolution(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  const { data: monthlyConsolidatedKpis, isLoading: loadingMonthlyConsolidated } = useQuery({
    queryKey: ['monthly-consolidated-kpis', effectiveClientId],
    queryFn: () => getMonthlyConsolidatedKpis(effectiveClientId!),
    enabled: !!effectiveClientId && isAllTab,
    ...CACHE_CONFIG.long,
  });

  // ========================================
  // ABA "GOOGLE ADS" - Lazy load
  // ========================================
  
  const { data: campaignData, isLoading: loadingCampaigns } = useQuery({
    queryKey: ['campaigns', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getCampaignPerformance(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isGoogleTab,
    ...CACHE_CONFIG.medium,
  });

  const { data: keywordData, isLoading: loadingKeywords } = useQuery({
    queryKey: ['keywords', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getKeywordPerformance(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isGoogleTab,
    ...CACHE_CONFIG.long,
  });

  // ========================================
  // ABA "META ADS" - Lazy load
  // ========================================
  
  const { data: metaCampaigns, isLoading: loadingMetaCampaigns } = useQuery({
    queryKey: ['meta-campaigns', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaCampaigns(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.medium,
  });

  const { data: metaTopAds, isLoading: loadingMetaTopAds } = useQuery({
    queryKey: ['meta-top-ads', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaTopAds(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaPlatformData, isLoading: loadingMetaPlatform } = useQuery({
    queryKey: ['meta-platform-performance', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaPlatformPerformance(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaDemographicData, isLoading: loadingMetaDemographic } = useQuery({
    queryKey: ['meta-demographic-performance', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaDemographicPerformance(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaKpiTotals, isLoading: loadingMetaKpiTotals } = useQuery({
    queryKey: ['meta-kpi-totals', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaKpiTotals(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.medium,
  });

  const { data: metaKpiTotalsPrevious } = useQuery({
    queryKey: ['meta-kpi-totals-previous', effectiveClientId, prevStartDateStr, prevEndDateStr],
    queryFn: () => getMetaKpiTotals(effectiveClientId!, prevStartDateStr, prevEndDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaPlatformBreakdown, isLoading: loadingMetaPlatformBreakdown } = useQuery({
    queryKey: ['meta-platform-breakdown', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaPlatformBreakdown(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaAgeBreakdown, isLoading: loadingMetaAgeBreakdown } = useQuery({
    queryKey: ['meta-age-breakdown', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaAgeBreakdown(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaRegionBreakdown, isLoading: loadingMetaRegionBreakdown } = useQuery({
    queryKey: ['meta-region-breakdown', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaRegionBreakdown(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaGenderBreakdown, isLoading: loadingMetaGenderBreakdown } = useQuery({
    queryKey: ['meta-gender-breakdown', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaGenderBreakdown(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaPositionBreakdown, isLoading: loadingMetaPositionBreakdown } = useQuery({
    queryKey: ['meta-position-breakdown', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaPositionBreakdown(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  const { data: metaDailyEvolution, isLoading: loadingMetaDailyEvolution } = useQuery({
    queryKey: ['meta-daily-evolution', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getMetaDailyEvolution(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isMetaTab,
    ...CACHE_CONFIG.long,
  });

  // ========================================
  // ABA "CRM / VENDAS" - Lazy load
  // ========================================
  
  const { data: crmKpiTotals, isLoading: loadingCrmKpi } = useQuery({
    queryKey: ['crm-kpi-totals', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getCrmKpiTotals(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isCrmTab,
    ...CACHE_CONFIG.medium,
  });

  const { data: crmFunnelData, isLoading: loadingCrmFunnel } = useQuery({
    queryKey: ['crm-funnel', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getSalesFunnelData(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isCrmTab,
    ...CACHE_CONFIG.long,
  });

  const { data: crmLostReasons, isLoading: loadingCrmLostReasons } = useQuery({
    queryKey: ['crm-lost-reasons', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getLostReasons(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isCrmTab,
    ...CACHE_CONFIG.long,
  });

  const { data: crmEvolutionData, isLoading: loadingCrmEvolution } = useQuery({
    queryKey: ['crm-evolution', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getDealsEvolution(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isCrmTab,
    ...CACHE_CONFIG.long,
  });

  const { data: crmDealsByStage, isLoading: loadingCrmStage } = useQuery({
    queryKey: ['crm-deals-by-stage', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getDealsByStage(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isCrmTab,
    ...CACHE_CONFIG.long,
  });

  const { data: crmDealsByOrigin, isLoading: loadingCrmOrigin } = useQuery({
    queryKey: ['crm-deals-by-origin', effectiveClientId, startDateStr, endDateStr],
    queryFn: () => getDealsByOrigin(effectiveClientId!, startDateStr, endDateStr),
    enabled: !!effectiveClientId && isCrmTab,
    ...CACHE_CONFIG.long,
  });

  const { data: crmRecompraEvolution, isLoading: loadingCrmRecompra } = useQuery({
    queryKey: ['crm-recompra-evolution', effectiveClientId],
    queryFn: () => getRecompraEvolution(effectiveClientId!),
    enabled: !!effectiveClientId && isCrmTab,
    ...CACHE_CONFIG.long,
  });

  // ========================================
  // VERIFICAÇÃO DE DISPONIBILIDADE DE DADOS
  // ========================================
  
  const { data: hasGoogleData } = useQuery({
    queryKey: ['check-google-data', effectiveClientId, startDateStr, endDateStr],
    queryFn: async () => {
      const { getClientTableName } = await import('@/services/clientTableRegistry');
      const tableName = await getClientTableName(effectiveClientId!, 'google_ads', 'ad_metrics');
      if (!tableName) return false;
      
      const { count } = await import('@/integrations/supabase/client').then(m => 
        m.supabase
          .from(tableName as any)
          .select('id', { count: 'exact', head: true })
          .gte('date', startDateStr)
          .lte('date', endDateStr)
      );
      return (count ?? 0) > 0;
    },
    enabled: !!effectiveClientId,
    ...CACHE_CONFIG.short,
  });

  const { data: hasMetaData } = useQuery({
    queryKey: ['check-meta-data', effectiveClientId, startDateStr, endDateStr],
    queryFn: async () => {
      const { getClientTableName } = await import('@/services/clientTableRegistry');
      const tableName = await getClientTableName(effectiveClientId!, 'meta_ads', 'campaigns');
      if (!tableName) return false;
      
      const { count } = await import('@/integrations/supabase/client').then(m => 
        m.supabase
          .from(tableName as any)
          .select('id', { count: 'exact', head: true })
          .gte('date_start', startDateStr)
          .lte('date_start', endDateStr)
      );
      return (count ?? 0) > 0;
    },
    enabled: !!effectiveClientId,
    ...CACHE_CONFIG.short,
  });

  const { data: hasCrmData } = useQuery({
    queryKey: ['check-crm-data', effectiveClientId, startDateStr, endDateStr],
    queryFn: async () => {
      const { getClientTableName } = await import('@/services/clientTableRegistry');
      const tableName = await getClientTableName(effectiveClientId!, 'eduzz', 'invoices');
      if (!tableName) return false;
      
      const { count } = await import('@/integrations/supabase/client').then(m => 
        m.supabase
          .from(tableName as any)
          .select('id', { count: 'exact', head: true })
          .gte('paid_at', startDateStr)
          .lte('paid_at', endDateStr)
      );
      return (count ?? 0) > 0;
    },
    enabled: !!effectiveClientId,
    ...CACHE_CONFIG.short,
  });

  const channelStatus = {
    all: (hasGoogleData || hasMetaData || hasCrmData) ?? false,
    google_ads: hasGoogleData ?? false,
    meta_ads: hasMetaData ?? false,
    crm: hasCrmData ?? false,
  };

  // ========================================
  // LOADING STATE POR ABA (mais eficiente)
  // ========================================
  
  const isAllLoading = isAllTab && (
    loadingMonthly ||
    loadingAggregated ||
    loadingRdStation ||
    loadingRdStationDaily ||
    loadingConsolidated ||
    loadingCampaignAttribution ||
    loadingAdsetPerformance ||
    loadingTopAds ||
    loadingWeeklyEvolution ||
    loadingMonthlyConsolidated
  );

  const isGoogleLoading = isGoogleTab && (
    loadingCampaigns ||
    loadingKeywords
  );

  const isMetaLoading = isMetaTab && (
    loadingMetaCampaigns ||
    loadingMetaTopAds ||
    loadingMetaPlatform ||
    loadingMetaDemographic ||
    loadingMetaKpiTotals ||
    loadingMetaPlatformBreakdown ||
    loadingMetaAgeBreakdown ||
    loadingMetaRegionBreakdown ||
    loadingMetaGenderBreakdown ||
    loadingMetaPositionBreakdown ||
    loadingMetaDailyEvolution
  );

  const isCrmLoading = isCrmTab && (
    loadingCrmKpi ||
    loadingCrmFunnel ||
    loadingCrmLostReasons ||
    loadingCrmEvolution ||
    loadingCrmStage ||
    loadingCrmOrigin ||
    loadingCrmRecompra
  );

  return {
    currentMonthKpis,
    previousMonthKpis,
    monthlyKpis,
    googleKpis,
    metaKpis,
    campaignData,
    keywordData,
    // Aggregated KPIs (Google + Meta + CRM)
    aggregatedKpis,
    aggregatedKpisPrevious,
    // RD Station Leads
    rdStationLeads,
    rdStationLeadsPrevious,
    rdStationDailyEvolution,
    // Consolidated KPIs (Meta + RD + Eduzz)
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
    // Channel status
    channelStatus,
    // Loading state otimizado por aba
    isLoading: loadingCurrent || loadingPrevious || isAllLoading || isGoogleLoading || isMetaLoading || isCrmLoading,
  };
}
