import { supabase } from '@/integrations/supabase/client';
import { getDashboardSummary, getProductMetrics } from './eduzzService';

export interface CrmKpiTotals {
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  avgTicket: number | null;
  conversionRate: number | null;
  recompraRevenue: number;
}

export interface FunnelData {
  contacts: number;
  opportunities: number;
  won: number;
}

export interface LostReasonData {
  reason: string;
  count: number;
}

export interface DealsEvolutionItem {
  date: string;
  newDeals: number;
  won: number;
  lost: number;
}

export interface DealsByStage {
  stageName: string;
  count: number;
  totalValue: number;
}

export interface DealsByOrigin {
  origin: string;
  count: number;
  won: number;
  conversionRate: number | null;
}

export interface RecompraEvolutionItem {
  month: string;
  revenue: number;
  count: number;
}

// Using crm_deals table for KPI data - multi-tenant with date filtering
export async function getCrmKpiTotals(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<CrmKpiTotals> {
  // Fetch funnel stages to identify won/lost stages
  const { data: stages } = await supabase
    .from('crm_funnel_stages')
    .select('id, is_won, is_lost')
    .eq('client_id', clientId);

  // Fetch deals with date filter
  const { data: deals, error } = await supabase
    .from('crm_deals')
    .select('id, stage_id, value, status, created_at')
    .eq('client_id', clientId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59');

  if (error) {
    console.error('Error fetching crm_deals:', error);
    return {
      openDeals: 0,
      wonDeals: 0,
      lostDeals: 0,
      totalRevenue: 0,
      avgTicket: null,
      conversionRate: null,
      recompraRevenue: 0,
    };
  }

  const wonStageIds = (stages || []).filter(s => s.is_won).map(s => s.id);
  const lostStageIds = (stages || []).filter(s => s.is_lost).map(s => s.id);

  const allDeals = deals || [];
  const wonDealsData = allDeals.filter(d => wonStageIds.includes(d.stage_id));
  const lostDealsData = allDeals.filter(d => lostStageIds.includes(d.stage_id));
  const openDealsData = allDeals.filter(d => 
    !wonStageIds.includes(d.stage_id) && !lostStageIds.includes(d.stage_id)
  );

  const totalRevenue = wonDealsData.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  const closedDeals = wonDealsData.length + lostDealsData.length;

  return {
    openDeals: openDealsData.length,
    wonDeals: wonDealsData.length,
    lostDeals: lostDealsData.length,
    totalRevenue,
    avgTicket: wonDealsData.length > 0 ? totalRevenue / wonDealsData.length : null,
    conversionRate: closedDeals > 0 ? (wonDealsData.length / closedDeals) * 100 : null,
    recompraRevenue: 0, // TODO: Calculate from recompra pipeline if needed
  };
}

export async function getSalesFunnelData(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<FunnelData> {
  // Fetch funnel stages to identify stage order
  const { data: stages } = await supabase
    .from('crm_funnel_stages')
    .select('id, order, is_won, is_lost')
    .eq('client_id', clientId)
    .order('order', { ascending: true });

  // Fetch deals with date filter
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('id, stage_id, value')
    .eq('client_id', clientId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59');

  if (!stages || !deals) {
    return { contacts: 0, opportunities: 0, won: 0 };
  }

  const wonStageIds = stages.filter(s => s.is_won).map(s => s.id);
  // Consider stages with order >= 2 as opportunities (excluding won/lost)
  const opportunityStageIds = stages
    .filter(s => s.order >= 2 && !s.is_won && !s.is_lost)
    .map(s => s.id);

  const allDeals = deals || [];
  const wonDeals = allDeals.filter(d => wonStageIds.includes(d.stage_id));
  const opportunities = allDeals.filter(d => opportunityStageIds.includes(d.stage_id));

  return {
    contacts: allDeals.length, // Total deals = contacts/leads
    opportunities: opportunities.length,
    won: wonDeals.length,
  };
}

export async function getLostReasons(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<LostReasonData[]> {
  // Fetch lost stages
  const { data: stages } = await supabase
    .from('crm_funnel_stages')
    .select('id')
    .eq('client_id', clientId)
    .eq('is_lost', true);

  const lostStageIds = (stages || []).map(s => s.id);
  if (lostStageIds.length === 0) return [];

  // Fetch lost deals
  const { data, error } = await supabase
    .from('crm_deals')
    .select('lost_reason')
    .eq('client_id', clientId)
    .in('stage_id', lostStageIds)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59');

  if (error) {
    console.error('Error fetching lost reasons:', error);
    return [];
  }

  const reasonCounts: Record<string, number> = {};
  ((data as any[]) || []).forEach((d) => {
    const reason = d.lost_reason || 'Não especificado';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });

  return Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getDealsEvolution(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<DealsEvolutionItem[]> {
  // Fetch stages to identify won/lost
  const { data: stages } = await supabase
    .from('crm_funnel_stages')
    .select('id, is_won, is_lost')
    .eq('client_id', clientId);

  const wonStageIds = (stages || []).filter(s => s.is_won).map(s => s.id);
  const lostStageIds = (stages || []).filter(s => s.is_lost).map(s => s.id);

  // Fetch deals
  const { data, error } = await supabase
    .from('crm_deals')
    .select('created_at, stage_id')
    .eq('client_id', clientId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching deals evolution:', error);
    return [];
  }

  const groupedByDate: Record<string, { newDeals: number; won: number; lost: number }> = {};

  ((data as any[]) || []).forEach((d) => {
    const date = d.created_at?.split('T')[0] || '';
    if (!date) return;
    
    if (!groupedByDate[date]) {
      groupedByDate[date] = { newDeals: 0, won: 0, lost: 0 };
    }
    groupedByDate[date].newDeals++;
    if (wonStageIds.includes(d.stage_id)) groupedByDate[date].won++;
    if (lostStageIds.includes(d.stage_id)) groupedByDate[date].lost++;
  });

  return Object.entries(groupedByDate)
    .map(([date, values]) => ({ date, ...values }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDealsByStage(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<DealsByStage[]> {
  // Fetch stages (excluding won/lost)
  const { data: stages } = await supabase
    .from('crm_funnel_stages')
    .select('id, name, is_won, is_lost')
    .eq('client_id', clientId)
    .eq('is_won', false)
    .eq('is_lost', false);

  const stageMap = new Map((stages || []).map(s => [s.id, s.name]));
  const openStageIds = (stages || []).map(s => s.id);
  
  if (openStageIds.length === 0) return [];

  // Fetch open deals
  const { data, error } = await supabase
    .from('crm_deals')
    .select('stage_id, value')
    .eq('client_id', clientId)
    .in('stage_id', openStageIds)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59');

  if (error) {
    console.error('Error fetching deals by stage:', error);
    return [];
  }

  const stageData: Record<string, { count: number; totalValue: number }> = {};

  ((data as any[]) || []).forEach((d) => {
    const stageName = stageMap.get(d.stage_id) || 'Sem fase';
    if (!stageData[stageName]) {
      stageData[stageName] = { count: 0, totalValue: 0 };
    }
    stageData[stageName].count++;
    stageData[stageName].totalValue += Number(d.value) || 0;
  });

  return Object.entries(stageData)
    .map(([stageName, values]) => ({ stageName, ...values }))
    .sort((a, b) => b.count - a.count);
}

export async function getDealsByOrigin(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<DealsByOrigin[]> {
  // Fetch stages to identify won/lost
  const { data: stages } = await supabase
    .from('crm_funnel_stages')
    .select('id, is_won, is_lost')
    .eq('client_id', clientId);

  const wonStageIds = (stages || []).filter(s => s.is_won).map(s => s.id);
  const lostStageIds = (stages || []).filter(s => s.is_lost).map(s => s.id);

  // Fetch deals
  const { data, error } = await supabase
    .from('crm_deals')
    .select('source, stage_id')
    .eq('client_id', clientId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59');

  if (error) {
    console.error('Error fetching deals by origin:', error);
    return [];
  }

  const originData: Record<string, { count: number; won: number; closed: number }> = {};

  ((data as any[]) || []).forEach((d) => {
    const origin = d.source || 'Não especificado';
    if (!originData[origin]) {
      originData[origin] = { count: 0, won: 0, closed: 0 };
    }
    originData[origin].count++;
    if (wonStageIds.includes(d.stage_id)) {
      originData[origin].won++;
      originData[origin].closed++;
    }
    if (lostStageIds.includes(d.stage_id)) {
      originData[origin].closed++;
    }
  });

  return Object.entries(originData)
    .map(([origin, values]) => ({
      origin,
      count: values.count,
      won: values.won,
      conversionRate: values.closed > 0 ? (values.won / values.closed) * 100 : null,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getRecompraEvolution(
  clientId: string
): Promise<RecompraEvolutionItem[]> {
  // Find "Recompra" funnel for client
  const { data: funnels } = await supabase
    .from('crm_funnels')
    .select('id')
    .eq('client_id', clientId)
    .ilike('name', '%recompra%');

  if (!funnels || funnels.length === 0) {
    return [];
  }

  const funnelIds = funnels.map(f => f.id);

  // Find won stages in recompra funnels
  const { data: stages } = await supabase
    .from('crm_funnel_stages')
    .select('id')
    .eq('client_id', clientId)
    .in('funnel_id', funnelIds)
    .eq('is_won', true);

  const wonStageIds = (stages || []).map(s => s.id);
  if (wonStageIds.length === 0) return [];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  // Fetch won deals from recompra funnel
  const { data, error } = await supabase
    .from('crm_deals')
    .select('created_at, value')
    .eq('client_id', clientId)
    .in('stage_id', wonStageIds)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching recompra evolution:', error);
    return [];
  }

  const monthlyData: Record<string, { revenue: number; count: number }> = {};

  ((data as any[]) || []).forEach((d) => {
    if (!d.created_at) return;
    const monthKey = d.created_at.substring(0, 7);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, count: 0 };
    }
    monthlyData[monthKey].revenue += Number(d.value) || 0;
    monthlyData[monthKey].count++;
  });

  return Object.entries(monthlyData)
    .map(([month, values]) => ({ month, ...values }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
