import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClientMetrics {
  clientId: string;
  clientName: string;
  logoUrl: string | null;
  googleCampaignsActive: number;
  metaCampaignsActive: number;
  googleSpend: number;
  metaSpend: number;
  leads: number;
  opportunities: number;
  sales: number;
  revenue: number;
  cal: number;
  cav: number;
  roas: number;
  hasSyncedData: boolean;
}

interface ActiveCampaign {
  clientName: string;
  campaignName: string;
  channel: 'google' | 'meta';
  spend: number;
  results: number;
  status: string;
}

interface GlobalMetrics {
  totals: {
    totalSpend: number;
    googleSpend: number;
    metaSpend: number;
    leads: number;
    opportunities: number;
    sales: number;
    revenue: number;
    cal: number;
    cav: number;
    roas: number;
    conversionRate: number;
  };
  byClient: ClientMetrics[];
  activeCampaigns: ActiveCampaign[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user's JWT to verify they're authenticated
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to check admin status
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin using the has_analytics_role function
    const { data: isAdmin, error: roleError } = await adminClient.rpc('has_analytics_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to verify admin role' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isAdmin) {
      console.error('User is not admin:', user.id);
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin verified, fetching global metrics for user:', user.id);

    // Parse request body for date filters
    let startDate: string | null = null;
    let endDate: string | null = null;
    
    try {
      const body = await req.json();
      startDate = body.startDate || null;
      endDate = body.endDate || null;
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Set default dates if not provided (current month)
    const now = new Date();
    const defaultEndDate = now.toISOString().split('T')[0];
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    startDate = startDate || defaultStartDate;
    endDate = endDate || defaultEndDate;

    console.log('Date range:', startDate, 'to', endDate);

    // Get all clients
    const { data: clients, error: clientsError } = await adminClient
      .from('tryvia_analytics_clients')
      .select('id, name, logo_url');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      throw clientsError;
    }

    console.log('Found clients:', clients?.length);

    // Get client table registry to know which tables exist
    const { data: tableRegistry, error: registryError } = await adminClient
      .from('client_table_registry')
      .select('client_id, channel, table_name, table_type');

    if (registryError) {
      console.error('Error fetching table registry:', registryError);
      throw registryError;
    }

    console.log('Table registry entries:', tableRegistry?.length);

    // Initialize totals
    let totalGoogleSpend = 0;
    let totalMetaSpend = 0;
    let totalLeads = 0;
    let totalOpportunities = 0;
    let totalSales = 0;
    let totalRevenue = 0;

    const byClient: ClientMetrics[] = [];
    const activeCampaigns: ActiveCampaign[] = [];

    // Process each client
    for (const client of clients || []) {
      console.log(`\n=== Processing client: ${client.name} (${client.id}) ===`);
      
      let clientGoogleSpend = 0;
      let clientMetaSpend = 0;
      let clientLeads = 0;
      let clientOpportunities = 0;
      let clientSales = 0;
      let clientRevenue = 0;
      let googleCampaignsActive = 0;
      let metaCampaignsActive = 0;

      // Find tables for this client
      const clientTables = tableRegistry?.filter(t => t.client_id === client.id) || [];
      console.log(`  Tables registered: ${clientTables.length}`);
      console.log(`  Table types: ${clientTables.map(t => `${t.channel}/${t.table_type}`).join(', ')}`);

      // Process Meta Ads campaigns - CORRECTED: channel = 'meta_ads', table_type = 'campaigns'
      const metaCampaignsTable = clientTables.find(t => t.channel === 'meta_ads' && t.table_type === 'campaigns');
      console.log(`  Meta campaigns table: ${metaCampaignsTable?.table_name || 'NOT FOUND'}`);
      
      if (metaCampaignsTable) {
        try {
          const { data: metaData, error: metaError } = await adminClient
            .from(metaCampaignsTable.table_name)
            .select('campaign_name, spend, leads, results, effective_status, date_start, date_end')
            .gte('date_start', startDate)
            .lte('date_end', endDate);

          if (metaError) {
            console.error(`  Meta query error:`, metaError.message);
          } else if (metaData) {
            console.log(`  Meta campaigns found: ${metaData.length}`);
            
            for (const campaign of metaData) {
              const spend = Number(campaign.spend) || 0;
              const leads = Number(campaign.leads) || Number(campaign.results) || 0;
              clientMetaSpend += spend;
              clientLeads += leads;

              // IMPROVED: Consider campaign active if status is ACTIVE or if it has spend and no status
              const isActive = campaign.effective_status === 'ACTIVE' || 
                             (!campaign.effective_status && spend > 0);
              
              if (isActive) {
                metaCampaignsActive++;
                activeCampaigns.push({
                  clientName: client.name,
                  campaignName: campaign.campaign_name || 'Unnamed Campaign',
                  channel: 'meta',
                  spend,
                  results: leads,
                  status: campaign.effective_status || 'ACTIVE',
                });
              }
            }
            console.log(`  Meta spend: R$ ${clientMetaSpend.toFixed(2)}, Leads: ${clientLeads}, Active: ${metaCampaignsActive}`);
          }
        } catch (err) {
          console.error(`  Error fetching meta campaigns for ${client.name}:`, err);
        }
      }

      // Process Google Ads - CORRECTED: channel = 'google_ads', table_type = 'ad_metrics'
      const googleAdsTable = clientTables.find(t => t.channel === 'google_ads' && t.table_type === 'ad_metrics');
      console.log(`  Google ads table: ${googleAdsTable?.table_name || 'NOT FOUND'}`);
      
      if (googleAdsTable) {
        try {
          const { data: googleData, error: googleError } = await adminClient
            .from(googleAdsTable.table_name)
            .select('campaign_name, cost, leads, results, status, date')
            .gte('date', startDate)
            .lte('date', endDate);

          if (googleError) {
            console.error(`  Google query error:`, googleError.message);
          } else if (googleData) {
            console.log(`  Google ads rows found: ${googleData.length}`);
            
            // Aggregate by campaign
            const campaignMap = new Map<string, { spend: number; leads: number; status: string | null }>();
            
            for (const row of googleData) {
              const name = row.campaign_name || 'Unnamed Campaign';
              const existing = campaignMap.get(name) || { spend: 0, leads: 0, status: row.status };
              existing.spend += Number(row.cost) || 0;
              existing.leads += Number(row.leads) || Number(row.results) || 0;
              campaignMap.set(name, existing);
            }

            for (const [name, data] of campaignMap) {
              clientGoogleSpend += data.spend;
              clientLeads += data.leads;

              // IMPROVED: Consider active if ENABLED/ACTIVE or if has spend and no status
              const isActive = data.status === 'ENABLED' || data.status === 'ACTIVE' || 
                             (!data.status && data.spend > 0);
              
              if (isActive) {
                googleCampaignsActive++;
                activeCampaigns.push({
                  clientName: client.name,
                  campaignName: name,
                  channel: 'google',
                  spend: data.spend,
                  results: data.leads,
                  status: data.status || 'ACTIVE',
                });
              }
            }
            console.log(`  Google spend: R$ ${clientGoogleSpend.toFixed(2)}, Leads: ${clientLeads}, Active: ${googleCampaignsActive}`);
          }
        } catch (err) {
          console.error(`  Error fetching google ads for ${client.name}:`, err);
        }
      }

      // Check for external CRM data (Moskit) - channel = 'moskit', table_type = 'deals'
      const moskitDealsTable = clientTables.find(t => t.channel === 'moskit' && t.table_type === 'deals');
      console.log(`  Moskit deals table: ${moskitDealsTable?.table_name || 'NOT FOUND'}`);
      
      if (moskitDealsTable) {
        try {
          const { data: moskitDeals, error: moskitError } = await adminClient
            .from(moskitDealsTable.table_name)
            .select('deal_id, deal_name, price, status, stage_name, date_created, date_closed')
            .gte('date_created', startDate)
            .lte('date_created', endDate + 'T23:59:59');

          if (moskitError) {
            console.error(`  Moskit query error:`, moskitError.message);
          } else if (moskitDeals) {
            console.log(`  Moskit deals found: ${moskitDeals.length}`);
            
            for (const deal of moskitDeals) {
              // Count as opportunity if not won/lost
              if (deal.status === 'open' || deal.status === 'pending' || !deal.status) {
                clientOpportunities++;
              }
              
              // Count as sale if won
              if (deal.status === 'won' || deal.stage_name?.toLowerCase().includes('ganho') || deal.stage_name?.toLowerCase().includes('fechado')) {
                clientSales++;
                clientRevenue += Number(deal.price) || 0;
              }
            }
            console.log(`  Moskit: Opportunities: ${clientOpportunities}, Sales: ${clientSales}, Revenue: R$ ${clientRevenue.toFixed(2)}`);
          }
        } catch (err) {
          console.error(`  Error fetching moskit deals for ${client.name}:`, err);
        }
      }

      // Get CRM data from internal crm_deals table
      try {
        const { data: crmDeals, error: crmError } = await adminClient
          .from('crm_deals')
          .select(`
            id,
            value,
            stage_id,
            created_at,
            closed_at,
            crm_funnel_stages!inner(is_won, is_lost, order)
          `)
          .eq('client_id', client.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59');

        if (crmError) {
          console.log(`  Internal CRM query error: ${crmError.message}`);
        } else if (crmDeals && crmDeals.length > 0) {
          console.log(`  Internal CRM deals found: ${crmDeals.length}`);
          
          for (const deal of crmDeals) {
            const stageData = deal.crm_funnel_stages;
            // Handle both array and object responses
            const stage = Array.isArray(stageData) ? stageData[0] : stageData;
            
            if (!stage) continue;
            
            // Count opportunities (stage order >= 2 and not won/lost)
            if (stage.order >= 2 && !stage.is_won && !stage.is_lost) {
              clientOpportunities++;
            }
            
            // Count sales
            if (stage.is_won) {
              clientSales++;
              clientRevenue += Number(deal.value) || 0;
            }
          }
          console.log(`  Internal CRM: Opportunities: ${clientOpportunities}, Sales: ${clientSales}, Revenue: R$ ${clientRevenue.toFixed(2)}`);
        } else {
          console.log(`  Internal CRM: No deals found for this client`);
        }
      } catch (err) {
        console.error(`  Error fetching CRM data for ${client.name}:`, err);
      }

      // Add to totals
      totalGoogleSpend += clientGoogleSpend;
      totalMetaSpend += clientMetaSpend;
      totalLeads += clientLeads;
      totalOpportunities += clientOpportunities;
      totalSales += clientSales;
      totalRevenue += clientRevenue;

      // Calculate client metrics
      const clientTotalSpend = clientGoogleSpend + clientMetaSpend;
      const clientCal = clientLeads > 0 ? clientTotalSpend / clientLeads : 0;
      const clientCav = clientSales > 0 ? clientTotalSpend / clientSales : 0;
      const clientRoas = clientTotalSpend > 0 ? clientRevenue / clientTotalSpend : 0;

      // Determine if client has synced data
      // Has synced data if: has tables registered AND has received any data
      const hasSyncedData = clientTables.length > 0 && 
        (clientGoogleSpend > 0 || clientMetaSpend > 0 || clientLeads > 0 || 
         clientOpportunities > 0 || clientSales > 0 || clientRevenue > 0);

      // ALWAYS add client to the list (even without data)
      byClient.push({
        clientId: client.id,
        clientName: client.name,
        logoUrl: client.logo_url || null,
        googleCampaignsActive,
        metaCampaignsActive,
        googleSpend: clientGoogleSpend,
        metaSpend: clientMetaSpend,
        leads: clientLeads,
        opportunities: clientOpportunities,
        sales: clientSales,
        revenue: clientRevenue,
        cal: clientCal,
        cav: clientCav,
        roas: clientRoas,
        hasSyncedData,
      });

      console.log(`  TOTALS for ${client.name}: Spend: R$ ${clientTotalSpend.toFixed(2)}, Leads: ${clientLeads}, Opp: ${clientOpportunities}, Sales: ${clientSales}, Revenue: R$ ${clientRevenue.toFixed(2)}`);
    }

    // Calculate global derived metrics
    const totalSpend = totalGoogleSpend + totalMetaSpend;
    const globalCal = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const globalCav = totalSales > 0 ? totalSpend / totalSales : 0;
    const globalRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const conversionRate = totalLeads > 0 ? (totalSales / totalLeads) * 100 : 0;

    const result: GlobalMetrics = {
      totals: {
        totalSpend,
        googleSpend: totalGoogleSpend,
        metaSpend: totalMetaSpend,
        leads: totalLeads,
        opportunities: totalOpportunities,
        sales: totalSales,
        revenue: totalRevenue,
        cal: globalCal,
        cav: globalCav,
        roas: globalRoas,
        conversionRate,
      },
      byClient: byClient.sort((a, b) => (b.metaSpend + b.googleSpend) - (a.metaSpend + a.googleSpend)),
      activeCampaigns: activeCampaigns.sort((a, b) => b.spend - a.spend).slice(0, 20),
    };

    console.log('\n=== GLOBAL METRICS SUMMARY ===');
    console.log('Total Spend:', totalSpend);
    console.log('Google Spend:', totalGoogleSpend);
    console.log('Meta Spend:', totalMetaSpend);
    console.log('Total Leads:', totalLeads);
    console.log('Total Opportunities:', totalOpportunities);
    console.log('Total Sales:', totalSales);
    console.log('Total Revenue:', totalRevenue);
    console.log('Total Clients:', byClient.length);
    console.log('Active Campaigns:', activeCampaigns.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-global-metrics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
