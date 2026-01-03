-- =====================================================
-- FIX: Restringir acesso a dados sensíveis de contatos
-- =====================================================

-- 1. Drop a política atual permissiva
DROP POLICY IF EXISTS "Users can view contacts of their client" ON public.crm_contacts;

-- 2. Criar política mais restritiva para SELECT
-- Admins e crm_admins: veem todos os contatos do client
-- crm_users: só veem contatos vinculados a deals que estão atribuídos a eles
CREATE POLICY "Users can view contacts based on role" 
ON public.crm_contacts 
FOR SELECT 
USING (
  -- Admins e analysts veem tudo
  has_analytics_role(auth.uid(), 'admin'::analytics_role)
  OR has_analytics_role(auth.uid(), 'analyst'::analytics_role)
  -- CRM Admins veem todos contatos do seu client
  OR (has_analytics_role(auth.uid(), 'crm_admin'::analytics_role) 
      AND has_crm_client_access(auth.uid(), client_id))
  -- CRM Users só veem contatos associados a seus deals
  OR (has_analytics_role(auth.uid(), 'crm_user'::analytics_role) 
      AND has_crm_client_access(auth.uid(), client_id)
      AND EXISTS (
        SELECT 1 FROM crm_deals d
        WHERE d.contact_id = crm_contacts.id
        AND d.assigned_to_id = auth.uid()
      ))
);