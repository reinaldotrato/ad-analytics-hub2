-- Remover policy com recursão infinita
DROP POLICY IF EXISTS "CRM users can view sellers of their client" ON public.crm_sellers;

-- Recriar policy sem recursão (usando has_crm_client_access que já verifica crm_sellers internamente de forma segura)
CREATE POLICY "Users can view sellers of their client" 
  ON public.crm_sellers 
  FOR SELECT 
  USING (
    has_analytics_role(auth.uid(), 'admin'::analytics_role) OR
    has_analytics_role(auth.uid(), 'crm_admin'::analytics_role) OR
    has_analytics_role(auth.uid(), 'crm_user'::analytics_role) OR
    has_analytics_role(auth.uid(), 'analyst'::analytics_role) OR
    -- Verificar acesso via profile (sem recursão)
    EXISTS (
      SELECT 1 FROM public.tryvia_analytics_profiles p
      WHERE p.id = auth.uid() AND p.client_id = crm_sellers.client_id
    )
  );