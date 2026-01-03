-- Criar tabela crm_sellers
CREATE TABLE IF NOT EXISTS public.crm_sellers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES tryvia_analytics_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_crm_sellers_client_id ON crm_sellers(client_id);
CREATE INDEX IF NOT EXISTS idx_crm_sellers_is_active ON crm_sellers(is_active);

-- Enable RLS
ALTER TABLE crm_sellers ENABLE ROW LEVEL SECURITY;

-- Política para admins e crm_admins gerenciarem vendedores
CREATE POLICY "Admins and crm_admins can manage sellers"
ON crm_sellers FOR ALL
USING (
  has_analytics_role(auth.uid(), 'admin'::analytics_role) 
  OR has_analytics_role(auth.uid(), 'crm_admin'::analytics_role)
)
WITH CHECK (
  has_analytics_role(auth.uid(), 'admin'::analytics_role) 
  OR has_analytics_role(auth.uid(), 'crm_admin'::analytics_role)
);

-- Política para usuários CRM visualizarem vendedores do mesmo cliente
CREATE POLICY "CRM users can view sellers of their client"
ON crm_sellers FOR SELECT
USING (
  has_analytics_role(auth.uid(), 'admin'::analytics_role)
  OR (
    has_analytics_role(auth.uid(), 'crm_admin'::analytics_role) 
    AND EXISTS (SELECT 1 FROM crm_sellers s WHERE s.id = auth.uid() AND s.client_id = crm_sellers.client_id)
  )
  OR (
    has_analytics_role(auth.uid(), 'crm_user'::analytics_role)
    AND EXISTS (SELECT 1 FROM crm_sellers s WHERE s.id = auth.uid() AND s.client_id = crm_sellers.client_id)
  )
);

-- Atualizar função has_crm_client_access para incluir novas roles
CREATE OR REPLACE FUNCTION public.has_crm_client_access(_user_id uuid, _client_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    -- Admins have access to all clients
    has_analytics_role(_user_id, 'admin'::analytics_role)
    OR
    -- CRM Admins have access to their client
    (has_analytics_role(_user_id, 'crm_admin'::analytics_role) AND EXISTS (
      SELECT 1 FROM public.crm_sellers WHERE id = _user_id AND client_id = _client_id
    ))
    OR
    -- CRM Users have access to their client
    (has_analytics_role(_user_id, 'crm_user'::analytics_role) AND EXISTS (
      SELECT 1 FROM public.crm_sellers WHERE id = _user_id AND client_id = _client_id
    ))
    OR
    -- Regular users/analysts have access to their assigned client
    EXISTS (
      SELECT 1 FROM public.tryvia_analytics_profiles
      WHERE id = _user_id AND client_id = _client_id
    )
$$;

-- Trigger para updated_at
CREATE OR REPLACE TRIGGER update_crm_sellers_updated_at
BEFORE UPDATE ON crm_sellers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();