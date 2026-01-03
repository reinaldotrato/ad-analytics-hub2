import { supabase } from '@/integrations/supabase/client';
import { getClientTableName } from './clientTableRegistry';

export interface AggregatedKpis {
  // Investimento
  totalCost: number;
  googleCost: number;
  metaCost: number;
  
  // Leads
  totalLeads: number;
  googleLeads: number;
  metaLeads: number;
  
  // Alcance
  totalReach: number;
  googleReach: number;
  metaReach: number;
  
  // CRM
  sales: number;
  revenue: number;
  openDeals: number;
  lostDeals: number;
  
  // Métricas calculadas
  cal: number | null;        // Custo por Lead
  cav: number | null;        // Custo por Venda
  roas: number | null;       // Return on Ad Spend
  conversionRate: number | null;  // % Conversão
  avgTicket: number | null;  // Ticket Médio
}

interface GoogleAdsData {
  cost: number;
  leads: number;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface MetaAdsData {
  cost: number;
  leads: number;
  reach: number;
  impressions: number;
  results: number;
  messages: number;
  pageViews: number;
}

interface CrmDealsData {
  wonDeals: number;
  wonRevenue: number;
  openDeals: number;
  lostDeals: number;
  totalDeals: number;
}

// Buscar dados do Google Ads usando client_table_registry
async function getGoogleAdsData(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<GoogleAdsData> {
  const tableName = await getClientTableName(clientId, 'google_ads', 'ad_metrics');
  
  if (!tableName) {
    return { cost: 0, leads: 0, reach: 0, impressions: 0, clicks: 0, conversions: 0 };
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select('cost, leads, reach, impressions, clicks, conversions')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error || !data) {
    console.error('Error fetching Google Ads data:', error);
    return { cost: 0, leads: 0, reach: 0, impressions: 0, clicks: 0, conversions: 0 };
  }

  const metrics = data as any[];
  return {
    cost: metrics.reduce((sum, m) => sum + (Number(m.cost) || 0), 0),
    leads: metrics.reduce((sum, m) => sum + (Number(m.leads) || 0), 0),
    reach: Math.max(...metrics.map(m => Number(m.reach) || 0), 0),
    impressions: metrics.reduce((sum, m) => sum + (Number(m.impressions) || 0), 0),
    clicks: metrics.reduce((sum, m) => sum + (Number(m.clicks) || 0), 0),
    conversions: metrics.reduce((sum, m) => sum + (Number(m.conversions) || 0), 0),
  };
}

// Buscar dados do Meta Ads usando client_table_registry
async function getMetaAdsData(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaAdsData> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'ads');
  
  if (!tableName) {
    return { cost: 0, leads: 0, reach: 0, impressions: 0, results: 0, messages: 0, pageViews: 0 };
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select('spend, leads, reach, impressions, results, messages, page_views')
    .gte('date_start', startDate)
    .lte('date_start', endDate);

  if (error || !data) {
    console.error('Error fetching Meta Ads data:', error);
    return { cost: 0, leads: 0, reach: 0, impressions: 0, results: 0, messages: 0, pageViews: 0 };
  }

  const metrics = data as any[];
  return {
    cost: metrics.reduce((sum, m) => sum + (Number(m.spend) || 0), 0),
    leads: metrics.reduce((sum, m) => sum + (Number(m.leads) || 0), 0),
    reach: Math.max(...metrics.map(m => Number(m.reach) || 0), 0),
    impressions: metrics.reduce((sum, m) => sum + (Number(m.impressions) || 0), 0),
    results: metrics.reduce((sum, m) => sum + (Number(m.results) || 0), 0),
    messages: metrics.reduce((sum, m) => sum + (Number(m.messages) || 0), 0),
    pageViews: metrics.reduce((sum, m) => sum + (Number(m.page_views) || 0), 0),
  };
}

// Buscar dados do CRM da tabela crm_deals (multi-tenant)
async function getCrmDealsData(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<CrmDealsData> {
  // Fetch funnel stages to identify won/lost stages
  const { data: stages } = await supabase
    .from('crm_funnel_stages')
    .select('id, is_won, is_lost')
    .eq('client_id', clientId);

  // Fetch deals with date filter
  const { data, error } = await supabase
    .from('crm_deals')
    .select('id, stage_id, value')
    .eq('client_id', clientId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59');

  if (error || !data) {
    console.error('Error fetching CRM deals data:', error);
    return { wonDeals: 0, wonRevenue: 0, openDeals: 0, lostDeals: 0, totalDeals: 0 };
  }

  const wonStageIds = (stages || []).filter(s => s.is_won).map(s => s.id);
  const lostStageIds = (stages || []).filter(s => s.is_lost).map(s => s.id);

  const deals = data as any[];
  const wonDeals = deals.filter(d => wonStageIds.includes(d.stage_id));
  const lostDeals = deals.filter(d => lostStageIds.includes(d.stage_id));
  const openDeals = deals.filter(d => 
    !wonStageIds.includes(d.stage_id) && !lostStageIds.includes(d.stage_id)
  );

  return {
    wonDeals: wonDeals.length,
    wonRevenue: wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
    openDeals: openDeals.length,
    lostDeals: lostDeals.length,
    totalDeals: deals.length,
  };
}

export async function getAggregatedKpis(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<AggregatedKpis> {
  // Buscar de todas as fontes em paralelo
  const [googleResult, metaResult, crmResult] = await Promise.all([
    getGoogleAdsData(clientId, startDate, endDate),
    getMetaAdsData(clientId, startDate, endDate),
    getCrmDealsData(clientId, startDate, endDate),
  ]);

  const totalCost = googleResult.cost + metaResult.cost;
  const totalLeads = googleResult.leads + metaResult.leads;
  const totalReach = googleResult.reach + metaResult.reach;

  return {
    // Investimento
    totalCost,
    googleCost: googleResult.cost,
    metaCost: metaResult.cost,
    
    // Leads
    totalLeads,
    googleLeads: googleResult.leads,
    metaLeads: metaResult.leads,
    
    // Alcance
    totalReach,
    googleReach: googleResult.reach,
    metaReach: metaResult.reach,
    
    // CRM
    sales: crmResult.wonDeals,
    revenue: crmResult.wonRevenue,
    openDeals: crmResult.openDeals,
    lostDeals: crmResult.lostDeals,
    
    // Métricas calculadas
    cal: totalLeads > 0 ? totalCost / totalLeads : null,
    cav: crmResult.wonDeals > 0 ? totalCost / crmResult.wonDeals : null,
    roas: totalCost > 0 ? crmResult.wonRevenue / totalCost : null,
    conversionRate: totalLeads > 0 ? (crmResult.wonDeals / totalLeads) * 100 : null,
    avgTicket: crmResult.wonDeals > 0 ? crmResult.wonRevenue / crmResult.wonDeals : null,
  };
}

// Função para obter apenas dados de funil consolidados
export async function getConsolidatedFunnelData(
  clientId: string,
  startDate: string,
  endDate: string
) {
  const [googleResult, metaResult, crmResult] = await Promise.all([
    getGoogleAdsData(clientId, startDate, endDate),
    getMetaAdsData(clientId, startDate, endDate),
    getCrmDealsData(clientId, startDate, endDate),
  ]);

  return {
    reach: googleResult.reach + metaResult.reach,
    leads: googleResult.leads + metaResult.leads,
    sales: crmResult.wonDeals,
  };
}
