import { supabase } from '@/integrations/supabase/client';
import { getClientTableName } from './clientTableRegistry';

export interface RdStationMetrics {
  period: string;
  periodStart: string;
  periodEnd: string;
  totalLeads: number;
  source: string;
  segmentationId: number | null;
  segmentationName: string | null;
  syncedAt: string | null;
}

export interface RdStationLeadsData {
  totalLeads: number;
  periodoNome: string;
  leadsByMonth: RdStationMetrics[];
}

export interface RdStationDailyEvolution {
  date: string;
  leads: number;
}

export interface RdStationBySource {
  source: string;
  leads: number;
}

/**
 * Busca leads granulares do RD Station por período de datas (tabela de leads)
 * Preferido sobre a tabela agregada rd_metrics
 */
async function getGranularLeadsByPeriod(
  tableName: string,
  startDate: Date,
  endDate: Date
): Promise<{ count: number; data: any[] }> {
  const startStr = startDate.toISOString();
  const endStr = endDate.toISOString();

  const { data, error, count } = await supabase
    .from(tableName as any)
    .select('rd_created_at, conversion_source, conversion_medium, conversion_campaign', { count: 'exact' })
    .gte('rd_created_at', startStr)
    .lte('rd_created_at', endStr);

  if (error) {
    console.error('Error fetching granular RD leads:', error);
    return { count: 0, data: [] };
  }

  return { count: count || 0, data: data || [] };
}

/**
 * Busca leads do RD Station por período de datas
 * Prioriza tabela granular (leads), fallback para tabela agregada (rd_metrics)
 */
export async function getRdStationLeadsByPeriod(
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<RdStationLeadsData | null> {
  try {
    // Tentar primeiro tabela granular de leads
    const leadsTableName = await getClientTableName(clientId, 'rdstation', 'leads');
    
    if (leadsTableName) {
      const { count } = await getGranularLeadsByPeriod(leadsTableName, startDate, endDate);
      
      return {
        totalLeads: count,
        periodoNome: `${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`,
        leadsByMonth: [], // Para granular, não retornamos por mês aqui
      };
    }
    
    // Fallback: tabela agregada rd_metrics (legada)
    const metricsTableName = await getClientTableName(clientId, 'rdstation', 'rd_metrics');
    
    if (!metricsTableName) {
      console.log(`No RD Station table registered for client ${clientId}`);
      return {
        totalLeads: 0,
        periodoNome: `${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`,
        leadsByMonth: [],
      };
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from(metricsTableName as any)
      .select('*')
      .gte('period_start', startStr)
      .lte('period_end', endStr)
      .order('period', { ascending: true });

    if (error) {
      console.error('Error fetching RD Station metrics:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalLeads: 0,
        periodoNome: `${startStr} a ${endStr}`,
        leadsByMonth: [],
      };
    }

    const leadsByMonth: RdStationMetrics[] = data.map((row: any) => ({
      period: row.period,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      totalLeads: row.total_leads || 0,
      source: row.source || 'rdstation',
      segmentationId: row.segmentation_id,
      segmentationName: row.segmentation_name,
      syncedAt: row.synced_at,
    }));

    const totalLeads = leadsByMonth.reduce((sum, m) => sum + m.totalLeads, 0);

    return {
      totalLeads,
      periodoNome: `${startStr} a ${endStr}`,
      leadsByMonth,
    };
  } catch (err) {
    console.error('Exception fetching RD Station leads:', err);
    return null;
  }
}

/**
 * Busca evolução diária de leads do RD Station (somente tabela granular)
 */
export async function getRdStationDailyEvolution(
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<RdStationDailyEvolution[]> {
  try {
    const leadsTableName = await getClientTableName(clientId, 'rdstation', 'leads');
    if (!leadsTableName) return [];

    const { data } = await getGranularLeadsByPeriod(leadsTableName, startDate, endDate);
    
    // Agrupar por dia
    const dailyMap = new Map<string, number>();
    
    data.forEach((row: any) => {
      if (!row.rd_created_at) return;
      const date = new Date(row.rd_created_at).toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    return Array.from(dailyMap.entries())
      .map(([date, leads]) => ({ date, leads }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    console.error('Exception fetching RD Station daily evolution:', err);
    return [];
  }
}

/**
 * Busca leads agrupados por origem/fonte (somente tabela granular)
 */
export async function getRdStationBySource(
  clientId: string,
  startDate: Date,
  endDate: Date
): Promise<RdStationBySource[]> {
  try {
    const leadsTableName = await getClientTableName(clientId, 'rdstation', 'leads');
    if (!leadsTableName) return [];

    const { data } = await getGranularLeadsByPeriod(leadsTableName, startDate, endDate);
    
    // Agrupar por source
    const sourceMap = new Map<string, number>();
    
    data.forEach((row: any) => {
      const source = row.conversion_source || 'Não identificado';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    return Array.from(sourceMap.entries())
      .map(([source, leads]) => ({ source, leads }))
      .sort((a, b) => b.leads - a.leads);
  } catch (err) {
    console.error('Exception fetching RD Station by source:', err);
    return [];
  }
}

/**
 * Busca leads de um mês específico
 */
export async function getRdStationLeadsByMonth(
  clientId: string,
  year: number,
  month: number
): Promise<RdStationMetrics | null> {
  try {
    // Primeiro tentar tabela granular
    const leadsTableName = await getClientTableName(clientId, 'rdstation', 'leads');
    
    if (leadsTableName) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const { count } = await supabase
        .from(leadsTableName as any)
        .select('id', { count: 'exact', head: true })
        .gte('rd_created_at', startDate.toISOString())
        .lte('rd_created_at', endDate.toISOString());
      
      return {
        period: `${year}-${String(month).padStart(2, '0')}`,
        periodStart: startDate.toISOString().split('T')[0],
        periodEnd: endDate.toISOString().split('T')[0],
        totalLeads: count || 0,
        source: 'rdstation',
        segmentationId: null,
        segmentationName: null,
        syncedAt: null,
      };
    }
    
    // Fallback para rd_metrics
    const metricsTableName = await getClientTableName(clientId, 'rdstation', 'rd_metrics');
    if (!metricsTableName) return null;

    const period = `${year}-${String(month).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from(metricsTableName as any)
      .select('*')
      .eq('period', period)
      .maybeSingle();

    if (error) {
      console.error('Error fetching RD Station metrics by month:', error);
      return null;
    }

    if (!data) return null;

    const row = data as any;
    return {
      period: row.period,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      totalLeads: row.total_leads || 0,
      source: row.source || 'rdstation',
      segmentationId: row.segmentation_id,
      segmentationName: row.segmentation_name,
      syncedAt: row.synced_at,
    };
  } catch (err) {
    console.error('Exception fetching RD Station leads by month:', err);
    return null;
  }
}

/**
 * Busca todos os leads agrupados por mês para um ano
 * Prioriza tabela granular, fallback para rd_metrics
 */
export async function getRdStationLeadsByYear(
  clientId: string,
  year: number
): Promise<RdStationMetrics[]> {
  try {
    // Primeiro tentar tabela granular
    const leadsTableName = await getClientTableName(clientId, 'rdstation', 'leads');
    
    if (leadsTableName) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      const { data, error } = await supabase
        .from(leadsTableName as any)
        .select('rd_created_at')
        .gte('rd_created_at', startDate.toISOString())
        .lte('rd_created_at', endDate.toISOString());
      
      if (error) {
        console.error('Error fetching granular RD leads by year:', error);
        return [];
      }
      
      // Agrupar por mês
      const monthlyMap = new Map<number, number>();
      
      (data || []).forEach((row: any) => {
        if (!row.rd_created_at) return;
        const month = new Date(row.rd_created_at).getMonth(); // 0-11
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
      });
      
      return Array.from(monthlyMap.entries()).map(([monthIndex, count]) => ({
        period: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
        periodStart: new Date(year, monthIndex, 1).toISOString().split('T')[0],
        periodEnd: new Date(year, monthIndex + 1, 0).toISOString().split('T')[0],
        totalLeads: count,
        source: 'rdstation',
        segmentationId: null,
        segmentationName: null,
        syncedAt: null,
      }));
    }
    
    // Fallback para rd_metrics
    const metricsTableName = await getClientTableName(clientId, 'rdstation', 'rd_metrics');
    if (!metricsTableName) return [];

    const { data, error } = await supabase
      .from(metricsTableName as any)
      .select('*')
      .gte('period', `${year}-01`)
      .lte('period', `${year}-12`)
      .order('period', { ascending: true });

    if (error) {
      console.error('Error fetching RD Station metrics by year:', error);
      return [];
    }

    if (!data) return [];
    
    return data.map((row: any) => ({
      period: row.period,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      totalLeads: row.total_leads || 0,
      source: row.source || 'rdstation',
      segmentationId: row.segmentation_id,
      segmentationName: row.segmentation_name,
      syncedAt: row.synced_at,
    }));
  } catch (err) {
    console.error('Exception fetching RD Station leads by year:', err);
    return [];
  }
}
