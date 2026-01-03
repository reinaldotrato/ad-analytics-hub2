-- =============================================
-- CRM Module Tables
-- =============================================

-- CRM Companies table
CREATE TABLE public.crm_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  email text,
  phone text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CRM Contacts table
CREATE TABLE public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  position text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CRM Funnel Stages table
CREATE TABLE public.crm_funnel_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '#3B82F6',
  is_won boolean DEFAULT false,
  is_lost boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CRM Deals table
CREATE TABLE public.crm_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  probability integer NOT NULL DEFAULT 0,
  expected_close_date date,
  stage_id uuid NOT NULL REFERENCES public.crm_funnel_stages(id) ON DELETE RESTRICT,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  assigned_to_id uuid REFERENCES public.tryvia_analytics_profiles(id) ON DELETE SET NULL,
  source text,
  source_lead_id text,
  lost_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

-- CRM Tasks table
CREATE TABLE public.crm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  assigned_to_id uuid REFERENCES public.tryvia_analytics_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CRM Timeline Events table
CREATE TABLE public.crm_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.tryvia_analytics_profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('note', 'email', 'call', 'meeting', 'stage_change', 'task_completed')),
  description text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX idx_crm_contacts_client ON public.crm_contacts(client_id);
CREATE INDEX idx_crm_contacts_company ON public.crm_contacts(company_id);
CREATE INDEX idx_crm_companies_client ON public.crm_companies(client_id);
CREATE INDEX idx_crm_deals_client ON public.crm_deals(client_id);
CREATE INDEX idx_crm_deals_stage ON public.crm_deals(stage_id);
CREATE INDEX idx_crm_deals_contact ON public.crm_deals(contact_id);
CREATE INDEX idx_crm_tasks_deal ON public.crm_tasks(deal_id);
CREATE INDEX idx_crm_timeline_deal ON public.crm_timeline_events(deal_id);
CREATE INDEX idx_crm_funnel_stages_client ON public.crm_funnel_stages(client_id);

-- =============================================
-- Enable RLS on all CRM tables
-- =============================================
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_timeline_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper function to check client access
-- =============================================
CREATE OR REPLACE FUNCTION public.has_crm_client_access(_user_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admins have access to all clients
    has_analytics_role(_user_id, 'admin'::analytics_role)
    OR
    -- Users/Analysts have access only to their assigned client
    EXISTS (
      SELECT 1 FROM public.tryvia_analytics_profiles
      WHERE id = _user_id AND client_id = _client_id
    )
$$;

-- =============================================
-- RLS Policies for CRM Companies
-- =============================================
CREATE POLICY "Users can view companies of their client"
  ON public.crm_companies FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins and analysts can insert companies"
  ON public.crm_companies FOR INSERT
  WITH CHECK (
    has_analytics_role(auth.uid(), 'admin'::analytics_role)
    OR has_analytics_role(auth.uid(), 'analyst'::analytics_role)
    OR has_crm_client_access(auth.uid(), client_id)
  );

CREATE POLICY "Admins and analysts can update companies"
  ON public.crm_companies FOR UPDATE
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins can delete companies"
  ON public.crm_companies FOR DELETE
  USING (has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- =============================================
-- RLS Policies for CRM Contacts
-- =============================================
CREATE POLICY "Users can view contacts of their client"
  ON public.crm_contacts FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert contacts"
  ON public.crm_contacts FOR INSERT
  WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update contacts"
  ON public.crm_contacts FOR UPDATE
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins can delete contacts"
  ON public.crm_contacts FOR DELETE
  USING (has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- =============================================
-- RLS Policies for CRM Funnel Stages
-- =============================================
CREATE POLICY "Users can view funnel stages of their client"
  ON public.crm_funnel_stages FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins can manage funnel stages"
  ON public.crm_funnel_stages FOR ALL
  USING (has_analytics_role(auth.uid(), 'admin'::analytics_role))
  WITH CHECK (has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- =============================================
-- RLS Policies for CRM Deals
-- =============================================
CREATE POLICY "Users can view deals of their client"
  ON public.crm_deals FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert deals"
  ON public.crm_deals FOR INSERT
  WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update deals"
  ON public.crm_deals FOR UPDATE
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins can delete deals"
  ON public.crm_deals FOR DELETE
  USING (has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- =============================================
-- RLS Policies for CRM Tasks
-- =============================================
CREATE POLICY "Users can view tasks of their client"
  ON public.crm_tasks FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert tasks"
  ON public.crm_tasks FOR INSERT
  WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update tasks"
  ON public.crm_tasks FOR UPDATE
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can delete tasks"
  ON public.crm_tasks FOR DELETE
  USING (has_crm_client_access(auth.uid(), client_id));

-- =============================================
-- RLS Policies for CRM Timeline Events
-- =============================================
CREATE POLICY "Users can view timeline of their client"
  ON public.crm_timeline_events FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert timeline events"
  ON public.crm_timeline_events FOR INSERT
  WITH CHECK (has_crm_client_access(auth.uid(), client_id));

-- =============================================
-- Triggers for updated_at
-- =============================================
CREATE TRIGGER update_crm_companies_updated_at
  BEFORE UPDATE ON public.crm_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_deals_updated_at
  BEFORE UPDATE ON public.crm_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();