-- Tabela de relacionamento Deal <-> Contatos (muitos para muitos)
CREATE TABLE crm_deal_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  client_id UUID NOT NULL REFERENCES tryvia_analytics_clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deal_id, contact_id)
);

-- Tabela de relacionamento Deal <-> Empresas (muitos para muitos)
CREATE TABLE crm_deal_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES crm_companies(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  client_id UUID NOT NULL REFERENCES tryvia_analytics_clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deal_id, company_id)
);

-- Migrar dados existentes de contact_id em deals para a nova tabela
INSERT INTO crm_deal_contacts (deal_id, contact_id, is_primary, client_id)
SELECT id, contact_id, true, client_id 
FROM crm_deals 
WHERE contact_id IS NOT NULL;

-- Migrar dados existentes de company_id através do contato para a nova tabela
INSERT INTO crm_deal_companies (deal_id, company_id, is_primary, client_id)
SELECT DISTINCT d.id, c.company_id, true, d.client_id
FROM crm_deals d
JOIN crm_contacts c ON d.contact_id = c.id
WHERE c.company_id IS NOT NULL;

-- Habilitar RLS
ALTER TABLE crm_deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deal_companies ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para crm_deal_contacts
CREATE POLICY "deal_contacts_select" ON crm_deal_contacts
FOR SELECT USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "deal_contacts_insert" ON crm_deal_contacts
FOR INSERT WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "deal_contacts_update" ON crm_deal_contacts
FOR UPDATE USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "deal_contacts_delete" ON crm_deal_contacts
FOR DELETE USING (has_crm_client_access(auth.uid(), client_id));

-- Políticas RLS para crm_deal_companies
CREATE POLICY "deal_companies_select" ON crm_deal_companies
FOR SELECT USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "deal_companies_insert" ON crm_deal_companies
FOR INSERT WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "deal_companies_update" ON crm_deal_companies
FOR UPDATE USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "deal_companies_delete" ON crm_deal_companies
FOR DELETE USING (has_crm_client_access(auth.uid(), client_id));

-- Índices para performance
CREATE INDEX idx_deal_contacts_deal_id ON crm_deal_contacts(deal_id);
CREATE INDEX idx_deal_contacts_contact_id ON crm_deal_contacts(contact_id);
CREATE INDEX idx_deal_companies_deal_id ON crm_deal_companies(deal_id);
CREATE INDEX idx_deal_companies_company_id ON crm_deal_companies(company_id);