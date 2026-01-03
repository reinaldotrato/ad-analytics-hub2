import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Menina Oficina client ID
const MO_CLIENT_ID = '11111111-1111-1111-1111-111111111111';

interface DashboardSummary {
  rd_period: string;
  leads_rd_station: number;
  funil_leads: number;
  funil_oportunidades: number;
  funil_vendas: number;
  eduzz_receita_bruta: number;
  eduzz_receita_liquida: number;
  eduzz_vendas: number;
  eduzz_tentativas: number;
  taxa_lead_to_checkout: number;
  taxa_checkout_to_sale: number;
  taxa_lead_to_sale: number;
  last_updated: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional parameters
    let targetPeriod: string | undefined;
    try {
      const body = await req.json();
      targetPeriod = body.period; // Optional: specify a specific period
    } catch {
      // No body or invalid JSON - use current month
    }

    // Calculate current period (YYYY-MM format)
    const now = new Date();
    const period = targetPeriod || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Calculate date range for the period
    const [year, month] = period.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    
    const startDate = startOfMonth.toISOString();
    const endDate = endOfMonth.toISOString();

    console.log(`Recalculating summary for period: ${period}`);
    console.log(`Date range: ${startDate} to ${endDate}`);

    // 1. Count RD Station leads for the period
    const { count: rdLeadsCount, error: rdError } = await supabase
      .from('mo_rdstation_leads')
      .select('*', { count: 'exact', head: true })
      .gte('rd_created_at', startDate)
      .lte('rd_created_at', endDate);

    if (rdError) {
      console.error('Error fetching RD Station leads:', rdError);
    }

    const leadsRdStation = rdLeadsCount || 0;
    console.log(`RD Station leads: ${leadsRdStation}`);

    // 2. Calculate Eduzz metrics
    const { data: eduzzData, error: eduzzError } = await supabase
      .from('mo_eduzz_invoices')
      .select('status, valor_item, ganho, is_abandonment')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (eduzzError) {
      console.error('Error fetching Eduzz invoices:', eduzzError);
    }

    const eduzzInvoices = eduzzData || [];
    const eduzzTentativas = eduzzInvoices.length;
    const eduzzVendas = eduzzInvoices.filter(i => i.status === 'paid').length;
    const eduzzReceitaBruta = eduzzInvoices
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + (Number(i.valor_item) || 0), 0);
    const eduzzReceitaLiquida = eduzzInvoices
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + (Number(i.ganho) || 0), 0);

    console.log(`Eduzz - Tentativas: ${eduzzTentativas}, Vendas: ${eduzzVendas}, Receita Bruta: ${eduzzReceitaBruta}, Receita Líquida: ${eduzzReceitaLiquida}`);

    // 3. Calculate CRM funnel metrics
    // First, get stages for Menina Oficina client
    const { data: stagesData, error: stagesError } = await supabase
      .from('crm_funnel_stages')
      .select('id, name, "order", is_won, is_lost')
      .eq('client_id', MO_CLIENT_ID)
      .order('order');

    if (stagesError) {
      console.error('Error fetching funnel stages:', stagesError);
    }

    const stages = stagesData || [];
    const wonStageIds = stages.filter(s => s.is_won).map(s => s.id);
    const lostStageIds = stages.filter(s => s.is_lost).map(s => s.id);
    const opportunityStageIds = stages
      .filter(s => !s.is_won && !s.is_lost && s.order >= 2)
      .map(s => s.id);

    // Get deals for the period
    const { data: dealsData, error: dealsError } = await supabase
      .from('crm_deals')
      .select('id, stage_id, value')
      .eq('client_id', MO_CLIENT_ID)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (dealsError) {
      console.error('Error fetching CRM deals:', dealsError);
    }

    const deals = dealsData || [];
    const funilLeads = leadsRdStation; // Leads from RD Station
    const funilOportunidades = deals.filter(d => opportunityStageIds.includes(d.stage_id)).length;
    const funilVendas = deals.filter(d => wonStageIds.includes(d.stage_id)).length;

    console.log(`Funil - Leads: ${funilLeads}, Oportunidades: ${funilOportunidades}, Vendas: ${funilVendas}`);

    // 4. Calculate conversion rates
    const taxaLeadToCheckout = eduzzTentativas > 0 && leadsRdStation > 0
      ? (eduzzTentativas / leadsRdStation) * 100
      : 0;

    const taxaCheckoutToSale = eduzzTentativas > 0
      ? (eduzzVendas / eduzzTentativas) * 100
      : 0;

    const taxaLeadToSale = leadsRdStation > 0
      ? (eduzzVendas / leadsRdStation) * 100
      : 0;

    console.log(`Taxas - Lead→Checkout: ${taxaLeadToCheckout.toFixed(2)}%, Checkout→Sale: ${taxaCheckoutToSale.toFixed(2)}%, Lead→Sale: ${taxaLeadToSale.toFixed(2)}%`);

    // 5. Build summary object
    const summary: DashboardSummary = {
      rd_period: period,
      leads_rd_station: leadsRdStation,
      funil_leads: funilLeads,
      funil_oportunidades: funilOportunidades,
      funil_vendas: funilVendas,
      eduzz_receita_bruta: eduzzReceitaBruta,
      eduzz_receita_liquida: eduzzReceitaLiquida,
      eduzz_vendas: eduzzVendas,
      eduzz_tentativas: eduzzTentativas,
      taxa_lead_to_checkout: Math.round(taxaLeadToCheckout * 100) / 100,
      taxa_checkout_to_sale: Math.round(taxaCheckoutToSale * 100) / 100,
      taxa_lead_to_sale: Math.round(taxaLeadToSale * 100) / 100,
      last_updated: new Date().toISOString(),
    };

    // 6. Upsert the summary
    const { data: upsertData, error: upsertError } = await supabase
      .from('mo_dashboard_summary')
      .upsert(summary, { 
        onConflict: 'rd_period',
        ignoreDuplicates: false 
      })
      .select();

    if (upsertError) {
      console.error('Error upserting summary:', upsertError);
      throw upsertError;
    }

    console.log('Summary updated successfully:', upsertData);

    return new Response(
      JSON.stringify({
        success: true,
        period,
        summary,
        message: `Dashboard summary recalculated for period ${period}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('Error in recalculate-summary:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
