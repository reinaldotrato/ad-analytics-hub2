-- ============================================
-- MIGRAÇÃO COMPLETA - NOVO PROJETO SUPABASE
-- Cliente: Menina Oficina (prefixo: mo_)
-- Canais: Google Ads, Meta Ads, RD Station, Moskit CRM
-- ============================================

-- ============================================
-- PARTE 1: ENUMS
-- ============================================

CREATE TYPE public.analytics_role AS ENUM ('admin', 'analyst', 'user');

-- ============================================
-- PARTE 2: TABELAS DE SISTEMA (genéricas)
-- ============================================

-- Tabela de clientes da agência
CREATE TABLE public.tryvia_analytics_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  whatsapp_number TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  contact_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Perfis de usuários (vinculados ao auth.users)
CREATE TABLE public.tryvia_analytics_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  whatsapp TEXT,
  client_id UUID REFERENCES public.tryvia_analytics_clients(id),
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Roles de usuários (separado para segurança)
CREATE TABLE public.tryvia_analytics_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role analytics_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Credenciais de integração por cliente
CREATE TABLE public.tryvia_analytics_client_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  channel_name TEXT,
  url TEXT,
  login TEXT,
  password_encrypted TEXT,
  notes TEXT,
  connection_status TEXT DEFAULT 'pending',
  last_sync_at TIMESTAMPTZ,
  n8n_workflow_url TEXT,
  last_error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Relatórios gerados
CREATE TABLE public.tryvia_analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_by_user_id UUID REFERENCES public.tryvia_analytics_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PARTE 3: REGISTRO DE TABELAS POR CLIENTE (NOVO)
-- ============================================

CREATE TABLE public.client_table_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  table_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (client_id, channel, table_type)
);

-- ============================================
-- PARTE 4: FUNÇÃO DE VERIFICAÇÃO DE ROLE
-- ============================================

CREATE OR REPLACE FUNCTION public.has_analytics_role(_user_id UUID, _role analytics_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- PARTE 5: TABELAS DO CLIENTE MENINA OFICINA
-- ============================================

-- ----------------------------------------
-- GOOGLE ADS
-- ----------------------------------------

CREATE TABLE public.mo_google_ad_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id),
  date DATE NOT NULL,
  campaign_name TEXT,
  ad_name TEXT,
  adset_name TEXT,
  source TEXT NOT NULL DEFAULT 'google_ads',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  results INTEGER DEFAULT 0,
  result_type TEXT,
  status TEXT DEFAULT 'ENABLED',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (client_id, date, campaign_name, source)
);

CREATE TABLE public.mo_google_keywords (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id),
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

-- ----------------------------------------
-- META ADS
-- ----------------------------------------

CREATE TABLE public.mo_meta_campaigns (
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

CREATE TABLE public.mo_meta_adsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  adset_id TEXT NOT NULL,
  adset_name TEXT,
  optimization_goal TEXT,
  billing_event TEXT,
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

CREATE TABLE public.mo_meta_ads (
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

CREATE TABLE public.mo_meta_campaigns_breakdowns (
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

CREATE TABLE public.mo_meta_adsets_breakdowns (
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

CREATE TABLE public.mo_meta_ads_breakdowns (
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

CREATE TABLE public.mo_meta_campaigns_regions (
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

CREATE TABLE public.mo_meta_sync_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL,
  last_sync_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------
-- RD STATION
-- ----------------------------------------

CREATE TABLE public.mo_rdstation_leads_historico (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT DEFAULT 'menina_oficina',
  periodo VARCHAR NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  total_leads INTEGER NOT NULL,
  variacao_percentual NUMERIC,
  variacao_absoluta INTEGER,
  fonte VARCHAR DEFAULT 'RD Station - Segmentação Leads',
  data_extracao TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.mo_rdstation_resumo_mensal (
  id BIGSERIAL PRIMARY KEY,
  client_id TEXT DEFAULT 'menina_oficina',
  periodo_nome VARCHAR NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  total_leads INTEGER NOT NULL,
  leads_midia_paga INTEGER DEFAULT 0,
  leads_organico INTEGER DEFAULT 0,
  variacao_percentual NUMERIC,
  variacao_absoluta INTEGER,
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------
-- MOSKIT CRM
-- ----------------------------------------

CREATE TABLE public.mo_crm_deals (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id),
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
  origin TEXT,
  source TEXT,
  lost_reason_id BIGINT,
  lost_reason_name TEXT,
  contacts_created_same_day INTEGER DEFAULT 0,
  extracted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.mo_crm_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id),
  date DATE NOT NULL,
  source TEXT NOT NULL,
  leads INTEGER DEFAULT 0,
  opportunities INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PARTE 6: VIEWS PARA META ADS (opcional)
-- ============================================

CREATE VIEW public.mo_meta_campaigns_summary AS
SELECT 
  campaign_id,
  campaign_name,
  date_start,
  date_end,
  spend,
  reach,
  impressions,
  results,
  result_type,
  cost_per_result,
  conversions,
  cost_per_conversion,
  CASE WHEN impressions > 0 THEN (conversions::NUMERIC / impressions) * 100 ELSE 0 END AS conversion_rate,
  extracted_at,
  objective,
  effective_status
FROM public.mo_meta_campaigns;

CREATE VIEW public.mo_meta_demographic_performance AS
SELECT 
  age,
  gender,
  SUM(spend) AS total_spend,
  SUM(reach) AS total_reach,
  SUM(impressions) AS total_impressions,
  SUM(results) AS total_results,
  AVG(cost_per_result) AS avg_cost_per_result,
  SUM(conversions) AS total_conversions,
  AVG(cost_per_conversion) AS avg_cost_per_conversion
FROM public.mo_meta_campaigns_breakdowns
GROUP BY age, gender;

CREATE VIEW public.mo_meta_platform_performance AS
SELECT 
  publisher_platform,
  platform_position,
  SUM(spend) AS total_spend,
  SUM(reach) AS total_reach,
  SUM(impressions) AS total_impressions,
  SUM(results) AS total_results,
  AVG(cost_per_result) AS avg_cost_per_result,
  SUM(conversions) AS total_conversions,
  AVG(cost_per_conversion) AS avg_cost_per_conversion
FROM public.mo_meta_campaigns_breakdowns
GROUP BY publisher_platform, platform_position;

-- ============================================
-- PARTE 7: RLS - TABELAS DE SISTEMA
-- ============================================

ALTER TABLE public.tryvia_analytics_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryvia_analytics_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryvia_analytics_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryvia_analytics_client_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryvia_analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_table_registry ENABLE ROW LEVEL SECURITY;

-- Clients: admins podem ver tudo
CREATE POLICY "Admins can manage clients"
ON public.tryvia_analytics_clients FOR ALL
USING (public.has_analytics_role(auth.uid(), 'admin'))
WITH CHECK (public.has_analytics_role(auth.uid(), 'admin'));

-- Profiles: usuários veem próprio perfil, admins veem todos
CREATE POLICY "Users can view own profile"
ON public.tryvia_analytics_profiles FOR SELECT
USING (id = auth.uid() OR public.has_analytics_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage profiles"
ON public.tryvia_analytics_profiles FOR ALL
USING (public.has_analytics_role(auth.uid(), 'admin'))
WITH CHECK (public.has_analytics_role(auth.uid(), 'admin'));

-- User Roles: usuários veem próprio role
CREATE POLICY "Users can view own role"
ON public.tryvia_analytics_user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.tryvia_analytics_user_roles FOR ALL
USING (public.has_analytics_role(auth.uid(), 'admin'))
WITH CHECK (public.has_analytics_role(auth.uid(), 'admin'));

-- Credentials: apenas admins
CREATE POLICY "Admins can manage credentials"
ON public.tryvia_analytics_client_credentials FOR ALL
USING (public.has_analytics_role(auth.uid(), 'admin'))
WITH CHECK (public.has_analytics_role(auth.uid(), 'admin'));

-- Reports: usuários veem relatórios do próprio cliente
CREATE POLICY "Users can view own client reports"
ON public.tryvia_analytics_reports FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM public.tryvia_analytics_profiles WHERE id = auth.uid()
  )
  OR public.has_analytics_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage reports"
ON public.tryvia_analytics_reports FOR ALL
USING (public.has_analytics_role(auth.uid(), 'admin'))
WITH CHECK (public.has_analytics_role(auth.uid(), 'admin'));

-- Table Registry: admins podem gerenciar, todos podem ler
CREATE POLICY "Anyone can read table registry"
ON public.client_table_registry FOR SELECT
USING (true);

CREATE POLICY "Admins can manage table registry"
ON public.client_table_registry FOR ALL
USING (public.has_analytics_role(auth.uid(), 'admin'))
WITH CHECK (public.has_analytics_role(auth.uid(), 'admin'));

-- ============================================
-- PARTE 8: RLS - TABELAS MO_* (MENINA OFICINA)
-- ============================================

ALTER TABLE public.mo_google_ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_google_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_campaigns_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_adsets_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_ads_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_campaigns_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_sync_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_rdstation_leads_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_rdstation_resumo_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_crm_metrics ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar acesso ao cliente Menina Oficina
CREATE OR REPLACE FUNCTION public.has_mo_client_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_profiles p
    JOIN public.tryvia_analytics_clients c ON p.client_id = c.id
    WHERE p.id = _user_id AND c.name = 'Menina Oficina'
  )
  OR public.has_analytics_role(_user_id, 'admin')
$$;

-- Google Ads
CREATE POLICY "MO Google metrics access"
ON public.mo_google_ad_metrics FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO Google keywords access"
ON public.mo_google_keywords FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

-- Meta Ads
CREATE POLICY "MO Meta campaigns access"
ON public.mo_meta_campaigns FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO Meta adsets access"
ON public.mo_meta_adsets FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO Meta ads access"
ON public.mo_meta_ads FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO Meta campaigns breakdowns access"
ON public.mo_meta_campaigns_breakdowns FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO Meta adsets breakdowns access"
ON public.mo_meta_adsets_breakdowns FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO Meta ads breakdowns access"
ON public.mo_meta_ads_breakdowns FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO Meta regions access"
ON public.mo_meta_campaigns_regions FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO Meta sync control access"
ON public.mo_meta_sync_control FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

-- RD Station
CREATE POLICY "MO RD historico access"
ON public.mo_rdstation_leads_historico FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO RD resumo access"
ON public.mo_rdstation_resumo_mensal FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

-- CRM
CREATE POLICY "MO CRM deals access"
ON public.mo_crm_deals FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

CREATE POLICY "MO CRM metrics access"
ON public.mo_crm_metrics FOR SELECT
USING (public.has_mo_client_access(auth.uid()));

-- ============================================
-- PARTE 9: ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_mo_google_ad_metrics_date ON public.mo_google_ad_metrics(date);
CREATE INDEX idx_mo_google_ad_metrics_client ON public.mo_google_ad_metrics(client_id);
CREATE INDEX idx_mo_google_keywords_date ON public.mo_google_keywords(date);
CREATE INDEX idx_mo_meta_campaigns_date ON public.mo_meta_campaigns(date_start);
CREATE INDEX idx_mo_meta_campaigns_account ON public.mo_meta_campaigns(account_id);
CREATE INDEX idx_mo_meta_adsets_campaign ON public.mo_meta_adsets(campaign_id);
CREATE INDEX idx_mo_meta_ads_adset ON public.mo_meta_ads(adset_id);
CREATE INDEX idx_mo_crm_deals_date ON public.mo_crm_deals(date_created);
CREATE INDEX idx_mo_crm_deals_status ON public.mo_crm_deals(status);
CREATE INDEX idx_mo_crm_deals_pipeline ON public.mo_crm_deals(pipeline_id);

-- ============================================
-- PARTE 10: DADOS INICIAIS
-- ============================================

-- Inserir cliente Menina Oficina
INSERT INTO public.tryvia_analytics_clients (id, name, company_name)
VALUES ('11111111-1111-1111-1111-111111111111', 'Menina Oficina', 'Menina Oficina');

-- Registrar tabelas no registry
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
('11111111-1111-1111-1111-111111111111', 'rdstation', 'leads_historico', 'mo_rdstation_leads_historico'),
('11111111-1111-1111-1111-111111111111', 'rdstation', 'resumo_mensal', 'mo_rdstation_resumo_mensal'),
-- Moskit CRM
('11111111-1111-1111-1111-111111111111', 'moskit', 'deals', 'mo_crm_deals'),
('11111111-1111-1111-1111-111111111111', 'moskit', 'metrics', 'mo_crm_metrics');

-- ============================================
-- PARTE 11: TRIGGER PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_credentials_updated_at
BEFORE UPDATE ON public.tryvia_analytics_client_credentials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_sync_updated_at
BEFORE UPDATE ON public.mo_meta_sync_control
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PARTE 12: STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true);

-- Policy para assets públicos
CREATE POLICY "Public assets access"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

CREATE POLICY "Admins can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND public.has_analytics_role(auth.uid(), 'admin'));

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================
