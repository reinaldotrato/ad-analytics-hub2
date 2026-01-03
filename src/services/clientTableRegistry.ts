import { supabase } from '@/integrations/supabase/client';

type Channel = 'google_ads' | 'meta_ads' | 'moskit' | 'rdstation' | 'eduzz';
type TableType = 
  // Google Ads
  | 'ad_metrics' | 'keywords'
  // Meta Ads  
  | 'campaigns' | 'campaigns_breakdowns' | 'campaigns_regions'
  | 'adsets' | 'adsets_breakdowns'
  | 'ads' | 'ads_breakdowns'
  | 'sync_control'
  // Meta Ads - Breakdown tables (specific per breakdown type)
  | 'campaign_platform' | 'campaign_age_gender' | 'campaign_gender' | 'campaign_region'
  // Moskit CRM
  | 'deals' | 'metrics'
  // RD Station
  | 'leads_historico' | 'resumo_mensal' | 'rd_metrics' | 'leads'
  // Eduzz
  | 'invoices' | 'dashboard_summary' | 'metrics_by_product' | 'metrics_daily' | 'summary';

// Cache para evitar múltiplas queries para o mesmo cliente
const tableNameCache = new Map<string, string | null>();
// Cache de preload por cliente (para evitar múltiplas chamadas de preload)
const preloadedClients = new Set<string>();
// Promise de preload em andamento para evitar race conditions
const preloadPromises = new Map<string, Promise<void>>();

function getCacheKey(clientId: string, channel: Channel, tableType: TableType): string {
  return `${clientId}:${channel}:${tableType}`;
}

/**
 * Busca o nome da tabela dinâmica baseado no cliente, canal e tipo
 * Retorna null se não encontrar registro (cliente sem integração configurada)
 */
export async function getClientTableName(
  clientId: string,
  channel: Channel,
  tableType: TableType
): Promise<string | null> {
  const cacheKey = getCacheKey(clientId, channel, tableType);
  
  // Verificar cache primeiro
  if (tableNameCache.has(cacheKey)) {
    return tableNameCache.get(cacheKey) || null;
  }
  
  // Se ainda não fez preload deste cliente, fazer agora
  if (!preloadedClients.has(clientId)) {
    await preloadClientTables(clientId);
    // Após preload, verificar cache novamente
    if (tableNameCache.has(cacheKey)) {
      return tableNameCache.get(cacheKey) || null;
    }
  }
  
  // Fallback: query individual (não deveria chegar aqui após preload)
  const { data, error } = await supabase
    .from('client_table_registry')
    .select('table_name')
    .eq('client_id', clientId)
    .eq('channel', channel)
    .eq('table_type', tableType)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching table name for ${channel}/${tableType}:`, error);
    return null;
  }
  
  const tableName = data?.table_name || null;
  tableNameCache.set(cacheKey, tableName);
  
  return tableName;
}

/**
 * Busca todos os nomes de tabelas de um canal para um cliente
 * Útil para pré-carregar todas as tabelas de uma vez
 */
export async function getClientChannelTables(
  clientId: string,
  channel: Channel
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('client_table_registry')
    .select('table_type, table_name')
    .eq('client_id', clientId)
    .eq('channel', channel);
  
  if (error || !data) {
    console.error(`Error fetching channel tables for ${channel}:`, error);
    return {};
  }
  
  const tables: Record<string, string> = {};
  data.forEach(row => {
    tables[row.table_type] = row.table_name;
    // Também atualiza o cache
    const cacheKey = getCacheKey(clientId, channel, row.table_type as TableType);
    tableNameCache.set(cacheKey, row.table_name);
  });
  
  return tables;
}

/**
 * Pré-carrega todas as tabelas do cliente no cache
 * Chamado uma vez no início para otimizar performance
 * Usa singleton pattern para evitar múltiplas chamadas simultâneas
 */
export async function preloadClientTables(clientId: string): Promise<void> {
  // Se já foi preloaded, retornar imediatamente
  if (preloadedClients.has(clientId)) {
    return;
  }
  
  // Se há um preload em andamento, aguardar
  if (preloadPromises.has(clientId)) {
    return preloadPromises.get(clientId);
  }
  
  // Criar promise de preload
  const preloadPromise = (async () => {
    const { data, error } = await supabase
      .from('client_table_registry')
      .select('channel, table_type, table_name')
      .eq('client_id', clientId);
    
    if (error || !data) {
      console.error('Error preloading client tables:', error);
      return;
    }
    
    data.forEach(row => {
      const cacheKey = getCacheKey(clientId, row.channel as Channel, row.table_type as TableType);
      tableNameCache.set(cacheKey, row.table_name);
    });
    
    preloadedClients.add(clientId);
    preloadPromises.delete(clientId);
  })();
  
  preloadPromises.set(clientId, preloadPromise);
  return preloadPromise;
}

/**
 * Limpa o cache de tabelas (útil ao trocar de cliente)
 */
export function clearTableCache(): void {
  tableNameCache.clear();
  preloadedClients.clear();
  preloadPromises.clear();
}

/**
 * Verifica se um cliente tem integração configurada para um canal
 */
export async function hasChannelIntegration(
  clientId: string,
  channel: Channel
): Promise<boolean> {
  const { count, error } = await supabase
    .from('client_table_registry')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('channel', channel);
  
  if (error) {
    console.error(`Error checking channel integration for ${channel}:`, error);
    return false;
  }
  
  return (count || 0) > 0;
}
