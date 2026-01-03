-- =====================================================
-- Create physical tables for client "Tryvia" (prefix: tr_)
-- =====================================================

-- Create access function for Tryvia client
CREATE OR REPLACE FUNCTION public.has_tr_client_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_profiles p
    JOIN public.tryvia_analytics_clients c ON p.client_id = c.id
    WHERE p.id = _user_id AND c.name = 'Tryvia'
  )
  OR public.has_analytics_role(_user_id, 'admin')
$$;

-- =====================================================
-- Google Ads tables
-- =====================================================

-- tr_google_ad_metrics
CREATE TABLE IF NOT EXISTS public.tr_google_ad_metrics (
  id SERIAL PRIMARY KEY,
  client_id UUID DEFAULT 'b8fb2ee4-069f-4cfc-b226-cc665cf50df2'::uuid,
  date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'google_ads',
  campaign_name VARCHAR(255),
  adset_name VARCHAR(255),
  ad_name VARCHAR(255),
  impressions INTEGER,
  clicks INTEGER,
  cost DECIMAL(12,2),
  conversions INTEGER,
  revenue DECIMAL(12,2),
  leads INTEGER,
  reach INTEGER,
  results INTEGER,
  result_type VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_google_ad_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_google_ad_metrics_access" ON public.tr_google_ad_metrics;
CREATE POLICY "tr_google_ad_metrics_access" ON public.tr_google_ad_metrics
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_google_keywords
CREATE TABLE IF NOT EXISTS public.tr_google_keywords (
  id SERIAL PRIMARY KEY,
  client_id UUID DEFAULT 'b8fb2ee4-069f-4cfc-b226-cc665cf50df2'::uuid,
  date DATE NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  campaign_name VARCHAR(255),
  impressions INTEGER,
  clicks INTEGER,
  cost DECIMAL(12,2),
  conversions INTEGER,
  match_type VARCHAR(50),
  quality_score INTEGER,
  status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_google_keywords ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_google_keywords_access" ON public.tr_google_keywords;
CREATE POLICY "tr_google_keywords_access" ON public.tr_google_keywords
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- =====================================================
-- Meta Ads tables
-- =====================================================

-- tr_meta_campaigns
CREATE TABLE IF NOT EXISTS public.tr_meta_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL,
  campaign_id VARCHAR(100) NOT NULL,
  campaign_name VARCHAR(255),
  objective VARCHAR(100),
  status VARCHAR(50),
  effective_status VARCHAR(50),
  daily_budget DECIMAL(12,2),
  lifetime_budget DECIMAL(12,2),
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  impressions INTEGER,
  reach INTEGER,
  results INTEGER,
  result_type VARCHAR(100),
  leads INTEGER,
  messages INTEGER,
  page_views INTEGER,
  conversions INTEGER,
  spend DECIMAL(12,2),
  cost_per_result DECIMAL(12,4),
  cost_per_conversion DECIMAL(12,4),
  created_time TIMESTAMPTZ,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_meta_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_meta_campaigns_access" ON public.tr_meta_campaigns;
CREATE POLICY "tr_meta_campaigns_access" ON public.tr_meta_campaigns
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_meta_campaigns_breakdowns
CREATE TABLE IF NOT EXISTS public.tr_meta_campaigns_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL,
  campaign_id VARCHAR(100) NOT NULL,
  campaign_name VARCHAR(255),
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  age VARCHAR(20),
  gender VARCHAR(20),
  region VARCHAR(100),
  publisher_platform VARCHAR(50),
  platform_position VARCHAR(100),
  impressions INTEGER,
  reach INTEGER,
  results INTEGER,
  conversions INTEGER,
  spend DECIMAL(12,2),
  cost_per_result DECIMAL(12,4),
  cost_per_conversion DECIMAL(12,4),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_meta_campaigns_breakdowns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_meta_campaigns_breakdowns_access" ON public.tr_meta_campaigns_breakdowns;
CREATE POLICY "tr_meta_campaigns_breakdowns_access" ON public.tr_meta_campaigns_breakdowns
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_meta_adsets
CREATE TABLE IF NOT EXISTS public.tr_meta_adsets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL,
  campaign_id VARCHAR(100) NOT NULL,
  adset_id VARCHAR(100) NOT NULL,
  adset_name VARCHAR(255),
  status VARCHAR(50),
  effective_status VARCHAR(50),
  billing_event VARCHAR(50),
  optimization_goal VARCHAR(100),
  daily_budget DECIMAL(12,2),
  lifetime_budget DECIMAL(12,2),
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  impressions INTEGER,
  reach INTEGER,
  results INTEGER,
  result_type VARCHAR(100),
  leads INTEGER,
  messages INTEGER,
  page_views INTEGER,
  conversions INTEGER,
  spend DECIMAL(12,2),
  cost_per_result DECIMAL(12,4),
  cost_per_conversion DECIMAL(12,4),
  created_time TIMESTAMPTZ,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_meta_adsets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_meta_adsets_access" ON public.tr_meta_adsets;
CREATE POLICY "tr_meta_adsets_access" ON public.tr_meta_adsets
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_meta_adsets_breakdowns
CREATE TABLE IF NOT EXISTS public.tr_meta_adsets_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL,
  campaign_id VARCHAR(100) NOT NULL,
  adset_id VARCHAR(100) NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  age VARCHAR(20),
  gender VARCHAR(20),
  region VARCHAR(100),
  publisher_platform VARCHAR(50),
  platform_position VARCHAR(100),
  impressions INTEGER,
  reach INTEGER,
  results INTEGER,
  conversions INTEGER,
  spend DECIMAL(12,2),
  cost_per_result DECIMAL(12,4),
  cost_per_conversion DECIMAL(12,4),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_meta_adsets_breakdowns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_meta_adsets_breakdowns_access" ON public.tr_meta_adsets_breakdowns;
CREATE POLICY "tr_meta_adsets_breakdowns_access" ON public.tr_meta_adsets_breakdowns
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_meta_ads
CREATE TABLE IF NOT EXISTS public.tr_meta_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL,
  campaign_id VARCHAR(100) NOT NULL,
  adset_id VARCHAR(100) NOT NULL,
  ad_id VARCHAR(100) NOT NULL,
  ad_name VARCHAR(255),
  status VARCHAR(50),
  effective_status VARCHAR(50),
  creative_id VARCHAR(100),
  image_url TEXT,
  thumbnail_url TEXT,
  video_id VARCHAR(100),
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  impressions INTEGER,
  reach INTEGER,
  results INTEGER,
  result_type VARCHAR(100),
  leads INTEGER,
  messages INTEGER,
  page_views INTEGER,
  conversions INTEGER,
  spend DECIMAL(12,2),
  cost_per_result DECIMAL(12,4),
  cost_per_conversion DECIMAL(12,4),
  created_time TIMESTAMPTZ,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_meta_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_meta_ads_access" ON public.tr_meta_ads;
CREATE POLICY "tr_meta_ads_access" ON public.tr_meta_ads
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_meta_ads_breakdowns
CREATE TABLE IF NOT EXISTS public.tr_meta_ads_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id VARCHAR(100) NOT NULL,
  campaign_id VARCHAR(100) NOT NULL,
  adset_id VARCHAR(100) NOT NULL,
  ad_id VARCHAR(100) NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  age VARCHAR(20),
  gender VARCHAR(20),
  region VARCHAR(100),
  publisher_platform VARCHAR(50),
  platform_position VARCHAR(100),
  impressions INTEGER,
  reach INTEGER,
  results INTEGER,
  conversions INTEGER,
  spend DECIMAL(12,2),
  cost_per_result DECIMAL(12,4),
  cost_per_conversion DECIMAL(12,4),
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_meta_ads_breakdowns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_meta_ads_breakdowns_access" ON public.tr_meta_ads_breakdowns;
CREATE POLICY "tr_meta_ads_breakdowns_access" ON public.tr_meta_ads_breakdowns
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- =====================================================
-- RD Station tables
-- =====================================================

-- tr_rdstation_metrics
CREATE TABLE IF NOT EXISTS public.tr_rdstation_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period VARCHAR(20) NOT NULL,
  period_start DATE,
  period_end DATE,
  source VARCHAR(100),
  segmentation_id INTEGER,
  segmentation_name VARCHAR(255),
  total_leads INTEGER,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_rdstation_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_rdstation_metrics_access" ON public.tr_rdstation_metrics;
CREATE POLICY "tr_rdstation_metrics_access" ON public.tr_rdstation_metrics
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_rdstation_leads
CREATE TABLE IF NOT EXISTS public.tr_rdstation_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID DEFAULT 'b8fb2ee4-069f-4cfc-b226-cc665cf50df2'::uuid,
  rd_lead_id VARCHAR(100),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50),
  lifecycle_stage VARCHAR(50),
  lead_scoring INTEGER,
  tags JSONB,
  custom_fields JSONB,
  first_conversion_event VARCHAR(255),
  first_conversion_url TEXT,
  conversion_source VARCHAR(100),
  conversion_medium VARCHAR(100),
  conversion_campaign VARCHAR(255),
  conversion_content VARCHAR(255),
  conversion_term VARCHAR(255),
  rd_created_at TIMESTAMPTZ,
  rd_updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_rdstation_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_rdstation_leads_access" ON public.tr_rdstation_leads;
CREATE POLICY "tr_rdstation_leads_access" ON public.tr_rdstation_leads
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- =====================================================
-- CRM tables
-- =====================================================

-- tr_crm_metrics
CREATE TABLE IF NOT EXISTS public.tr_crm_metrics (
  id SERIAL PRIMARY KEY,
  client_id UUID DEFAULT 'b8fb2ee4-069f-4cfc-b226-cc665cf50df2'::uuid,
  date DATE NOT NULL,
  source VARCHAR(50) NOT NULL,
  leads INTEGER,
  opportunities INTEGER,
  sales INTEGER,
  revenue DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_crm_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_crm_metrics_access" ON public.tr_crm_metrics;
CREATE POLICY "tr_crm_metrics_access" ON public.tr_crm_metrics
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_crm_deals
CREATE TABLE IF NOT EXISTS public.tr_crm_deals (
  id SERIAL PRIMARY KEY,
  client_id UUID DEFAULT 'b8fb2ee4-069f-4cfc-b226-cc665cf50df2'::uuid,
  deal_id INTEGER NOT NULL,
  deal_name VARCHAR(255),
  pipeline_id INTEGER,
  pipeline_name VARCHAR(255),
  stage_id INTEGER,
  stage_name VARCHAR(100),
  status VARCHAR(50),
  price DECIMAL(12,2),
  responsible_id INTEGER,
  origin VARCHAR(100),
  source VARCHAR(100),
  lost_reason_id INTEGER,
  lost_reason_name VARCHAR(255),
  contacts_created_same_day INTEGER,
  date_created TIMESTAMPTZ,
  date_closed TIMESTAMPTZ,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_crm_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_crm_deals_access" ON public.tr_crm_deals;
CREATE POLICY "tr_crm_deals_access" ON public.tr_crm_deals
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- tr_dashboard_summary
CREATE TABLE IF NOT EXISTS public.tr_dashboard_summary (
  rd_period VARCHAR(20),
  leads_rd_station INTEGER,
  funil_leads INTEGER,
  funil_oportunidades INTEGER,
  funil_vendas INTEGER,
  eduzz_tentativas INTEGER,
  eduzz_vendas INTEGER,
  eduzz_receita_bruta DECIMAL(12,2),
  eduzz_receita_liquida DECIMAL(12,2),
  taxa_lead_to_checkout DECIMAL(8,4),
  taxa_checkout_to_sale DECIMAL(8,4),
  taxa_lead_to_sale DECIMAL(8,4),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tr_dashboard_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tr_dashboard_summary_access" ON public.tr_dashboard_summary;
CREATE POLICY "tr_dashboard_summary_access" ON public.tr_dashboard_summary
  FOR ALL USING (public.has_tr_client_access(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tr_google_ad_metrics_date ON public.tr_google_ad_metrics(date);
CREATE INDEX IF NOT EXISTS idx_tr_google_keywords_date ON public.tr_google_keywords(date);
CREATE INDEX IF NOT EXISTS idx_tr_meta_campaigns_date ON public.tr_meta_campaigns(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_tr_meta_adsets_date ON public.tr_meta_adsets(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_tr_meta_ads_date ON public.tr_meta_ads(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_tr_crm_deals_created ON public.tr_crm_deals(date_created);
CREATE INDEX IF NOT EXISTS idx_tr_crm_metrics_date ON public.tr_crm_metrics(date);