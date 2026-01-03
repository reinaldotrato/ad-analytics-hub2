-- ============================================
-- FASE 1: CRIAR CLIENTE DEMO E INFRAESTRUTURA
-- ============================================

-- 1.1 Criar cliente demo (UUID válido)
INSERT INTO tryvia_analytics_clients (id, name, email, company_name, contact_name, city, state)
VALUES (
  'de000000-0000-4000-a000-000000000001',
  'Demo Company',
  'demo@tryvia.com.br',
  'Empresa Demonstração Ltda',
  'Usuário Demo',
  'São Paulo',
  'SP'
) ON CONFLICT (id) DO NOTHING;

-- 1.2 Criar função RLS para acesso demo
CREATE OR REPLACE FUNCTION public.has_dm_client_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    -- Apenas admins têm acesso aos dados demo
    public.has_analytics_role(_user_id, 'admin')
$$;

-- 1.3 Criar todas as tabelas com prefixo dm_
-- Google Ads - Métricas
CREATE TABLE IF NOT EXISTS public.dm_google_ad_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT 'de000000-0000-4000-a000-000000000001',
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

CREATE TABLE IF NOT EXISTS public.dm_google_keywords (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT 'de000000-0000-4000-a000-000000000001',
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
CREATE TABLE IF NOT EXISTS public.dm_meta_campaigns (
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

CREATE TABLE IF NOT EXISTS public.dm_meta_adsets (
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

CREATE TABLE IF NOT EXISTS public.dm_meta_ads (
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

CREATE TABLE IF NOT EXISTS public.dm_meta_campaigns_breakdowns (
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

CREATE TABLE IF NOT EXISTS public.dm_meta_adsets_breakdowns (
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

CREATE TABLE IF NOT EXISTS public.dm_meta_ads_breakdowns (
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

CREATE TABLE IF NOT EXISTS public.dm_meta_campaigns_regions (
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

CREATE TABLE IF NOT EXISTS public.dm_meta_sync_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  last_sync_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RD Station
CREATE TABLE IF NOT EXISTS public.dm_rdstation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  total_leads INTEGER,
  source TEXT DEFAULT 'rdstation',
  segmentation_id INTEGER,
  segmentation_name TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dm_rdstation_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL DEFAULT 'de000000-0000-4000-a000-000000000001',
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

-- CRM
CREATE TABLE IF NOT EXISTS public.dm_crm_deals (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT 'de000000-0000-4000-a000-000000000001',
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

CREATE TABLE IF NOT EXISTS public.dm_crm_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT 'de000000-0000-4000-a000-000000000001',
  date DATE NOT NULL,
  source TEXT NOT NULL,
  leads INTEGER DEFAULT 0,
  opportunities INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dm_dashboard_summary (
  leads_rd_station INTEGER,
  funil_leads INTEGER,
  funil_oportunidades BIGINT,
  funil_vendas BIGINT,
  taxa_lead_to_checkout NUMERIC,
  taxa_checkout_to_sale NUMERIC,
  taxa_lead_to_sale NUMERIC,
  eduzz_receita_bruta NUMERIC,
  eduzz_receita_liquida NUMERIC,
  eduzz_vendas BIGINT,
  eduzz_tentativas BIGINT,
  rd_period TEXT,
  last_updated TIMESTAMPTZ
);

-- Enable RLS on all dm_ tables
ALTER TABLE public.dm_google_ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_google_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_meta_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_meta_campaigns_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_meta_adsets_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_meta_ads_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_meta_campaigns_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_meta_sync_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_rdstation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_rdstation_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_crm_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_dashboard_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all dm_ tables
CREATE POLICY "dm_data_access" ON public.dm_google_ad_metrics FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_google_keywords FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_meta_campaigns FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_meta_adsets FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_meta_ads FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_meta_campaigns_breakdowns FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_meta_adsets_breakdowns FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_meta_ads_breakdowns FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_meta_campaigns_regions FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_meta_sync_control FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_rdstation_metrics FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_rdstation_leads FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_crm_deals FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_crm_metrics FOR SELECT USING (has_dm_client_access(auth.uid()));
CREATE POLICY "dm_data_access" ON public.dm_dashboard_summary FOR SELECT USING (has_dm_client_access(auth.uid()));

-- Register tables in client_table_registry
INSERT INTO client_table_registry (client_id, channel, table_type, table_name) VALUES
  ('de000000-0000-4000-a000-000000000001', 'google_ads', 'ad_metrics', 'dm_google_ad_metrics'),
  ('de000000-0000-4000-a000-000000000001', 'google_ads', 'keywords', 'dm_google_keywords'),
  ('de000000-0000-4000-a000-000000000001', 'meta_ads', 'campaigns', 'dm_meta_campaigns'),
  ('de000000-0000-4000-a000-000000000001', 'meta_ads', 'adsets', 'dm_meta_adsets'),
  ('de000000-0000-4000-a000-000000000001', 'meta_ads', 'ads', 'dm_meta_ads'),
  ('de000000-0000-4000-a000-000000000001', 'meta_ads', 'campaigns_breakdowns', 'dm_meta_campaigns_breakdowns'),
  ('de000000-0000-4000-a000-000000000001', 'meta_ads', 'adsets_breakdowns', 'dm_meta_adsets_breakdowns'),
  ('de000000-0000-4000-a000-000000000001', 'meta_ads', 'ads_breakdowns', 'dm_meta_ads_breakdowns'),
  ('de000000-0000-4000-a000-000000000001', 'meta_ads', 'campaigns_regions', 'dm_meta_campaigns_regions'),
  ('de000000-0000-4000-a000-000000000001', 'meta_ads', 'sync_control', 'dm_meta_sync_control'),
  ('de000000-0000-4000-a000-000000000001', 'rdstation', 'metrics', 'dm_rdstation_metrics'),
  ('de000000-0000-4000-a000-000000000001', 'rdstation', 'leads', 'dm_rdstation_leads'),
  ('de000000-0000-4000-a000-000000000001', 'crm', 'deals', 'dm_crm_deals'),
  ('de000000-0000-4000-a000-000000000001', 'crm', 'metrics', 'dm_crm_metrics'),
  ('de000000-0000-4000-a000-000000000001', 'dashboard', 'summary', 'dm_dashboard_summary')
ON CONFLICT DO NOTHING;