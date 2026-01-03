-- =============================================
-- FASE 1: TABELAS DE SISTEMA
-- =============================================

-- Enum para roles de analytics (se não existir)
DO $$ BEGIN
  CREATE TYPE public.analytics_role AS ENUM ('admin', 'analyst', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.tryvia_analytics_clients (
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

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.tryvia_analytics_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.tryvia_analytics_clients(id) ON DELETE SET NULL,
  password_hash TEXT DEFAULT 'managed_by_supabase_auth',
  role TEXT DEFAULT 'viewer',
  whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de roles de usuários
CREATE TABLE IF NOT EXISTS public.tryvia_analytics_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role analytics_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

-- Tabela de credenciais de integração
CREATE TABLE IF NOT EXISTS public.tryvia_analytics_client_credentials (
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

-- Tabela de registro de tabelas por cliente
CREATE TABLE IF NOT EXISTS public.client_table_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  table_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FASE 2: TABELAS DE DADOS mo_* (Menina de Oficina)
-- =============================================

-- Tabela de anúncios Meta Ads
CREATE TABLE IF NOT EXISTS public.mo_meta_ads (
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

-- Tabela de breakdowns demográficos Meta Ads
CREATE TABLE IF NOT EXISTS public.mo_meta_ads_breakdowns (
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
  spend NUMERIC DEFAULT 0,
  reach BIGINT DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  results INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0
);

-- Tabela de métricas Google Ads
CREATE TABLE IF NOT EXISTS public.mo_google_ad_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de keywords Google Ads
CREATE TABLE IF NOT EXISTS public.mo_google_keywords (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL,
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

-- Tabela de negociações CRM
CREATE TABLE IF NOT EXISTS public.mo_crm_deals (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL,
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

-- Tabela de métricas agregadas CRM
CREATE TABLE IF NOT EXISTS public.mo_crm_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL,
  date DATE NOT NULL,
  source TEXT NOT NULL,
  leads INTEGER DEFAULT 0,
  opportunities INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FASE 3: ENABLE RLS
-- =============================================

ALTER TABLE public.tryvia_analytics_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryvia_analytics_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryvia_analytics_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryvia_analytics_client_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_table_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_meta_ads_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_google_ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_google_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mo_crm_metrics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FASE 4: FUNÇÃO has_analytics_role
-- =============================================

CREATE OR REPLACE FUNCTION public.has_analytics_role(_user_id uuid, _role analytics_role)
RETURNS boolean
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

-- Função para obter client_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.tryvia_analytics_profiles
  WHERE id = _user_id
$$;

-- =============================================
-- FASE 5: RLS POLICIES
-- =============================================

-- Policies para tryvia_analytics_clients
CREATE POLICY "Admins can manage all clients" ON public.tryvia_analytics_clients
  FOR ALL USING (public.has_analytics_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own client" ON public.tryvia_analytics_clients
  FOR SELECT USING (id = public.get_user_client_id(auth.uid()));

-- Policies para tryvia_analytics_profiles
CREATE POLICY "Users can view own profile" ON public.tryvia_analytics_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.tryvia_analytics_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.tryvia_analytics_profiles
  FOR ALL USING (public.has_analytics_role(auth.uid(), 'admin'));

-- Policies para tryvia_analytics_user_roles
CREATE POLICY "Users can view own role" ON public.tryvia_analytics_user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.tryvia_analytics_user_roles
  FOR ALL USING (public.has_analytics_role(auth.uid(), 'admin'));

-- Policies para tryvia_analytics_client_credentials
CREATE POLICY "Admins can manage all credentials" ON public.tryvia_analytics_client_credentials
  FOR ALL USING (public.has_analytics_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view credentials of their client" ON public.tryvia_analytics_client_credentials
  FOR SELECT USING (client_id = public.get_user_client_id(auth.uid()));

-- Policies para client_table_registry
CREATE POLICY "Admins can manage table registry" ON public.client_table_registry
  FOR ALL USING (public.has_analytics_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their client tables" ON public.client_table_registry
  FOR SELECT USING (client_id = public.get_user_client_id(auth.uid()));

-- Policies para mo_* tables (dados por conta/client)
CREATE POLICY "Authenticated users can view mo_meta_ads" ON public.mo_meta_ads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view mo_meta_ads_breakdowns" ON public.mo_meta_ads_breakdowns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view mo_google_ad_metrics" ON public.mo_google_ad_metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view mo_google_keywords" ON public.mo_google_keywords
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view mo_crm_deals" ON public.mo_crm_deals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view mo_crm_metrics" ON public.mo_crm_metrics
  FOR SELECT TO authenticated USING (true);

-- =============================================
-- FASE 6: TRIGGER PARA NOVO USUÁRIO
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_analytics_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_client_id uuid;
  client_name_value text;
  whatsapp_value text;
BEGIN
  -- Extrair dados do user_metadata
  client_name_value := NEW.raw_user_meta_data->>'client_name';
  whatsapp_value := NEW.raw_user_meta_data->>'whatsapp_number';
  
  -- Criar cliente
  INSERT INTO tryvia_analytics_clients (name, whatsapp_number)
  VALUES (COALESCE(client_name_value, 'Novo Cliente'), whatsapp_value)
  RETURNING id INTO new_client_id;
  
  -- Criar profile
  INSERT INTO tryvia_analytics_profiles (id, email, client_id, password_hash, role, whatsapp)
  VALUES (NEW.id, NEW.email, new_client_id, 'managed_by_supabase_auth', 'viewer', whatsapp_value);
  
  -- Criar role inicial (user)
  INSERT INTO tryvia_analytics_user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger no signup (drop se existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_analytics_user();

-- =============================================
-- FASE 7: DADOS INICIAIS
-- =============================================

-- Inserir cliente Menina de Oficina
INSERT INTO public.tryvia_analytics_clients (id, name, company_name, city, state)
VALUES ('11111111-1111-1111-1111-111111111111', 'Menina de Oficina', 'Menina de Oficina Ltda', 'São Paulo', 'SP')
ON CONFLICT DO NOTHING;

-- Registrar tabelas no registry
INSERT INTO public.client_table_registry (client_id, channel, table_type, table_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'ads', 'mo_meta_ads'),
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'breakdowns', 'mo_meta_ads_breakdowns'),
  ('11111111-1111-1111-1111-111111111111', 'google_ads', 'metrics', 'mo_google_ad_metrics'),
  ('11111111-1111-1111-1111-111111111111', 'google_ads', 'keywords', 'mo_google_keywords'),
  ('11111111-1111-1111-1111-111111111111', 'crm', 'deals', 'mo_crm_deals'),
  ('11111111-1111-1111-1111-111111111111', 'crm', 'metrics', 'mo_crm_metrics')
ON CONFLICT DO NOTHING;