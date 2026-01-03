import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Gera um prefixo de 2-3 letras baseado no nome do cliente
 * Ex: "Lorpen" -> "lo", "Menina Oficina" -> "mo", "Nova Empresa" -> "ne"
 */
function generateTablePrefix(name: string): string {
  const words = name.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/);
  
  if (words.length >= 2) {
    // Usar primeira letra de cada palavra (max 3)
    return words.slice(0, 3).map(w => w[0]).join('');
  }
  
  // Se só tem uma palavra, usar as 2-3 primeiras letras
  return words[0].slice(0, 2);
}

/**
 * Cria as credenciais do cliente para as integrações
 */
async function createClientCredentials(
  supabaseAdmin: any,
  clientId: string,
  clientName: string,
  credentials: {
    googleAdsCustomerId?: string;
    metaAdsAccountId?: string;
    rdStationApiToken?: string;
    n8nWebhookUrl?: string;
  }
): Promise<{ channel: string; channelName: string; login?: string }[]> {
  console.log(`Creating credentials for client ${clientName}`);
  
  const n8nWebhookUrl = credentials.n8nWebhookUrl?.trim() || null;
  const credentialRecords = [];
  const createdCredentials: { channel: string; channelName: string; login?: string }[] = [];
  
  // Google Ads
  if (credentials.googleAdsCustomerId?.trim()) {
    const cleanedId = credentials.googleAdsCustomerId.replace(/-/g, '').trim();
    credentialRecords.push({
      client_id: clientId,
      channel: 'google_ads',
      channel_name: `${clientName} - Google Ads`,
      login: cleanedId,
      connection_status: 'pending',
      n8n_workflow_url: n8nWebhookUrl
    });
    createdCredentials.push({
      channel: 'google_ads',
      channelName: `${clientName} - Google Ads`,
      login: cleanedId
    });
    console.log(`Added Google Ads credential with ID: ${cleanedId}`);
  }
  
  // Meta Ads
  if (credentials.metaAdsAccountId?.trim()) {
    credentialRecords.push({
      client_id: clientId,
      channel: 'meta_ads',
      channel_name: `${clientName} - Meta Ads`,
      login: credentials.metaAdsAccountId.trim(),
      connection_status: 'pending',
      n8n_workflow_url: n8nWebhookUrl
    });
    createdCredentials.push({
      channel: 'meta_ads',
      channelName: `${clientName} - Meta Ads`,
      login: credentials.metaAdsAccountId.trim()
    });
    console.log(`Added Meta Ads credential with ID: ${credentials.metaAdsAccountId}`);
  }
  
  // RD Station
  if (credentials.rdStationApiToken?.trim()) {
    credentialRecords.push({
      client_id: clientId,
      channel: 'rdstation',
      channel_name: `${clientName} - RD Station`,
      password_encrypted: credentials.rdStationApiToken.trim(),
      connection_status: 'pending',
      n8n_workflow_url: n8nWebhookUrl
    });
    createdCredentials.push({
      channel: 'rdstation',
      channelName: `${clientName} - RD Station`
    });
    console.log(`Added RD Station credential`);
  }
  
  if (credentialRecords.length > 0) {
    const { error } = await supabaseAdmin
      .from('tryvia_analytics_client_credentials')
      .insert(credentialRecords);
    
    if (error) {
      console.error('Error creating credentials:', error);
      throw new Error(`Failed to create credentials: ${error.message}`);
    }
    
    console.log(`Successfully created ${credentialRecords.length} credentials for client ${clientId}`);
  } else {
    console.log(`No credentials provided for client ${clientId}`);
  }
  
  return createdCredentials;
}

/**
 * Dispara webhook para n8n notificando sobre novo cliente
 */
async function triggerN8nWebhook(
  webhookUrl: string,
  clientId: string,
  clientName: string,
  clientEmail: string,
  tablePrefix: string,
  credentials: { channel: string; channelName: string; login?: string }[]
): Promise<boolean> {
  console.log(`Triggering n8n webhook: ${webhookUrl}`);
  
  const payload = {
    event: 'client.created',
    timestamp: new Date().toISOString(),
    client: {
      id: clientId,
      name: clientName,
      email: clientEmail,
      tablePrefix: tablePrefix
    },
    credentials: credentials
  };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log(`Webhook triggered successfully, status: ${response.status}`);
      return true;
    } else {
      console.error(`Webhook failed with status: ${response.status}`);
      return false;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Webhook request timed out after 10 seconds');
    } else {
      console.error('Error triggering webhook:', error.message);
    }
    return false;
  }
}

/**
 * Cria todas as tabelas necessárias para um novo cliente
 */
async function createClientTables(
  supabaseAdmin: any,
  clientId: string,
  prefix: string,
  clientName: string
): Promise<void> {
  console.log(`Creating tables for client ${clientName} with prefix ${prefix}_`);
  
  // SQL para criar todas as tabelas do cliente
  const createTablesSql = `
    -- Google Ads - Métricas
    CREATE TABLE IF NOT EXISTS public.${prefix}_google_ad_metrics (
      id BIGSERIAL PRIMARY KEY,
      client_id UUID NOT NULL DEFAULT '${clientId}',
      date DATE NOT NULL,
      source TEXT NOT NULL DEFAULT 'google_ads',
      campaign_name TEXT,
      adset_name TEXT,
      ad_name TEXT,
      status TEXT DEFAULT 'ENABLED',
      cost NUMERIC DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      leads INTEGER DEFAULT 0,
      reach INTEGER DEFAULT 0,
      results INTEGER DEFAULT 0,
      result_type TEXT,
      revenue NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_google_keywords (
      id BIGSERIAL PRIMARY KEY,
      client_id UUID NOT NULL DEFAULT '${clientId}',
      date DATE NOT NULL,
      keyword TEXT NOT NULL,
      campaign_name TEXT,
      match_type TEXT,
      status TEXT DEFAULT 'active',
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      cost NUMERIC DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      quality_score INTEGER,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Meta Ads - Campanhas
    CREATE TABLE IF NOT EXISTS public.${prefix}_meta_campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      campaign_name TEXT,
      objective TEXT,
      status TEXT,
      effective_status TEXT,
      daily_budget NUMERIC,
      lifetime_budget NUMERIC,
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      spend NUMERIC DEFAULT 0,
      reach BIGINT DEFAULT 0,
      impressions BIGINT DEFAULT 0,
      results INTEGER DEFAULT 0,
      result_type TEXT,
      cost_per_result NUMERIC,
      conversions INTEGER DEFAULT 0,
      cost_per_conversion NUMERIC,
      leads INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      page_views INTEGER DEFAULT 0,
      created_time TIMESTAMPTZ,
      extracted_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_meta_adsets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      adset_id TEXT NOT NULL,
      adset_name TEXT,
      status TEXT,
      effective_status TEXT,
      billing_event TEXT,
      optimization_goal TEXT,
      daily_budget NUMERIC,
      lifetime_budget NUMERIC,
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      spend NUMERIC DEFAULT 0,
      reach BIGINT DEFAULT 0,
      impressions BIGINT DEFAULT 0,
      results INTEGER DEFAULT 0,
      result_type TEXT,
      cost_per_result NUMERIC,
      conversions INTEGER DEFAULT 0,
      cost_per_conversion NUMERIC,
      leads INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      page_views INTEGER DEFAULT 0,
      created_time TIMESTAMPTZ,
      extracted_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_meta_ads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      adset_id TEXT NOT NULL,
      ad_id TEXT NOT NULL,
      ad_name TEXT,
      creative_id TEXT,
      status TEXT,
      effective_status TEXT,
      thumbnail_url TEXT,
      image_url TEXT,
      video_id TEXT,
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      spend NUMERIC DEFAULT 0,
      reach BIGINT DEFAULT 0,
      impressions BIGINT DEFAULT 0,
      results INTEGER DEFAULT 0,
      result_type TEXT,
      cost_per_result NUMERIC,
      conversions INTEGER DEFAULT 0,
      cost_per_conversion NUMERIC,
      leads INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      page_views INTEGER DEFAULT 0,
      created_time TIMESTAMPTZ,
      extracted_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_meta_campaigns_breakdowns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      campaign_name TEXT,
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      age TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      publisher_platform TEXT DEFAULT '',
      platform_position TEXT DEFAULT '',
      region TEXT DEFAULT '',
      spend NUMERIC DEFAULT 0,
      reach BIGINT DEFAULT 0,
      impressions BIGINT DEFAULT 0,
      results INTEGER DEFAULT 0,
      cost_per_result NUMERIC,
      conversions INTEGER DEFAULT 0,
      cost_per_conversion NUMERIC,
      extracted_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_meta_adsets_breakdowns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      adset_id TEXT NOT NULL,
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      age TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      publisher_platform TEXT DEFAULT '',
      platform_position TEXT DEFAULT '',
      region TEXT DEFAULT '',
      spend NUMERIC DEFAULT 0,
      reach BIGINT DEFAULT 0,
      impressions BIGINT DEFAULT 0,
      results INTEGER DEFAULT 0,
      cost_per_result NUMERIC,
      conversions INTEGER DEFAULT 0,
      cost_per_conversion NUMERIC,
      extracted_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_meta_ads_breakdowns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id TEXT NOT NULL,
      campaign_id TEXT NOT NULL,
      adset_id TEXT NOT NULL,
      ad_id TEXT NOT NULL,
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      age TEXT DEFAULT '',
      gender TEXT DEFAULT '',
      publisher_platform TEXT DEFAULT '',
      platform_position TEXT DEFAULT '',
      region TEXT DEFAULT '',
      spend NUMERIC DEFAULT 0,
      reach BIGINT DEFAULT 0,
      impressions BIGINT DEFAULT 0,
      results INTEGER DEFAULT 0,
      cost_per_result NUMERIC,
      conversions INTEGER DEFAULT 0,
      cost_per_conversion NUMERIC,
      extracted_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_meta_campaigns_regions (
      id BIGSERIAL PRIMARY KEY,
      account_id TEXT,
      campaign_id TEXT NOT NULL,
      campaign_name TEXT,
      region TEXT,
      date_start DATE,
      date_end DATE,
      spend NUMERIC DEFAULT 0,
      reach INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      leads INTEGER DEFAULT 0,
      messages INTEGER DEFAULT 0,
      page_views INTEGER DEFAULT 0,
      results INTEGER DEFAULT 0,
      cost_per_result NUMERIC DEFAULT 0,
      extracted_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_meta_sync_control (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id TEXT NOT NULL,
      last_sync_date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- RD Station
    CREATE TABLE IF NOT EXISTS public.${prefix}_rdstation_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      period TEXT NOT NULL,
      period_start DATE,
      period_end DATE,
      total_leads INTEGER,
      source TEXT DEFAULT 'rdstation',
      segmentation_id INTEGER,
      segmentation_name TEXT,
      synced_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(period, segmentation_id)
    );

    -- RD Station Leads (individual lead records)
    CREATE TABLE IF NOT EXISTS public.${prefix}_rdstation_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL DEFAULT '${clientId}',
      rd_lead_id VARCHAR(100),
      name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      company VARCHAR(255),
      job_title VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(50),
      country VARCHAR(50) DEFAULT 'Brasil',
      conversion_source VARCHAR(100),
      conversion_medium VARCHAR(100),
      conversion_campaign VARCHAR(255),
      conversion_content VARCHAR(255),
      conversion_term VARCHAR(255),
      first_conversion_event VARCHAR(255),
      first_conversion_url TEXT,
      tags JSONB DEFAULT '[]',
      custom_fields JSONB DEFAULT '{}',
      lifecycle_stage VARCHAR(50),
      lead_scoring INTEGER,
      rd_created_at TIMESTAMPTZ,
      rd_updated_at TIMESTAMPTZ,
      synced_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_${prefix}_rdleads_date ON public.${prefix}_rdstation_leads(rd_created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_${prefix}_rdleads_source ON public.${prefix}_rdstation_leads(conversion_source);
    CREATE INDEX IF NOT EXISTS idx_${prefix}_rdleads_campaign ON public.${prefix}_rdstation_leads(conversion_campaign);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_${prefix}_rdleads_unique ON public.${prefix}_rdstation_leads(rd_lead_id) WHERE rd_lead_id IS NOT NULL;

    -- CRM / Moskit (Eduzz tables removed - only mo_ client uses Eduzz)
    CREATE TABLE IF NOT EXISTS public.${prefix}_crm_deals (
      id BIGSERIAL PRIMARY KEY,
      client_id UUID NOT NULL DEFAULT '${clientId}',
      deal_id BIGINT NOT NULL,
      deal_name TEXT,
      pipeline_id BIGINT,
      pipeline_name TEXT,
      stage_id BIGINT,
      stage_name TEXT,
      status TEXT,
      price NUMERIC DEFAULT 0,
      date_created DATE,
      date_closed DATE,
      responsible_id BIGINT,
      lost_reason_id BIGINT,
      lost_reason_name TEXT,
      origin TEXT,
      source TEXT,
      contacts_created_same_day INTEGER DEFAULT 0,
      extracted_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.${prefix}_crm_metrics (
      id BIGSERIAL PRIMARY KEY,
      client_id UUID NOT NULL DEFAULT '${clientId}',
      date DATE NOT NULL,
      source TEXT NOT NULL,
      leads INTEGER DEFAULT 0,
      opportunities INTEGER DEFAULT 0,
      sales INTEGER DEFAULT 0,
      revenue NUMERIC DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS on all tables
    ALTER TABLE public.${prefix}_google_ad_metrics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_google_keywords ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_meta_campaigns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_meta_adsets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_meta_ads ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_meta_campaigns_breakdowns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_meta_adsets_breakdowns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_meta_ads_breakdowns ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_meta_campaigns_regions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_meta_sync_control ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_rdstation_metrics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_rdstation_leads ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_crm_deals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.${prefix}_crm_metrics ENABLE ROW LEVEL SECURITY;

    -- Create access function for this client
    CREATE OR REPLACE FUNCTION public.has_${prefix}_client_access(_user_id uuid)
    RETURNS boolean
    LANGUAGE sql
    STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.tryvia_analytics_profiles p
        JOIN public.tryvia_analytics_clients c ON p.client_id = c.id
        WHERE p.id = _user_id AND c.id = '${clientId}'::uuid
      )
      OR public.has_analytics_role(_user_id, 'admin')
    $$;

    -- Create RLS policies for all tables
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_google_ad_metrics FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_google_keywords FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_meta_campaigns FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_meta_adsets FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_meta_ads FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_meta_campaigns_breakdowns FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_meta_adsets_breakdowns FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_meta_ads_breakdowns FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_meta_campaigns_regions FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_meta_sync_control FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_rdstation_metrics FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_rdstation_leads_select" ON public.%s_rdstation_leads FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_rdstation_leads_insert" ON public.%s_rdstation_leads FOR INSERT WITH CHECK (true)', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_rdstation_leads_update" ON public.%s_rdstation_leads FOR UPDATE USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_crm_deals FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    
    DO $$ BEGIN
      EXECUTE format('CREATE POLICY "%s_data_access" ON public.%s_crm_metrics FOR SELECT USING (has_%s_client_access(auth.uid()))', '${prefix}', '${prefix}', '${prefix}');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `;
  
  // Execute table creation via raw SQL
  console.log(`Executing SQL to create ${prefix}_ tables...`);
  
  const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', { sql: createTablesSql });
  
  if (sqlError) {
    console.error("Error creating tables via RPC:", sqlError);
    throw new Error(`Failed to create tables: ${sqlError.message}`);
  }
  
  console.log(`Successfully created all tables with prefix: ${prefix}_`);
}

/**
 * Registra todas as tabelas do cliente no registry
 */
async function registerClientTables(
  supabaseAdmin: any,
  clientId: string,
  prefix: string
): Promise<void> {
  console.log(`Registering tables for client ${clientId} with prefix ${prefix}_`);
  
  const tableRegistrations = [
    // Google Ads
    { channel: 'google_ads', table_type: 'ad_metrics', table_name: `${prefix}_google_ad_metrics` },
    { channel: 'google_ads', table_type: 'keywords', table_name: `${prefix}_google_keywords` },
    // Meta Ads
    { channel: 'meta_ads', table_type: 'campaigns', table_name: `${prefix}_meta_campaigns` },
    { channel: 'meta_ads', table_type: 'adsets', table_name: `${prefix}_meta_adsets` },
    { channel: 'meta_ads', table_type: 'ads', table_name: `${prefix}_meta_ads` },
    { channel: 'meta_ads', table_type: 'campaigns_breakdowns', table_name: `${prefix}_meta_campaigns_breakdowns` },
    { channel: 'meta_ads', table_type: 'adsets_breakdowns', table_name: `${prefix}_meta_adsets_breakdowns` },
    { channel: 'meta_ads', table_type: 'ads_breakdowns', table_name: `${prefix}_meta_ads_breakdowns` },
    { channel: 'meta_ads', table_type: 'campaigns_regions', table_name: `${prefix}_meta_campaigns_regions` },
    { channel: 'meta_ads', table_type: 'sync_control', table_name: `${prefix}_meta_sync_control` },
    // RD Station
    { channel: 'rdstation', table_type: 'rd_metrics', table_name: `${prefix}_rdstation_metrics` },
    { channel: 'rdstation', table_type: 'leads', table_name: `${prefix}_rdstation_leads` },
    // CRM / Moskit (Eduzz tables removed - only mo_ client uses Eduzz)
    { channel: 'moskit', table_type: 'deals', table_name: `${prefix}_crm_deals` },
    { channel: 'moskit', table_type: 'metrics', table_name: `${prefix}_crm_metrics` },
  ];
  
  for (const reg of tableRegistrations) {
    const { error } = await supabaseAdmin
      .from('client_table_registry')
      .insert({
        client_id: clientId,
        channel: reg.channel,
        table_type: reg.table_type,
        table_name: reg.table_name,
      });
    
    if (error && !error.message?.includes('duplicate')) {
      console.error(`Error registering table ${reg.table_name}:`, error);
    }
  }
  
  console.log(`Registered ${tableRegistrations.length} tables for client ${clientId}`);
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { 
      name, 
      email, 
      whatsapp_number, 
      company_name, 
      contact_name, 
      address, 
      city, 
      state,
      credentials 
    } = await req.json();

    console.log("Creating client with user:", { name, email, hasCredentials: !!credentials });

    // Validate required fields
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Nome e email são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate table prefix from client name
    const tablePrefix = generateTablePrefix(name);
    console.log(`Generated table prefix: ${tablePrefix}`);

    // 1. Create the client record
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from("tryvia_analytics_clients")
      .insert({
        name,
        email,
        whatsapp_number: whatsapp_number || null,
        company_name: company_name || null,
        contact_name: contact_name || null,
        address: address || null,
        city: city || null,
        state: state || null,
      })
      .select()
      .single();

    if (clientError) {
      console.error("Error creating client:", clientError);
      return new Response(
        JSON.stringify({ error: clientError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientId = clientData.id;
    console.log("Client created with ID:", clientId);

    // 2. Register table mappings in client_table_registry
    await registerClientTables(supabaseAdmin, clientId, tablePrefix);

    // 2.1 Create physical tables with RLS
    try {
      await createClientTables(supabaseAdmin, clientId, tablePrefix, name);
      console.log(`Physical tables created successfully for client ${name} with prefix ${tablePrefix}_`);
    } catch (tableError: any) {
      console.error("Error creating physical tables:", tableError);
      // Rollback: delete client and registry entries
      await supabaseAdmin.from("tryvia_analytics_clients").delete().eq("id", clientId);
      await supabaseAdmin.from("client_table_registry").delete().eq("client_id", clientId);
      return new Response(
        JSON.stringify({ error: `Erro ao criar tabelas físicas: ${tableError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Create credentials if provided
    let createdCredentials: { channel: string; channelName: string; login?: string }[] = [];
    if (credentials) {
      try {
        createdCredentials = await createClientCredentials(supabaseAdmin, clientId, name, credentials);
      } catch (credError: any) {
        console.error("Error creating credentials (non-fatal):", credError);
        // Don't fail the entire operation if credentials fail
      }
    }

    // 4. Check if user already exists or send invitation
    let userId: string;
    let isExistingUser = false;
    
    // First, try to get the user by email
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);
    
    if (existingUser) {
      // User already exists, use their ID
      userId = existingUser.id;
      isExistingUser = true;
      console.log("User already exists with ID:", userId);
      
      // Check if user already has a profile with this client
      const { data: existingProfile } = await supabaseAdmin
        .from("tryvia_analytics_profiles")
        .select("id")
        .eq("id", userId)
        .eq("client_id", clientId)
        .maybeSingle();
        
      if (existingProfile) {
        console.log("User already associated with this client");
      }
    } else {
      // Send invitation email to new user
      // Profile and role will be created by database trigger when user accepts invite
      const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          client_id: clientId,
          role: "user",
          whatsapp: whatsapp_number || null,
        },
      });

      if (inviteError) {
        console.error("Error inviting user:", inviteError);
        // Rollback: delete the client if user invitation fails
        await supabaseAdmin.from("tryvia_analytics_clients").delete().eq("id", clientId);
        await supabaseAdmin.from("client_table_registry").delete().eq("client_id", clientId);
        await supabaseAdmin.from("tryvia_analytics_client_credentials").delete().eq("client_id", clientId);
        return new Response(
          JSON.stringify({ error: `Erro ao enviar convite: ${inviteError.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      userId = authData.user.id;
      console.log("User invited with ID:", userId, ". Profile and role will be created when user accepts invite.");
    }

    // Note: Profile and role are now created by the database trigger on_analytics_user_created
    // when the user accepts the invitation and completes signup.
    // For existing users, we need to update their profile to link them to this client
    if (isExistingUser) {
      const { error: profileError } = await supabaseAdmin
        .from("tryvia_analytics_profiles")
        .upsert({
          id: userId,
          email,
          client_id: clientId,
          whatsapp: whatsapp_number || null,
          password_hash: "managed_by_auth",
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("Error updating existing user profile:", profileError);
      }
    }

    // Count credentials created
    const credentialsCount = createdCredentials.length;

    // 7. Trigger n8n webhook if configured
    let webhookNotified = false;
    if (credentials?.n8nWebhookUrl?.trim()) {
      webhookNotified = await triggerN8nWebhook(
        credentials.n8nWebhookUrl.trim(),
        clientId,
        name,
        email,
        tablePrefix,
        createdCredentials
      );
    }

    console.log("Client and user created/linked successfully");

    return new Response(
      JSON.stringify({
        client: clientData,
        userId,
        tablePrefix,
        isExistingUser,
        credentialsCreated: credentialsCount,
        webhookNotified,
        message: isExistingUser 
          ? `Cliente criado com sucesso. Tabelas registradas com prefixo '${tablePrefix}_'. ${credentialsCount} credenciais configuradas. Usuário existente foi associado ao novo cliente.`
          : `Cliente criado com sucesso. Tabelas registradas com prefixo '${tablePrefix}_'. ${credentialsCount} credenciais configuradas. Convite enviado por email.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in create-client-with-user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
