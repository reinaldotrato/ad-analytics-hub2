import { supabase } from '@/integrations/supabase/client';
import { getClientTableName } from './clientTableRegistry';

export interface KpiMetrics {
  budget: number;
  cost: number;
  leads: number;
  cal: number | null;
  sales: number;
  conversionRate: number | null;
  revenue: number;
  cav: number | null;
  roas: number | null;
  investmentPercentage: number | null;
  impressions?: number;
  clicks?: number;
  reach?: number;
  results?: number;
  ctr?: number | null;
  cpc?: number | null;
  cpm?: number | null;
  cpr?: number | null;
  opportunities?: number;
  avgTicket?: number | null;
  conversions?: number;
  costPerConversion?: number | null;
}

export interface MonthlyKpi extends KpiMetrics {
  month: string;
}

export interface CampaignMetrics {
  campaignName: string;
  status: string;
  cost: number;
  cpc: number | null;
  impressions: number;
  clicks: number;
  ctr: number | null;
  conversions: number;
  conversionRate: number | null;
  costPerConversion: number | null;
}

export interface KeywordMetrics {
  keyword: string;
  campaignName: string;
  matchType: string;
  status: string;
  impressions: number;
  ctr: number | null;
  cpc: number | null;
  qualityScore: number | null;
  conversions: number;
  conversionRate: number | null;
  costPerConversion: number | null;
}

export async function calculateKpis(
  clientId: string,
  startDate: string,
  endDate: string,
  source?: 'meta_ads' | 'google_ads' | 'crm' | 'all'
): Promise<KpiMetrics> {
  // Para canal CRM
  if (source === 'crm') {
    const crmTable = await getClientTableName(clientId, 'moskit', 'deals');
    if (!crmTable) {
      return createEmptyKpis();
    }

    const { data: deals } = await supabase
      .from(crmTable as any)
      .select('status, price, pipeline_name')
      .gte('date_created', startDate)
      .lte('date_created', endDate);

    const vendasDeals = (deals || []).filter((d: any) => d.pipeline_name !== 'Recompra/Expansão');
    const leads = vendasDeals.length;
    const opportunities = vendasDeals.filter((d: any) => 
      d.status === 'WON' || d.status === 'LOST'
    ).length;
    const sales = (deals || []).filter((d: any) => d.status === 'WON').length;
    const revenue = (deals || [])
      .filter((d: any) => d.status === 'WON')
      .reduce((sum: number, d: any) => sum + (Number(d.price) || 0), 0);
    
    const conversionRate = leads > 0 ? (sales / leads) * 100 : null;
    const avgTicket = sales > 0 ? revenue / sales : null;

    return {
      budget: 0,
      cost: 0,
      leads,
      cal: null,
      sales,
      conversionRate,
      revenue,
      cav: null,
      roas: null,
      investmentPercentage: null,
      opportunities,
      avgTicket,
    };
  }

  // Para Google Ads
  if (source === 'google_ads') {
    const googleTable = await getClientTableName(clientId, 'google_ads', 'ad_metrics');
    if (!googleTable) {
      return createEmptyKpis();
    }

    const { data: googleMetrics } = await supabase
      .from(googleTable as any)
      .select('cost, leads, impressions, clicks, reach, conversions')
      .gte('date', startDate)
      .lte('date', endDate);

    const metrics = (googleMetrics as any[]) || [];
    const cost = metrics.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
    const leads = metrics.reduce((sum, m) => sum + (m.leads || 0), 0);
    const impressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
    const clicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
    const reach = metrics.reduce((sum, m) => sum + (m.reach || 0), 0);
    const conversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : null;
    const cpc = clicks > 0 ? cost / clicks : null;
    const costPerConversion = conversions > 0 ? cost / conversions : null;

    return {
      budget: cost,
      cost,
      leads,
      cal: leads > 0 ? cost / leads : null,
      sales: 0,
      conversionRate: null,
      revenue: 0,
      cav: null,
      roas: null,
      investmentPercentage: null,
      impressions,
      clicks,
      reach,
      ctr,
      cpc,
      conversions,
      costPerConversion,
    };
  }

  // Para Meta Ads
  if (source === 'meta_ads') {
    const metaTable = await getClientTableName(clientId, 'meta_ads', 'ads');
    if (!metaTable) {
      return createEmptyKpis();
    }

    const { data: metaMetrics } = await supabase
      .from(metaTable as any)
      .select('spend, leads, reach, impressions, results, messages, page_views')
      .gte('date_start', startDate)
      .lte('date_start', endDate);

    const metrics = (metaMetrics as any[]) || [];
    const cost = metrics.reduce((sum, m) => sum + (Number(m.spend) || 0), 0);
    const leads = metrics.reduce((sum, m) => sum + (m.leads || 0), 0);
    const reach = Math.max(...metrics.map(m => Number(m.reach) || 0), 0);
    const impressions = metrics.reduce((sum, m) => sum + (Number(m.impressions) || 0), 0);
    const results = metrics.reduce((sum, m) => sum + (m.results || 0), 0);

    const cpr = results > 0 ? cost / results : null;

    return {
      budget: cost,
      cost,
      leads,
      cal: leads > 0 ? cost / leads : null,
      sales: 0,
      conversionRate: null,
      revenue: 0,
      cav: null,
      roas: null,
      investmentPercentage: null,
      impressions,
      reach,
      results,
      cpr,
    };
  }

  // Para 'all' - agregar Google Ads + Meta Ads + CRM Deals
  const googleTable = await getClientTableName(clientId, 'google_ads', 'ad_metrics');
  const metaTable = await getClientTableName(clientId, 'meta_ads', 'ads');
  const crmTable = await getClientTableName(clientId, 'moskit', 'deals');

  // Google Ads
  let googleCost = 0, googleLeads = 0, googleImpressions = 0, googleClicks = 0, googleReach = 0;
  if (googleTable) {
    const { data: googleMetrics } = await supabase
      .from(googleTable as any)
      .select('cost, leads, impressions, clicks, reach, conversions')
      .gte('date', startDate)
      .lte('date', endDate);

    const googleData = (googleMetrics as any[]) || [];
    googleCost = googleData.reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
    googleLeads = googleData.reduce((sum, m) => sum + (m.leads || 0), 0);
    googleImpressions = googleData.reduce((sum, m) => sum + (m.impressions || 0), 0);
    googleClicks = googleData.reduce((sum, m) => sum + (m.clicks || 0), 0);
    googleReach = googleData.reduce((sum, m) => sum + (m.reach || 0), 0);
  }

  // Meta Ads
  let metaCost = 0, metaLeads = 0, metaReach = 0, metaImpressions = 0, metaResults = 0;
  if (metaTable) {
    const { data: metaMetrics } = await supabase
      .from(metaTable as any)
      .select('spend, leads, reach, impressions, results')
      .gte('date_start', startDate)
      .lte('date_start', endDate);

    const metaData = (metaMetrics as any[]) || [];
    metaCost = metaData.reduce((sum, m) => sum + (Number(m.spend) || 0), 0);
    metaLeads = metaData.reduce((sum, m) => sum + (m.leads || 0), 0);
    metaReach = Math.max(...metaData.map(m => Number(m.reach) || 0), 0);
    metaImpressions = metaData.reduce((sum, m) => sum + (Number(m.impressions) || 0), 0);
    metaResults = metaData.reduce((sum, m) => sum + (m.results || 0), 0);
  }

  // CRM Deals
  let sales = 0, revenue = 0;
  if (crmTable) {
    const { data: crmDeals } = await supabase
      .from(crmTable as any)
      .select('status, price')
      .eq('status', 'WON')
      .gte('date_created', startDate)
      .lte('date_created', endDate);

    const wonDeals = (crmDeals as any[]) || [];
    sales = wonDeals.length;
    revenue = wonDeals.reduce((sum, d) => sum + (Number(d.price) || 0), 0);
  }

  const cost = googleCost + metaCost;
  const leads = googleLeads + metaLeads;
  const impressions = googleImpressions + metaImpressions;
  const clicks = googleClicks;
  const reach = googleReach + metaReach;
  const results = metaResults;

  const cal = leads > 0 ? cost / leads : null;
  const conversionRate = leads > 0 ? (sales / leads) * 100 : null;
  const cav = sales > 0 ? cost / sales : null;
  const roas = cost > 0 ? revenue / cost : null;
  const investmentPercentage = revenue > 0 ? (cost / revenue) * 100 : null;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : null;
  const cpc = clicks > 0 ? cost / clicks : null;
  const cpm = impressions > 0 ? (cost / impressions) * 1000 : null;
  const cpr = results > 0 ? cost / results : null;
  const avgTicket = sales > 0 ? revenue / sales : null;

  return {
    budget: cost,
    cost,
    leads,
    cal,
    sales,
    conversionRate,
    revenue,
    cav,
    roas,
    investmentPercentage,
    impressions,
    clicks,
    reach,
    results,
    ctr,
    cpc,
    cpm,
    cpr,
    avgTicket,
  };
}

function createEmptyKpis(): KpiMetrics {
  return {
    budget: 0,
    cost: 0,
    leads: 0,
    cal: null,
    sales: 0,
    conversionRate: null,
    revenue: 0,
    cav: null,
    roas: null,
    investmentPercentage: null,
  };
}

export async function getMonthlyKpis(
  clientId: string,
  year: number,
  source?: 'meta_ads' | 'google_ads' | 'crm' | 'all'
): Promise<MonthlyKpi[]> {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Executar todas as queries em paralelo em vez de sequencialmente
  const promises = months.map((_, i) => {
    const startDate = `${year}-${String(i + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, i + 1, 0).toISOString().split('T')[0];
    return calculateKpis(clientId, startDate, endDate, source);
  });

  const results = await Promise.all(promises);

  return results.map((kpis, i) => ({
    month: months[i],
    ...kpis,
  }));
}

export function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercentage(value: number | null): string {
  if (value === null) return '-';
  return `${value.toFixed(2)}%`;
}

export function formatNumber(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('pt-BR').format(value);
}

const statusMap: Record<string, string> = {
  'ENABLED': 'Ativo',
  'PAUSED': 'Pausado',
  'REMOVED': 'Removido',
  'UNKNOWN': 'Desconhecido',
};

export async function getCampaignPerformance(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<CampaignMetrics[]> {
  const googleTable = await getClientTableName(clientId, 'google_ads', 'ad_metrics');
  if (!googleTable) return [];

  const { data: adMetrics } = await supabase
    .from(googleTable as any)
    .select('campaign_name, cost, clicks, impressions, conversions, status')
    .gte('date', startDate)
    .lte('date', endDate);

  if (!adMetrics || (adMetrics as any[]).length === 0) return [];

  const campaignMap = new Map<string, {
    cost: number;
    clicks: number;
    impressions: number;
    conversions: number;
    status: string;
  }>();

  (adMetrics as any[]).forEach(metric => {
    const campaign = metric.campaign_name || 'Sem nome';
    const existing = campaignMap.get(campaign) || {
      cost: 0,
      clicks: 0,
      impressions: 0,
      conversions: 0,
      status: metric.status || 'ENABLED'
    };

    campaignMap.set(campaign, {
      cost: existing.cost + (Number(metric.cost) || 0),
      clicks: existing.clicks + (metric.clicks || 0),
      impressions: existing.impressions + (metric.impressions || 0),
      conversions: existing.conversions + (metric.conversions || 0),
      status: metric.status || existing.status
    });
  });

  return Array.from(campaignMap.entries()).map(([campaignName, data]) => {
    const cpc = data.clicks > 0 ? data.cost / data.clicks : null;
    const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : null;
    const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : null;
    const costPerConversion = data.conversions > 0 ? data.cost / data.conversions : null;

    return {
      campaignName,
      status: statusMap[data.status] || data.status,
      cost: data.cost,
      cpc,
      impressions: data.impressions,
      clicks: data.clicks,
      ctr,
      conversions: data.conversions,
      conversionRate,
      costPerConversion
    };
  });
}

export async function getKeywordPerformance(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<KeywordMetrics[]> {
  const keywordsTable = await getClientTableName(clientId, 'google_ads', 'keywords');
  if (!keywordsTable) return [];

  const { data: keywords } = await supabase
    .from(keywordsTable as any)
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (!keywords || (keywords as any[]).length === 0) return [];

  const keywordMap = new Map<string, {
    campaignName: string;
    matchType: string;
    status: string;
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    qualityScores: number[];
  }>();

  (keywords as any[]).forEach(kw => {
    const key = kw.keyword;
    const existing = keywordMap.get(key) || {
      campaignName: kw.campaign_name || 'Sem campanha',
      matchType: kw.match_type || 'broad',
      status: kw.status || 'active',
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      qualityScores: []
    };

    keywordMap.set(key, {
      ...existing,
      impressions: existing.impressions + (kw.impressions || 0),
      clicks: existing.clicks + (kw.clicks || 0),
      cost: existing.cost + (Number(kw.cost) || 0),
      conversions: existing.conversions + (kw.conversions || 0),
      qualityScores: kw.quality_score ? [...existing.qualityScores, kw.quality_score] : existing.qualityScores
    });
  });

  const results = Array.from(keywordMap.entries()).map(([keyword, data]) => {
    const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : null;
    const cpc = data.clicks > 0 ? data.cost / data.clicks : null;
    const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : null;
    const costPerConversion = data.conversions > 0 ? data.cost / data.conversions : null;
    const qualityScore = data.qualityScores.length > 0 
      ? Math.round(data.qualityScores.reduce((a, b) => a + b, 0) / data.qualityScores.length)
      : null;

    return {
      keyword,
      campaignName: data.campaignName,
      matchType: data.matchType,
      status: data.status,
      impressions: data.impressions,
      ctr,
      cpc,
      qualityScore,
      conversions: data.conversions,
      conversionRate,
      costPerConversion
    };
  });

  return results
    .sort((a, b) => {
      if (b.conversions !== a.conversions) return b.conversions - a.conversions;
      return b.impressions - a.impressions;
    })
    .slice(0, 10);
}
