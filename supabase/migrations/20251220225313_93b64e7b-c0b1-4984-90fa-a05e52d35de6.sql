-- =============================================
-- RD Station Leads Tables - Individual Lead Records
-- =============================================

-- 1. ACCEB (ac_) - ID: 9ef28fd8-7393-408f-937b-31bfaefc7afa
CREATE TABLE IF NOT EXISTS public.ac_rdstation_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL DEFAULT '9ef28fd8-7393-408f-937b-31bfaefc7afa',
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

CREATE INDEX IF NOT EXISTS idx_ac_rdleads_date ON public.ac_rdstation_leads(rd_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ac_rdleads_source ON public.ac_rdstation_leads(conversion_source);
CREATE INDEX IF NOT EXISTS idx_ac_rdleads_campaign ON public.ac_rdstation_leads(conversion_campaign);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ac_rdleads_unique ON public.ac_rdstation_leads(rd_lead_id) WHERE rd_lead_id IS NOT NULL;

ALTER TABLE public.ac_rdstation_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ac_rdstation_leads_select_policy" ON public.ac_rdstation_leads;
DROP POLICY IF EXISTS "ac_rdstation_leads_insert_policy" ON public.ac_rdstation_leads;
DROP POLICY IF EXISTS "ac_rdstation_leads_update_policy" ON public.ac_rdstation_leads;

CREATE POLICY "ac_rdstation_leads_select_policy" ON public.ac_rdstation_leads
    FOR SELECT USING (public.has_ac_client_access(auth.uid()));
CREATE POLICY "ac_rdstation_leads_insert_policy" ON public.ac_rdstation_leads
    FOR INSERT WITH CHECK (true);
CREATE POLICY "ac_rdstation_leads_update_policy" ON public.ac_rdstation_leads
    FOR UPDATE USING (public.has_ac_client_access(auth.uid()));

-- 2. Lorpen (lo_) - ID: 52502e4e-3e10-4e54-a123-80adf45f4c91
CREATE TABLE IF NOT EXISTS public.lo_rdstation_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL DEFAULT '52502e4e-3e10-4e54-a123-80adf45f4c91',
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

CREATE INDEX IF NOT EXISTS idx_lo_rdleads_date ON public.lo_rdstation_leads(rd_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lo_rdleads_source ON public.lo_rdstation_leads(conversion_source);
CREATE INDEX IF NOT EXISTS idx_lo_rdleads_campaign ON public.lo_rdstation_leads(conversion_campaign);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lo_rdleads_unique ON public.lo_rdstation_leads(rd_lead_id) WHERE rd_lead_id IS NOT NULL;

ALTER TABLE public.lo_rdstation_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lo_rdstation_leads_select_policy" ON public.lo_rdstation_leads
    FOR SELECT USING (public.has_lo_client_access(auth.uid()));
CREATE POLICY "lo_rdstation_leads_insert_policy" ON public.lo_rdstation_leads
    FOR INSERT WITH CHECK (true);
CREATE POLICY "lo_rdstation_leads_update_policy" ON public.lo_rdstation_leads
    FOR UPDATE USING (public.has_lo_client_access(auth.uid()));

-- 3. Menina Oficina (mo_) - ID: 11111111-1111-1111-1111-111111111111
CREATE TABLE IF NOT EXISTS public.mo_rdstation_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
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

CREATE INDEX IF NOT EXISTS idx_mo_rdleads_date ON public.mo_rdstation_leads(rd_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mo_rdleads_source ON public.mo_rdstation_leads(conversion_source);
CREATE INDEX IF NOT EXISTS idx_mo_rdleads_campaign ON public.mo_rdstation_leads(conversion_campaign);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mo_rdleads_unique ON public.mo_rdstation_leads(rd_lead_id) WHERE rd_lead_id IS NOT NULL;

ALTER TABLE public.mo_rdstation_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mo_rdstation_leads_select_policy" ON public.mo_rdstation_leads;
DROP POLICY IF EXISTS "mo_rdstation_leads_insert_policy" ON public.mo_rdstation_leads;
DROP POLICY IF EXISTS "mo_rdstation_leads_update_policy" ON public.mo_rdstation_leads;

CREATE POLICY "mo_rdstation_leads_select_policy" ON public.mo_rdstation_leads
    FOR SELECT USING (public.has_mo_client_access(auth.uid()));
CREATE POLICY "mo_rdstation_leads_insert_policy" ON public.mo_rdstation_leads
    FOR INSERT WITH CHECK (true);
CREATE POLICY "mo_rdstation_leads_update_policy" ON public.mo_rdstation_leads
    FOR UPDATE USING (public.has_mo_client_access(auth.uid()));

-- 4. Santa Madre (sm_) - ID: 1e9bc1d6-a6d9-470c-9a90-6afc96ba9ada
CREATE TABLE IF NOT EXISTS public.sm_rdstation_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL DEFAULT '1e9bc1d6-a6d9-470c-9a90-6afc96ba9ada',
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

CREATE INDEX IF NOT EXISTS idx_sm_rdleads_date ON public.sm_rdstation_leads(rd_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sm_rdleads_source ON public.sm_rdstation_leads(conversion_source);
CREATE INDEX IF NOT EXISTS idx_sm_rdleads_campaign ON public.sm_rdstation_leads(conversion_campaign);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sm_rdleads_unique ON public.sm_rdstation_leads(rd_lead_id) WHERE rd_lead_id IS NOT NULL;

ALTER TABLE public.sm_rdstation_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sm_rdstation_leads_select_policy" ON public.sm_rdstation_leads
    FOR SELECT USING (public.has_sm_client_access(auth.uid()));
CREATE POLICY "sm_rdstation_leads_insert_policy" ON public.sm_rdstation_leads
    FOR INSERT WITH CHECK (true);
CREATE POLICY "sm_rdstation_leads_update_policy" ON public.sm_rdstation_leads
    FOR UPDATE USING (public.has_sm_client_access(auth.uid()));

-- =============================================
-- Register tables in client_table_registry
-- =============================================
INSERT INTO public.client_table_registry (client_id, channel, table_type, table_name)
VALUES 
    ('9ef28fd8-7393-408f-937b-31bfaefc7afa', 'rdstation', 'leads', 'ac_rdstation_leads'),
    ('52502e4e-3e10-4e54-a123-80adf45f4c91', 'rdstation', 'leads', 'lo_rdstation_leads'),
    ('11111111-1111-1111-1111-111111111111', 'rdstation', 'leads', 'mo_rdstation_leads'),
    ('1e9bc1d6-a6d9-470c-9a90-6afc96ba9ada', 'rdstation', 'leads', 'sm_rdstation_leads')
ON CONFLICT DO NOTHING;