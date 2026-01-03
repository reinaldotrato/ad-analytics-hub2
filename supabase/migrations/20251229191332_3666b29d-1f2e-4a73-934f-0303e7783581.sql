-- =====================================================
-- SISTEMA DE PERMISSÕES DINÂMICAS
-- =====================================================

-- 1. Tabela de funcionalidades do sistema
CREATE TABLE public.app_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Tabela de grupos de acesso
CREATE TABLE public.access_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  is_system_default boolean DEFAULT false,
  can_see_all_deals boolean DEFAULT false,
  can_see_all_tasks boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(client_id, slug)
);

-- 3. Tabela de permissões por grupo
CREATE TABLE public.group_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.access_groups(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.app_features(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_id, feature_id)
);

-- 4. Tabela de associação usuário-grupo
CREATE TABLE public.user_access_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.access_groups(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- =====================================================
-- INSERIR FUNCIONALIDADES PADRÃO
-- =====================================================

INSERT INTO public.app_features (name, slug, category, description, display_order) VALUES
-- Dashboard
('Visão Global', 'global_view', 'dashboard', 'Acesso à visão global de todos os clientes', 1),
('Dashboard Completo', 'dashboard_complete', 'dashboard', 'Acesso ao dashboard completo com todas as métricas', 2),
('Dashboard Executivo', 'dashboard_executive', 'dashboard', 'Acesso ao dashboard executivo resumido', 3),
('Exportar Dashboard', 'export_dashboard', 'dashboard', 'Permissão para exportar relatórios do dashboard', 4),
-- CRM
('CRM Pipeline', 'crm_pipeline', 'crm', 'Acesso ao pipeline de negócios', 10),
('CRM Relatórios', 'crm_reports', 'crm', 'Acesso aos relatórios do CRM', 11),
('CRM Contatos', 'crm_contacts', 'crm', 'Gerenciamento de contatos', 12),
('CRM Empresas', 'crm_companies', 'crm', 'Gerenciamento de empresas', 13),
('CRM Calendário', 'crm_calendar', 'crm', 'Acesso ao calendário de atividades', 14),
('CRM Metas', 'crm_goals', 'crm', 'Gerenciamento de metas de vendas', 15),
('CRM Produtividade', 'crm_productivity', 'crm', 'Relatórios de produtividade da equipe', 16),
('CRM Configurações', 'crm_settings', 'crm', 'Configurações do CRM (funis, etapas, produtos)', 17),
-- Sistema
('Suporte Técnico', 'support_tickets', 'system', 'Acesso ao sistema de suporte técnico', 20),
('Configurações do App', 'app_settings', 'system', 'Configurações gerais do aplicativo', 21);

-- =====================================================
-- INSERIR GRUPOS PADRÃO DO SISTEMA (client_id = NULL = global)
-- =====================================================

-- Admin Master
INSERT INTO public.access_groups (id, client_id, name, slug, description, is_system_default, can_see_all_deals, can_see_all_tasks)
VALUES ('00000000-0000-4000-a000-000000000001', NULL, 'Admin Master', 'admin', 'Acesso total ao sistema', true, true, true);

-- Analista
INSERT INTO public.access_groups (id, client_id, name, slug, description, is_system_default, can_see_all_deals, can_see_all_tasks)
VALUES ('00000000-0000-4000-a000-000000000002', NULL, 'Analista', 'analyst', 'Acesso aos dashboards e relatórios', true, true, true);

-- Gestor
INSERT INTO public.access_groups (id, client_id, name, slug, description, is_system_default, can_see_all_deals, can_see_all_tasks)
VALUES ('00000000-0000-4000-a000-000000000003', NULL, 'Gestor', 'manager', 'Gestão completa do CRM e dashboards', true, true, true);

-- Vendedor
INSERT INTO public.access_groups (id, client_id, name, slug, description, is_system_default, can_see_all_deals, can_see_all_tasks)
VALUES ('00000000-0000-4000-a000-000000000004', NULL, 'Vendedor', 'seller', 'Acesso ao CRM com visão limitada aos próprios negócios', true, false, false);

-- =====================================================
-- ASSOCIAR PERMISSÕES AOS GRUPOS PADRÃO
-- =====================================================

-- Admin Master - TODAS as funcionalidades
INSERT INTO public.group_permissions (group_id, feature_id, is_enabled)
SELECT '00000000-0000-4000-a000-000000000001', id, true FROM public.app_features;

-- Analista - Dashboard apenas
INSERT INTO public.group_permissions (group_id, feature_id, is_enabled)
SELECT '00000000-0000-4000-a000-000000000002', id, 
  CASE WHEN slug IN ('dashboard_complete', 'dashboard_executive', 'export_dashboard') THEN true ELSE false END
FROM public.app_features;

-- Gestor - Dashboard + CRM completo
INSERT INTO public.group_permissions (group_id, feature_id, is_enabled)
SELECT '00000000-0000-4000-a000-000000000003', id,
  CASE WHEN slug IN ('dashboard_complete', 'dashboard_executive', 'export_dashboard', 
                     'crm_pipeline', 'crm_reports', 'crm_contacts', 'crm_companies',
                     'crm_calendar', 'crm_goals', 'crm_productivity', 'crm_settings') THEN true ELSE false END
FROM public.app_features;

-- Vendedor - CRM limitado
INSERT INTO public.group_permissions (group_id, feature_id, is_enabled)
SELECT '00000000-0000-4000-a000-000000000004', id,
  CASE WHEN slug IN ('crm_pipeline', 'crm_reports', 'crm_contacts', 'crm_companies') THEN true ELSE false END
FROM public.app_features;

-- =====================================================
-- MIGRAR USUÁRIOS EXISTENTES PARA GRUPOS
-- =====================================================

-- Mapear roles existentes para grupos
INSERT INTO public.user_access_groups (user_id, group_id)
SELECT ur.user_id, 
  CASE 
    WHEN ur.role = 'admin' THEN '00000000-0000-4000-a000-000000000001'::uuid
    WHEN ur.role = 'analyst' THEN '00000000-0000-4000-a000-000000000002'::uuid
    WHEN ur.role IN ('manager', 'crm_admin') THEN '00000000-0000-4000-a000-000000000003'::uuid
    WHEN ur.role IN ('seller', 'crm_user', 'user') THEN '00000000-0000-4000-a000-000000000004'::uuid
    ELSE '00000000-0000-4000-a000-000000000004'::uuid
  END
FROM public.tryvia_analytics_user_roles ur
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- FUNÇÕES HELPER PARA RLS
-- =====================================================

-- Verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id uuid, _feature_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_access_groups uag
    JOIN group_permissions gp ON gp.group_id = uag.group_id
    JOIN app_features af ON af.id = gp.feature_id
    WHERE uag.user_id = _user_id 
      AND af.slug = _feature_slug
      AND gp.is_enabled = true
      AND af.is_active = true
  );
$$;

-- Verificar se usuário pode ver todos os deals
CREATE OR REPLACE FUNCTION public.user_can_see_all_deals(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT ag.can_see_all_deals 
     FROM user_access_groups uag
     JOIN access_groups ag ON ag.id = uag.group_id
     WHERE uag.user_id = _user_id
     LIMIT 1),
    false
  );
$$;

-- Verificar se usuário pode ver todas as tasks
CREATE OR REPLACE FUNCTION public.user_can_see_all_tasks(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT ag.can_see_all_tasks 
     FROM user_access_groups uag
     JOIN access_groups ag ON ag.id = uag.group_id
     WHERE uag.user_id = _user_id
     LIMIT 1),
    false
  );
$$;

-- Obter todas as permissões de um usuário
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(feature_slug text, is_enabled boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT af.slug, gp.is_enabled
  FROM user_access_groups uag
  JOIN group_permissions gp ON gp.group_id = uag.group_id
  JOIN app_features af ON af.id = gp.feature_id
  WHERE uag.user_id = _user_id
    AND af.is_active = true;
$$;

-- Obter info do grupo do usuário
CREATE OR REPLACE FUNCTION public.get_user_group_info(_user_id uuid)
RETURNS TABLE(
  group_id uuid,
  group_name text,
  group_slug text,
  can_see_all_deals boolean,
  can_see_all_tasks boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ag.id, ag.name, ag.slug, ag.can_see_all_deals, ag.can_see_all_tasks
  FROM user_access_groups uag
  JOIN access_groups ag ON ag.id = uag.group_id
  WHERE uag.user_id = _user_id
  LIMIT 1;
$$;

-- =====================================================
-- HABILITAR RLS NAS NOVAS TABELAS
-- =====================================================

ALTER TABLE public.app_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_groups ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES PARA app_features
-- =====================================================

CREATE POLICY "Everyone can view active features"
ON public.app_features FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can manage features"
ON public.app_features FOR ALL
USING (user_has_permission(auth.uid(), 'app_settings'))
WITH CHECK (user_has_permission(auth.uid(), 'app_settings'));

-- =====================================================
-- POLICIES PARA access_groups
-- =====================================================

CREATE POLICY "Users can view system groups and their client groups"
ON public.access_groups FOR SELECT
USING (
  is_system_default = true 
  OR client_id IS NULL
  OR has_crm_client_access(auth.uid(), client_id)
);

CREATE POLICY "Only admins can manage groups"
ON public.access_groups FOR ALL
USING (user_has_permission(auth.uid(), 'app_settings'))
WITH CHECK (user_has_permission(auth.uid(), 'app_settings'));

-- =====================================================
-- POLICIES PARA group_permissions
-- =====================================================

CREATE POLICY "Users can view permissions of accessible groups"
ON public.group_permissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM access_groups ag
    WHERE ag.id = group_id
    AND (ag.is_system_default = true OR ag.client_id IS NULL OR has_crm_client_access(auth.uid(), ag.client_id))
  )
);

CREATE POLICY "Only admins can manage permissions"
ON public.group_permissions FOR ALL
USING (user_has_permission(auth.uid(), 'app_settings'))
WITH CHECK (user_has_permission(auth.uid(), 'app_settings'));

-- =====================================================
-- POLICIES PARA user_access_groups
-- =====================================================

CREATE POLICY "Users can view their own group"
ON public.user_access_groups FOR SELECT
USING (user_id = auth.uid() OR user_has_permission(auth.uid(), 'app_settings'));

CREATE POLICY "Only admins can manage user groups"
ON public.user_access_groups FOR ALL
USING (user_has_permission(auth.uid(), 'app_settings'))
WITH CHECK (user_has_permission(auth.uid(), 'app_settings'));

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================

CREATE TRIGGER update_app_features_updated_at
  BEFORE UPDATE ON public.app_features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_access_groups_updated_at
  BEFORE UPDATE ON public.access_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();