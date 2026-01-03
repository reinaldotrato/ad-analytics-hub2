-- Criar tabela de metas do CRM
CREATE TABLE public.crm_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.crm_sellers(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Metas manuais (definidas pela gestão)
  sales_quantity_goal INTEGER NOT NULL DEFAULT 0,
  sales_value_goal NUMERIC NOT NULL DEFAULT 0,
  
  -- Metas calculadas (baseadas em taxas históricas)
  leads_goal INTEGER NOT NULL DEFAULT 0,
  opportunities_goal INTEGER NOT NULL DEFAULT 0,
  
  -- Taxas de conversão usadas no cálculo (snapshot para histórico)
  lead_to_sale_rate NUMERIC DEFAULT 0,
  lead_to_opportunity_rate NUMERIC DEFAULT 0,
  opportunity_to_sale_rate NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Garantir que não haja metas duplicadas para o mesmo período/vendedor
  CONSTRAINT unique_goal_period UNIQUE (client_id, seller_id, period_type, period_start)
);

-- Índices para performance
CREATE INDEX idx_crm_goals_client_id ON public.crm_goals(client_id);
CREATE INDEX idx_crm_goals_seller_id ON public.crm_goals(seller_id);
CREATE INDEX idx_crm_goals_period ON public.crm_goals(period_start, period_end);

-- Habilitar RLS
ALTER TABLE public.crm_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view goals of their client"
  ON public.crm_goals FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert goals for their client"
  ON public.crm_goals FOR INSERT
  WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update goals of their client"
  ON public.crm_goals FOR UPDATE
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins and crm_admins can delete goals"
  ON public.crm_goals FOR DELETE
  USING (
    has_analytics_role(auth.uid(), 'admin'::analytics_role) OR 
    has_analytics_role(auth.uid(), 'crm_admin'::analytics_role)
  );

-- Trigger para updated_at
CREATE TRIGGER update_crm_goals_updated_at
  BEFORE UPDATE ON public.crm_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();