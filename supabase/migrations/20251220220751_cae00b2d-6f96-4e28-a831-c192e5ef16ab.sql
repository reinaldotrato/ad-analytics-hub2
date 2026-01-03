-- Criar todas as tabelas ac_ para o cliente ACCEB (9ef28fd8-7393-408f-937b-31bfaefc7afa)

-- Google Ads - Métricas
CREATE TABLE IF NOT EXISTS public.ac_google_ad_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT '9ef28fd8-7393-408f-937b-31bfaefc7afa',
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

CREATE TABLE IF NOT EXISTS public.ac_google_keywords (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT '9ef28fd8-7393-408f-937b-31bfaefc7afa',
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
CREATE TABLE IF NOT EXISTS public.ac_meta_campaigns (
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

CREATE TABLE IF NOT EXISTS public.ac_meta_adsets (
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

CREATE TABLE IF NOT EXISTS public.ac_meta_ads (
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

CREATE TABLE IF NOT EXISTS public.ac_meta_campaigns_breakdowns (
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

CREATE TABLE IF NOT EXISTS public.ac_meta_adsets_breakdowns (
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

CREATE TABLE IF NOT EXISTS public.ac_meta_ads_breakdowns (
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

CREATE TABLE IF NOT EXISTS public.ac_meta_campaigns_regions (
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

CREATE TABLE IF NOT EXISTS public.ac_meta_sync_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  last_sync_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RD Station
CREATE TABLE IF NOT EXISTS public.ac_rdstation_metrics (
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

-- Eduzz
CREATE TABLE IF NOT EXISTS public.ac_eduzz_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT UNIQUE,
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
  raw_data JSONB
);

CREATE TABLE IF NOT EXISTS public.ac_eduzz_metrics_by_product (
  product_id TEXT,
  product_name TEXT,
  product_type TEXT,
  total_vendas BIGINT,
  total_tentativas BIGINT,
  receita_bruta NUMERIC,
  receita_liquida NUMERIC,
  taxa_conversao NUMERIC
);

CREATE TABLE IF NOT EXISTS public.ac_eduzz_metrics_daily (
  date DATE,
  vendas BIGINT,
  tentativas BIGINT,
  abandonos BIGINT,
  valor_total_bruto NUMERIC,
  valor_total_liquido NUMERIC,
  taxa_conversao NUMERIC
);

CREATE TABLE IF NOT EXISTS public.ac_dashboard_summary (
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

-- CRM / Moskit
CREATE TABLE IF NOT EXISTS public.ac_crm_deals (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT '9ef28fd8-7393-408f-937b-31bfaefc7afa',
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

CREATE TABLE IF NOT EXISTS public.ac_crm_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL DEFAULT '9ef28fd8-7393-408f-937b-31bfaefc7afa',
  date DATE NOT NULL,
  source TEXT NOT NULL,
  leads INTEGER DEFAULT 0,
  opportunities INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ac_google_ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_google_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_meta_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_meta_campaigns_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_meta_adsets_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_meta_ads_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_meta_campaigns_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_meta_sync_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_rdstation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_eduzz_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_eduzz_metrics_by_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_eduzz_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_dashboard_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ac_crm_metrics ENABLE ROW LEVEL SECURITY;

-- Create access function for ACCEB client
CREATE OR REPLACE FUNCTION public.has_ac_client_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_profiles p
    JOIN public.tryvia_analytics_clients c ON p.client_id = c.id
    WHERE p.id = _user_id AND c.id = '9ef28fd8-7393-408f-937b-31bfaefc7afa'::uuid
  )
  OR public.has_analytics_role(_user_id, 'admin')
$$;

-- Create RLS policies for all ac_ tables
CREATE POLICY "ac_data_access" ON public.ac_google_ad_metrics FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_google_keywords FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_meta_campaigns FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_meta_adsets FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_meta_ads FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_meta_campaigns_breakdowns FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_meta_adsets_breakdowns FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_meta_ads_breakdowns FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_meta_campaigns_regions FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_meta_sync_control FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_rdstation_metrics FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_eduzz_invoices FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_eduzz_metrics_by_product FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_eduzz_metrics_daily FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_dashboard_summary FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_crm_deals FOR SELECT USING (has_ac_client_access(auth.uid()));
CREATE POLICY "ac_data_access" ON public.ac_crm_metrics FOR SELECT USING (has_ac_client_access(auth.uid()));