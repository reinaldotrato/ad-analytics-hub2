-- Fase 1: Expandir tabela de clientes com novos campos
ALTER TABLE tryvia_analytics_clients 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS contact_name text;

-- Fase 2: Criar tabela de credenciais de integração
CREATE TABLE IF NOT EXISTS tryvia_analytics_client_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES tryvia_analytics_clients(id) ON DELETE CASCADE NOT NULL,
  channel text NOT NULL, -- 'google_ads', 'meta_ads', 'crm', 'outros'
  channel_name text, -- Nome customizado se "outros"
  url text,
  login text,
  password_encrypted text,
  notes text, -- Campo para observações em Rich Text
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS na tabela de credenciais
ALTER TABLE tryvia_analytics_client_credentials ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem gerenciar credenciais
CREATE POLICY "Admins can manage client credentials"
ON tryvia_analytics_client_credentials
FOR ALL
TO authenticated
USING (has_analytics_role(auth.uid(), 'admin'))
WITH CHECK (has_analytics_role(auth.uid(), 'admin'));

-- Índice para busca por client_id
CREATE INDEX IF NOT EXISTS idx_client_credentials_client_id 
ON tryvia_analytics_client_credentials(client_id);