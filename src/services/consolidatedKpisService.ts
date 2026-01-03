import { supabase } from "@/integrations/supabase/client";
import { getClientTableName } from './clientTableRegistry';
import { getRdStationLeadsByPeriod, getRdStationLeadsByYear } from './rdStationService';

export interface CrmFunnelMetrics {
  leads: number;
  opportunities: number;
  sales: number;
  revenue: number;
}

export interface ConsolidatedKpis {
  investment: number;
  googleSpend: number;
  metaSpend: number;
  impressions: number;
  reach: number;
  leads: number;
  checkouts: number;
  opportunities: number;
  sales: number;
  revenue: number;
  masterclassSales: number;
  masterclassRevenue: number;
  recompraSales: number;
  recompraRevenue: number;
  cpl: number;
  cav: number;
  roas: number;
  conversionRate: number;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  investment: number;
  impressions: number;
  reach: number;
  leads: number;
  messages: number;
  pageViews: number;
  results: number;
  costPerResult: number;
}

export interface AdsetPerformance {
  adsetId: string;
  adsetName: string;
  campaignName: string;
  investment: number;
  reach: number;
  impressions: number;
  results: number;
  pageViews: number;
  costPerResult: number;
}

export interface AdPerformance {
  adId: string;
  adName: string;
  adsetName: string;
  investment: number;
  reach: number;
  impressions: number;
  results: number;
  pageViews: number;
  costPerResult: number;
}

export interface WeeklyData {
  week: string;
  investment: number;
  leads: number;
  sales: number;
}

export interface MonthlyConsolidatedKpi {
  month: string;
  budget: number;
  cost: number;
  leads: number;
  sales: number;
  revenue: number;
  cal: number | null;
  conversionRate: number | null;
  cav: number | null;
  roas: number | null;
  investmentPercentage: number | null;
}

export async function getCrmFunnelMetrics(
  clientId: string,
  startDate?: string,
  endDate?: string
): Promise<CrmFunnelMetrics> {
  // Fetch stages and deals in parallel
  const [stagesResult, dealsResult] = await Promise.all([
    supabase
      .from('crm_funnel_stages')
      .select('id, name, order, is_won, is_lost')
      .eq('client_id', clientId),
    (() => {
      let query = supabase
        .from('crm_deals')
        .select('id, stage_id, value, status, created_at')
        .eq('client_id', clientId);
      
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate + 'T23:59:59');
      
      return query;
    })()
  ]);

  const stages = stagesResult.data || [];
  const deals = dealsResult.data || [];

  // Debug logs
  console.log('[getCrmFunnelMetrics] clientId:', clientId);
  console.log('[getCrmFunnelMetrics] stages:', stages.length, stages.map(s => `${s.name}(order:${s.order}, won:${s.is_won})`));
  console.log('[getCrmFunnelMetrics] deals:', deals.length);

  // Map stages by type
  const wonStages = stages.filter(s => s.is_won);
  const wonStageIds = wonStages.map(s => s.id);

  // LEADS = Total de deals criados no período (todos que entraram no funil)
  const leads = deals.length;

  // OPORTUNIDADES = Deals que passaram por etapas de order >= 2 OU foram fechados (ganhos ou perdidos)
  // Um deal que virou venda passou obrigatoriamente por "Oportunidade"
  const opportunities = deals.filter(d => {
    const stage = stages.find(s => s.id === d.stage_id);
    if (!stage) return false;
    // Se está em etapa de oportunidade (order >= 2) OU foi fechado (ganho/perdido), conta
    return stage.order >= 2 || stage.is_won || stage.is_lost;
  }).length;

  // VENDAS = Deals que converteram para "Fechado Ganho"
  const wonDeals = deals.filter(d => wonStageIds.includes(d.stage_id));
  
  const result = {
    leads,
    opportunities,
    sales: wonDeals.length,
    revenue: wonDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0),
  };
  
  console.log('[getCrmFunnelMetrics] result:', result);
  
  return result;
}

export async function getConsolidatedKpis(
  clientId: string,
  startDate?: string,
  endDate?: string
): Promise<ConsolidatedKpis> {
  // Get all table names in parallel (uses cache after preload)
  const [metaCampaignsTable, googleAdsTable, productMetricsTable, dashboardSummaryTable] = await Promise.all([
    getClientTableName(clientId, 'meta_ads', 'campaigns'),
    getClientTableName(clientId, 'google_ads', 'campaigns'),
    getClientTableName(clientId, 'eduzz', 'metrics_by_product'),
    getClientTableName(clientId, 'eduzz', 'dashboard_summary'),
  ]);

  // Fetch all data in parallel (including CRM metrics)
  const [metaResult, googleResult, crmMetrics, productResult, summaryResult] = await Promise.all([
    // Meta Ads totals
    metaCampaignsTable 
      ? supabase
          .from(metaCampaignsTable as any)
          .select('spend, impressions, reach')
          .gte('date_start', startDate || '2000-01-01')
          .lte('date_start', endDate || '2099-12-31')
      : Promise.resolve({ data: [], error: null }),
    // Google Ads totals
    googleAdsTable
      ? supabase
          .from(googleAdsTable as any)
          .select('cost, impressions, reach')
          .gte('date', startDate || '2000-01-01')
          .lte('date', endDate || '2099-12-31')
      : Promise.resolve({ data: [], error: null }),
    // CRM funnel metrics (replaces RD Station for funnel data)
    getCrmFunnelMetrics(clientId, startDate, endDate),
    // Product metrics
    productMetricsTable
      ? supabase.from(productMetricsTable as any).select('*')
      : Promise.resolve({ data: [], error: null }),
    // Dashboard summary
    dashboardSummaryTable
      ? supabase.from(dashboardSummaryTable as any).select('*').limit(1).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  // Process Meta Ads data
  const metaTotals = ((metaResult.data || []) as any[]).reduce((acc, row) => ({
    spend: acc.spend + (Number(row.spend) || 0),
    impressions: acc.impressions + (Number(row.impressions) || 0),
    reach: acc.reach + (Number(row.reach) || 0),
  }), { spend: 0, impressions: 0, reach: 0 });

  // Process Google Ads data
  const googleTotals = ((googleResult.data || []) as any[]).reduce((acc, row) => ({
    cost: acc.cost + (Number(row.cost) || 0),
    impressions: acc.impressions + (Number(row.impressions) || 0),
    reach: acc.reach + (Number(row.reach) || 0),
  }), { cost: 0, impressions: 0, reach: 0 });
  
  const productData = productResult.data || [];
  const summaryData = summaryResult.data;
  
  const masterclass = (productData || []).find((p: any) => 
    p.product_name?.includes('Masterclass') || p.product_name?.includes('Caminho para o Liso')
  );
  const recompra = (productData || []).find((p: any) => 
    p.product_name?.includes('Método Liso Perfeito') || p.product_name?.includes('3.0')
  );

  const googleSpend = googleTotals.cost;
  const metaSpend = metaTotals.spend;
  const investment = googleSpend + metaSpend;
  // Use CRM metrics for funnel data
  const leads = crmMetrics.leads;
  const opportunities = crmMetrics.opportunities;
  // Checkouts e Sales vêm do Eduzz (tentativas e vendas concretizadas)
  const checkouts = summaryData?.eduzz_tentativas || summaryData?.total_tentativas || 0;
  const sales = summaryData?.eduzz_vendas || summaryData?.total_vendas || crmMetrics.sales;
  // Use Eduzz revenue, fallback to CRM
  const revenue = summaryData?.eduzz_receita_liquida || summaryData?.receita_liquida || crmMetrics.revenue;
  
  return {
    investment,
    googleSpend,
    metaSpend,
    impressions: metaTotals.impressions + googleTotals.impressions,
    reach: metaTotals.reach + googleTotals.reach,
    leads,
    checkouts,
    opportunities,
    sales,
    revenue,
    masterclassSales: masterclass?.total_vendas || 0,
    masterclassRevenue: masterclass?.receita_liquida || 0,
    recompraSales: recompra?.total_vendas || 0,
    recompraRevenue: recompra?.receita_liquida || 0,
    cpl: leads > 0 ? investment / leads : 0,
    cav: sales > 0 ? investment / sales : 0,
    roas: investment > 0 ? revenue / investment : 0,
    conversionRate: leads > 0 ? (sales / leads) * 100 : 0,
  };
}

export async function getCampaignPerformance(
  clientId: string,
  startDate?: string,
  endDate?: string
): Promise<CampaignPerformance[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns');
  if (!tableName) return [];

  let query = supabase
    .from(tableName as any)
    .select('campaign_id, campaign_name, spend, impressions, reach, leads, messages, page_views, results');
  
  if (startDate && endDate) {
    query = query
      .gte('date_start', startDate)
      .lte('date_start', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching campaign performance:', error);
    return [];
  }
  
  const campaignMap = new Map<string, CampaignPerformance>();
  
  ((data || []) as any[]).forEach(row => {
    const existing = campaignMap.get(row.campaign_id);
    if (existing) {
      existing.investment += Number(row.spend) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.reach += Number(row.reach) || 0;
      existing.leads += row.leads || 0;
      existing.messages += row.messages || 0;
      existing.pageViews += row.page_views || 0;
      existing.results += row.results || 0;
    } else {
      campaignMap.set(row.campaign_id, {
        campaignId: row.campaign_id,
        campaignName: row.campaign_name || 'Campanha sem nome',
        investment: Number(row.spend) || 0,
        impressions: Number(row.impressions) || 0,
        reach: Number(row.reach) || 0,
        leads: row.leads || 0,
        messages: row.messages || 0,
        pageViews: row.page_views || 0,
        results: row.results || 0,
        costPerResult: 0,
      });
    }
  });
  
  const campaigns = Array.from(campaignMap.values());
  campaigns.forEach(c => {
    c.costPerResult = c.results > 0 ? c.investment / c.results : 0;
  });
  
  return campaigns.sort((a, b) => b.investment - a.investment);
}

export async function getAdsetPerformance(
  clientId: string,
  startDate?: string,
  endDate?: string
): Promise<AdsetPerformance[]> {
  const adsetsTable = await getClientTableName(clientId, 'meta_ads', 'adsets');
  const campaignsTable = await getClientTableName(clientId, 'meta_ads', 'campaigns');
  
  if (!adsetsTable) return [];

  let query = supabase
    .from(adsetsTable as any)
    .select('adset_id, adset_name, campaign_id, spend, reach, impressions, results, page_views');
  
  if (startDate && endDate) {
    query = query
      .gte('date_start', startDate)
      .lte('date_start', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching adset performance:', error);
    return [];
  }
  
  // Get campaign names
  let campaignNameMap = new Map<string, string>();
  if (campaignsTable) {
    const { data: campaignsData } = await supabase
      .from(campaignsTable as any)
      .select('campaign_id, campaign_name');
    
    ((campaignsData || []) as any[]).forEach(c => {
      campaignNameMap.set(c.campaign_id, c.campaign_name || 'Campanha sem nome');
    });
  }
  
  const adsetMap = new Map<string, AdsetPerformance>();
  
  ((data || []) as any[]).forEach(row => {
    const existing = adsetMap.get(row.adset_id);
    if (existing) {
      existing.investment += Number(row.spend) || 0;
      existing.reach += Number(row.reach) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += row.results || 0;
      existing.pageViews += row.page_views || 0;
    } else {
      adsetMap.set(row.adset_id, {
        adsetId: row.adset_id,
        adsetName: row.adset_name || 'Conjunto sem nome',
        campaignName: campaignNameMap.get(row.campaign_id) || 'Campanha desconhecida',
        investment: Number(row.spend) || 0,
        reach: Number(row.reach) || 0,
        impressions: Number(row.impressions) || 0,
        results: row.results || 0,
        pageViews: row.page_views || 0,
        costPerResult: 0,
      });
    }
  });
  
  const adsets = Array.from(adsetMap.values());
  adsets.forEach(a => {
    a.costPerResult = a.results > 0 ? a.investment / a.results : 0;
  });
  
  return adsets.sort((a, b) => b.investment - a.investment);
}

export async function getTopAds(
  clientId: string,
  startDate?: string,
  endDate?: string,
  limit: number = 5
): Promise<AdPerformance[]> {
  const adsTable = await getClientTableName(clientId, 'meta_ads', 'ads');
  const adsetsTable = await getClientTableName(clientId, 'meta_ads', 'adsets');
  
  if (!adsTable) return [];

  let query = supabase
    .from(adsTable as any)
    .select('ad_id, ad_name, adset_id, spend, reach, impressions, results, page_views');
  
  if (startDate && endDate) {
    query = query
      .gte('date_start', startDate)
      .lte('date_start', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching top ads:', error);
    return [];
  }
  
  // Get adset names
  let adsetNameMap = new Map<string, string>();
  if (adsetsTable) {
    const { data: adsetsData } = await supabase
      .from(adsetsTable as any)
      .select('adset_id, adset_name');
    
    ((adsetsData || []) as any[]).forEach(a => {
      adsetNameMap.set(a.adset_id, a.adset_name || 'Conjunto sem nome');
    });
  }
  
  const adMap = new Map<string, AdPerformance>();
  
  ((data || []) as any[]).forEach(row => {
    const existing = adMap.get(row.ad_id);
    if (existing) {
      existing.investment += Number(row.spend) || 0;
      existing.reach += Number(row.reach) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += row.results || 0;
      existing.pageViews += row.page_views || 0;
    } else {
      adMap.set(row.ad_id, {
        adId: row.ad_id,
        adName: row.ad_name || 'Anúncio sem nome',
        adsetName: adsetNameMap.get(row.adset_id) || 'Conjunto desconhecido',
        investment: Number(row.spend) || 0,
        reach: Number(row.reach) || 0,
        impressions: Number(row.impressions) || 0,
        results: row.results || 0,
        pageViews: row.page_views || 0,
        costPerResult: 0,
      });
    }
  });
  
  const ads = Array.from(adMap.values());
  ads.forEach(a => {
    a.costPerResult = a.results > 0 ? a.investment / a.results : 0;
  });
  
  return ads.sort((a, b) => b.investment - a.investment).slice(0, limit);
}

export async function getMonthlyConsolidatedKpis(
  clientId: string
): Promise<{ google: MonthlyConsolidatedKpi[], meta: MonthlyConsolidatedKpi[], consolidated: MonthlyConsolidatedKpi[] }> {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  // Buscar todos os nomes de tabela em paralelo
  const [metaCampaignsTable, googleMetricsTable, eduzzInvoicesTable] = await Promise.all([
    getClientTableName(clientId, 'meta_ads', 'campaigns'),
    getClientTableName(clientId, 'google_ads', 'ad_metrics'),
    getClientTableName(clientId, 'eduzz', 'invoices'),
  ]);
  
  const currentYear = new Date().getFullYear();
  
  // Buscar TODOS os dados do ano em paralelo (em vez de queries separadas)
  const [metaResult, googleResult, eduzzResult, rdMonthlyData] = await Promise.all([
    // Meta Ads - ano inteiro
    metaCampaignsTable 
      ? supabase
          .from(metaCampaignsTable as any)
          .select('date_start, spend, impressions, reach, leads')
          .gte('date_start', `${currentYear}-01-01`)
          .lte('date_start', `${currentYear}-12-31`)
      : Promise.resolve({ data: [], error: null }),
    // Google Ads - ano inteiro
    googleMetricsTable
      ? supabase
          .from(googleMetricsTable as any)
          .select('date, cost, impressions, leads')
          .gte('date', `${currentYear}-01-01`)
          .lte('date', `${currentYear}-12-31`)
      : Promise.resolve({ data: [], error: null }),
    // Eduzz - ano inteiro
    eduzzInvoicesTable
      ? supabase
          .from(eduzzInvoicesTable as any)
          .select('paid_at, ganho, status')
          .eq('status', 'paid')
          .gte('paid_at', `${currentYear}-01-01`)
          .lte('paid_at', `${currentYear}-12-31`)
      : Promise.resolve({ data: [], error: null }),
    // RD Station leads
    getRdStationLeadsByYear(clientId, currentYear),
  ]);

  const metaData = metaResult.data || [];
  const googleData = googleResult.data || [];
  const eduzzData = eduzzResult.data || [];
  
  
  // Group data by month
  const googleMonthly: Record<number, { cost: number; leads: number }> = {};
  const metaMonthly: Record<number, { cost: number; leads: number }> = {};
  const eduzzMonthly: Record<number, { sales: number; revenue: number }> = {};
  const rdMonthly: Record<number, number> = {};
  
  // Map RD Station leads per month
  rdMonthlyData.forEach(row => {
    const monthIndex = parseInt(row.period.split('-')[1]) - 1; // "2025-11" -> 10
    rdMonthly[monthIndex] = row.totalLeads;
  });
  
  googleData.forEach(row => {
    if (!row.date) return;
    const month = new Date(row.date).getMonth();
    if (!googleMonthly[month]) googleMonthly[month] = { cost: 0, leads: 0 };
    googleMonthly[month].cost += Number(row.cost) || 0;
    googleMonthly[month].leads += row.leads || 0;
  });
  
  metaData.forEach(row => {
    if (!row.date_start) return;
    const month = new Date(row.date_start).getMonth();
    if (!metaMonthly[month]) metaMonthly[month] = { cost: 0, leads: 0 };
    metaMonthly[month].cost += Number(row.spend) || 0;
    metaMonthly[month].leads += row.leads || 0;
  });
  
  (eduzzData || []).forEach(row => {
    if (!row.paid_at) return;
    const month = new Date(row.paid_at).getMonth();
    if (!eduzzMonthly[month]) eduzzMonthly[month] = { sales: 0, revenue: 0 };
    eduzzMonthly[month].sales += 1;
    eduzzMonthly[month].revenue += Number(row.ganho) || 0;
  });
  
  const googleResultArr: MonthlyConsolidatedKpi[] = [];
  const metaResultArr: MonthlyConsolidatedKpi[] = [];
  const consolidatedResultArr: MonthlyConsolidatedKpi[] = [];
  
  for (let i = 0; i < 12; i++) {
    const gData = googleMonthly[i] || { cost: 0, leads: 0 };
    const mData = metaMonthly[i] || { cost: 0, leads: 0 };
    const eData = eduzzMonthly[i] || { sales: 0, revenue: 0 };
    const rdLeads = rdMonthly[i] || 0;
    
    googleResultArr.push({
      month: months[i],
      budget: gData.cost,
      cost: gData.cost,
      leads: gData.leads,
      sales: 0,
      revenue: 0,
      cal: gData.leads > 0 ? gData.cost / gData.leads : null,
      conversionRate: null,
      cav: null,
      roas: null,
      investmentPercentage: null,
    });
    
    metaResultArr.push({
      month: months[i],
      budget: mData.cost,
      cost: mData.cost,
      leads: mData.leads,
      sales: 0,
      revenue: 0,
      cal: mData.leads > 0 ? mData.cost / mData.leads : null,
      conversionRate: null,
      cav: null,
      roas: null,
      investmentPercentage: null,
    });
    
    const totalCost = gData.cost + mData.cost;
    const totalLeads = rdLeads || (gData.leads + mData.leads);
    const { sales, revenue } = eData;
    
    consolidatedResultArr.push({
      month: months[i],
      budget: totalCost,
      cost: totalCost,
      leads: totalLeads,
      sales,
      revenue,
      cal: totalLeads > 0 ? totalCost / totalLeads : null,
      conversionRate: totalLeads > 0 ? (sales / totalLeads) * 100 : null,
      cav: sales > 0 ? totalCost / sales : null,
      roas: totalCost > 0 ? revenue / totalCost : null,
      investmentPercentage: revenue > 0 ? (totalCost / revenue) * 100 : null,
    });
  }
  
  return { google: googleResultArr, meta: metaResultArr, consolidated: consolidatedResultArr };
}

export async function getWeeklyEvolution(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<WeeklyData[]> {
  const metaCampaignsTable = await getClientTableName(clientId, 'meta_ads', 'campaigns');
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const firstWeekStart = new Date(start);
  firstWeekStart.setDate(start.getDate() - start.getDay());
  
  const weeklyMap = new Map<string, { investment: number; leads: number; sales: number }>();
  const currentWeek = new Date(firstWeekStart);
  
  while (currentWeek <= end) {
    const weekKey = currentWeek.toISOString().split('T')[0];
    weeklyMap.set(weekKey, { investment: 0, leads: 0, sales: 0 });
    currentWeek.setDate(currentWeek.getDate() + 7);
  }
  
  // Fetch Meta Ads data
  if (metaCampaignsTable) {
    const { data: metaData } = await supabase
      .from(metaCampaignsTable as any)
      .select('date_start, spend')
      .gte('date_start', startDate)
      .lte('date_start', endDate);
    
    ((metaData || []) as any[]).forEach(row => {
      if (!row.date_start) return;
      const date = new Date(row.date_start);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeklyMap.get(weekKey);
      if (existing) {
        existing.investment += Number(row.spend) || 0;
      }
    });
  }
  
  // Fetch Eduzz sales (dynamically by client)
  const eduzzInvoicesTableWeekly = await getClientTableName(clientId, 'eduzz', 'invoices');
  
  if (eduzzInvoicesTableWeekly) {
    const { data: eduzzData } = await supabase
      .from(eduzzInvoicesTableWeekly as any)
      .select('paid_at')
      .eq('status', 'paid')
      .gte('paid_at', startDate)
      .lte('paid_at', endDate);
    
    ((eduzzData || []) as any[]).forEach(row => {
      if (!row.paid_at) return;
      const date = new Date(row.paid_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeklyMap.get(weekKey);
      if (existing) {
        existing.sales += 1;
      }
    });
  }
  
  // Distribute leads proportionally based on investment
  // Fetch RD Station leads for the period
  const rdData = await getRdStationLeadsByPeriod(clientId, new Date(startDate), new Date(endDate));
  const totalLeads = rdData?.totalLeads || 0;
  const totalInvestment = Array.from(weeklyMap.values()).reduce((sum, w) => sum + w.investment, 0);
  
  if (totalInvestment > 0 && totalLeads > 0) {
    weeklyMap.forEach((value) => {
      value.leads = Math.round((value.investment / totalInvestment) * totalLeads);
    });
  }
  
  return Array.from(weeklyMap.entries())
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week));
}
