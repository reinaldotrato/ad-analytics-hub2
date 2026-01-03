-- =====================================================
-- FASE 1: Criar tabelas para o cliente LORPEN (prefixo lo_)
-- =====================================================

-- Google Ads - Métricas de anúncios
CREATE TABLE IF NOT EXISTS public.lo_google_ad_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT '52502e4e-3e10-4e54-a123-80adf45f4c91',
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

-- Google Ads - Keywords
CREATE TABLE IF NOT EXISTS public.lo_google_keywords (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT '52502e4e-3e10-4e54-a123-80adf45f4c91',
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
CREATE TABLE IF NOT EXISTS public.lo_meta_campaigns (
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

-- Meta Ads - Conjuntos de anúncios
CREATE TABLE IF NOT EXISTS public.lo_meta_adsets (
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

-- Meta Ads - Anúncios
CREATE TABLE IF NOT EXISTS public.lo_meta_ads (
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

-- Meta Ads - Breakdowns de campanhas
CREATE TABLE IF NOT EXISTS public.lo_meta_campaigns_breakdowns (
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

-- Meta Ads - Breakdowns de adsets
CREATE TABLE IF NOT EXISTS public.lo_meta_adsets_breakdowns (
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

-- Meta Ads - Breakdowns de ads
CREATE TABLE IF NOT EXISTS public.lo_meta_ads_breakdowns (
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

-- Meta Ads - Regiões de campanhas
CREATE TABLE IF NOT EXISTS public.lo_meta_campaigns_regions (
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

-- Meta Ads - Sync control
CREATE TABLE IF NOT EXISTS public.lo_meta_sync_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  last_sync_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RD Station - Métricas
CREATE TABLE IF NOT EXISTS public.lo_rdstation_metrics (
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

-- Eduzz - Invoices
CREATE TABLE IF NOT EXISTS public.lo_eduzz_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT,
  status TEXT NOT NULL,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  product_id TEXT,
  product_name TEXT,
  product_type TEXT,
  valor_item NUMERIC,
  ganho NUMERIC,
  parcelas INTEGER DEFAULT 1,
  event_type TEXT,
  utm_campaign TEXT,
  is_abandonment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ DEFAULT now(),
  raw_data JSONB,
  UNIQUE(invoice_id)
);

-- Eduzz - Métricas por produto
CREATE TABLE IF NOT EXISTS public.lo_eduzz_metrics_by_product (
  product_id TEXT,
  product_name TEXT,
  product_type TEXT,
  total_vendas BIGINT,
  total_tentativas BIGINT,
  receita_bruta NUMERIC,
  receita_liquida NUMERIC,
  taxa_conversao NUMERIC
);

-- Eduzz - Métricas diárias
CREATE TABLE IF NOT EXISTS public.lo_eduzz_metrics_daily (
  date DATE,
  vendas BIGINT,
  tentativas BIGINT,
  abandonos BIGINT,
  valor_total_bruto NUMERIC,
  valor_total_liquido NUMERIC,
  taxa_conversao NUMERIC
);

-- Eduzz - Resumo do dashboard
CREATE TABLE IF NOT EXISTS public.lo_dashboard_summary (
  leads_rd_station INTEGER,
  rd_period TEXT,
  funil_leads INTEGER,
  funil_oportunidades BIGINT,
  funil_vendas BIGINT,
  eduzz_receita_bruta NUMERIC,
  eduzz_receita_liquida NUMERIC,
  eduzz_vendas BIGINT,
  eduzz_tentativas BIGINT,
  taxa_lead_to_checkout NUMERIC,
  taxa_checkout_to_sale NUMERIC,
  taxa_lead_to_sale NUMERIC,
  last_updated TIMESTAMPTZ
);

-- CRM - Deals do Moskit
CREATE TABLE IF NOT EXISTS public.lo_crm_deals (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT '52502e4e-3e10-4e54-a123-80adf45f4c91',
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

-- CRM - Métricas
CREATE TABLE IF NOT EXISTS public.lo_crm_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT '52502e4e-3e10-4e54-a123-80adf45f4c91',
  date DATE NOT NULL,
  source TEXT NOT NULL,
  leads INTEGER DEFAULT 0,
  opportunities INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FASE 2: Habilitar RLS em todas as tabelas
-- =====================================================

ALTER TABLE public.lo_google_ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_google_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_meta_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_meta_campaigns_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_meta_adsets_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_meta_ads_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_meta_campaigns_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_meta_sync_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_rdstation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_eduzz_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_eduzz_metrics_by_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_eduzz_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_dashboard_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lo_crm_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FASE 3: Criar função para verificar acesso do cliente Lorpen
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_lo_client_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_profiles p
    JOIN public.tryvia_analytics_clients c ON p.client_id = c.id
    WHERE p.id = _user_id AND c.name = 'Lorpen'
  )
  OR public.has_analytics_role(_user_id, 'admin')
$$;

-- =====================================================
-- FASE 4: Criar RLS policies para todas as tabelas
-- =====================================================

CREATE POLICY "LO data access" ON public.lo_google_ad_metrics FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_google_keywords FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_meta_campaigns FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_meta_adsets FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_meta_ads FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_meta_campaigns_breakdowns FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_meta_adsets_breakdowns FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_meta_ads_breakdowns FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_meta_campaigns_regions FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_meta_sync_control FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_rdstation_metrics FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_eduzz_invoices FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_eduzz_metrics_by_product FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_eduzz_metrics_daily FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_dashboard_summary FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_crm_deals FOR SELECT USING (has_lo_client_access(auth.uid()));
CREATE POLICY "LO data access" ON public.lo_crm_metrics FOR SELECT USING (has_lo_client_access(auth.uid()));

-- =====================================================
-- FASE 5: Registrar tabelas no client_table_registry para LORPEN
-- =====================================================

INSERT INTO public.client_table_registry (client_id, channel, table_type, table_name) VALUES
  -- Google Ads
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'google_ads', 'ad_metrics', 'lo_google_ad_metrics'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'google_ads', 'keywords', 'lo_google_keywords'),
  -- Meta Ads
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'meta_ads', 'campaigns', 'lo_meta_campaigns'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'meta_ads', 'adsets', 'lo_meta_adsets'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'meta_ads', 'ads', 'lo_meta_ads'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'meta_ads', 'campaigns_breakdowns', 'lo_meta_campaigns_breakdowns'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'meta_ads', 'adsets_breakdowns', 'lo_meta_adsets_breakdowns'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'meta_ads', 'ads_breakdowns', 'lo_meta_ads_breakdowns'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'meta_ads', 'campaigns_regions', 'lo_meta_campaigns_regions'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'meta_ads', 'sync_control', 'lo_meta_sync_control'),
  -- RD Station
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'rdstation', 'rd_metrics', 'lo_rdstation_metrics'),
  -- Eduzz
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'eduzz', 'invoices', 'lo_eduzz_invoices'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'eduzz', 'metrics_by_product', 'lo_eduzz_metrics_by_product'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'eduzz', 'metrics_daily', 'lo_eduzz_metrics_daily'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'eduzz', 'dashboard_summary', 'lo_dashboard_summary'),
  -- CRM / Moskit
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'moskit', 'deals', 'lo_crm_deals'),
  ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'moskit', 'metrics', 'lo_crm_metrics')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FASE 6: Registrar tabelas existentes para MENINA OFICINA
-- =====================================================

INSERT INTO public.client_table_registry (client_id, channel, table_type, table_name) VALUES
  -- Google Ads
  ('11111111-1111-1111-1111-111111111111', 'google_ads', 'ad_metrics', 'mo_google_ad_metrics'),
  ('11111111-1111-1111-1111-111111111111', 'google_ads', 'keywords', 'mo_google_keywords'),
  -- Meta Ads
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'campaigns', 'mo_meta_campaigns'),
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'adsets', 'mo_meta_adsets'),
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'ads', 'mo_meta_ads'),
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'campaigns_breakdowns', 'mo_meta_campaigns_breakdowns'),
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'adsets_breakdowns', 'mo_meta_adsets_breakdowns'),
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'ads_breakdowns', 'mo_meta_ads_breakdowns'),
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'campaigns_regions', 'mo_meta_campaigns_regions'),
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'sync_control', 'mo_meta_sync_control'),
  -- RD Station
  ('11111111-1111-1111-1111-111111111111', 'rdstation', 'rd_metrics', 'mo_rdstation_metrics'),
  -- Eduzz
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'invoices', 'mo_eduzz_invoices'),
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'metrics_by_product', 'mo_eduzz_metrics_by_product'),
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'metrics_daily', 'mo_eduzz_metrics_daily'),
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'dashboard_summary', 'mo_dashboard_summary'),
  -- CRM / Moskit
  ('11111111-1111-1111-1111-111111111111', 'moskit', 'deals', 'mo_crm_deals'),
  ('11111111-1111-1111-1111-111111111111', 'moskit', 'metrics', 'mo_crm_metrics')
ON CONFLICT DO NOTHING;