import { supabase } from '@/integrations/supabase/client';
import { getClientTableName } from './clientTableRegistry';

export interface DashboardSummary {
  leads_rd_station: number;
  funil_oportunidades: number;
  funil_vendas: number;
  eduzz_receita_liquida: number;
  eduzz_receita_bruta: number;
  eduzz_vendas: number;
  eduzz_tentativas: number;
  taxa_lead_to_checkout: number;
  taxa_checkout_to_sale: number;
  taxa_lead_to_sale: number;
  rd_period: string;
  last_updated: string;
}

export interface ProductMetrics {
  product_id: string;
  product_name: string;
  product_type: string;
  total_vendas: number;
  total_tentativas: number;
  receita_bruta: number;
  receita_liquida: number;
  taxa_conversao: number;
}

export async function getDashboardSummary(clientId: string): Promise<DashboardSummary | null> {
  const tableName = await getClientTableName(clientId, 'eduzz', 'dashboard_summary');
  
  if (!tableName) {
    console.warn(`No dashboard_summary table configured for client ${clientId}`);
    return null;
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching dashboard summary:', error);
    return null;
  }

  return data as unknown as DashboardSummary;
}

export async function getProductMetrics(clientId: string): Promise<ProductMetrics[]> {
  const tableName = await getClientTableName(clientId, 'eduzz', 'metrics_by_product');
  
  if (!tableName) {
    console.warn(`No metrics_by_product table configured for client ${clientId}`);
    return [];
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select('*');

  if (error) {
    console.error('Error fetching product metrics:', error);
    return [];
  }

  return (data || []) as unknown as ProductMetrics[];
}

export async function getEduzzInvoices(
  clientId: string,
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  const tableName = await getClientTableName(clientId, 'eduzz', 'invoices');
  
  if (!tableName) {
    console.warn(`No invoices table configured for client ${clientId}`);
    return [];
  }

  let query = supabase
    .from(tableName as any)
    .select('*')
    .eq('status', 'paid');
  
  if (startDate && endDate) {
    query = query
      .gte('paid_at', startDate)
      .lte('paid_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching eduzz invoices:', error);
    return [];
  }

  return data || [];
}
