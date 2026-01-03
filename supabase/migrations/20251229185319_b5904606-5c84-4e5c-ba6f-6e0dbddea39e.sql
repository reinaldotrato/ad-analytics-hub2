-- Atualizar has_crm_client_access para incluir as novas roles
CREATE OR REPLACE FUNCTION public.has_crm_client_access(_user_id uuid, _client_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    -- Admins have access to all clients
    has_analytics_role(_user_id, 'admin'::analytics_role)
    OR
    -- Managers (former crm_admin) have access to their client
    (has_analytics_role(_user_id, 'manager'::analytics_role) AND EXISTS (
      SELECT 1 FROM public.crm_sellers WHERE id = _user_id AND client_id = _client_id
    ))
    OR
    -- CRM Admins (legacy) have access to their client
    (has_analytics_role(_user_id, 'crm_admin'::analytics_role) AND EXISTS (
      SELECT 1 FROM public.crm_sellers WHERE id = _user_id AND client_id = _client_id
    ))
    OR
    -- Sellers (former crm_user) have access to their client
    (has_analytics_role(_user_id, 'seller'::analytics_role) AND EXISTS (
      SELECT 1 FROM public.crm_sellers WHERE id = _user_id AND client_id = _client_id
    ))
    OR
    -- CRM Users (legacy) have access to their client
    (has_analytics_role(_user_id, 'crm_user'::analytics_role) AND EXISTS (
      SELECT 1 FROM public.crm_sellers WHERE id = _user_id AND client_id = _client_id
    ))
    OR
    -- Regular users/analysts have access to their assigned client
    EXISTS (
      SELECT 1 FROM public.tryvia_analytics_profiles
      WHERE id = _user_id AND client_id = _client_id
    )
$function$;

-- Função helper para verificar se é vendedor (só vê próprios dados)
CREATE OR REPLACE FUNCTION public.is_seller_only(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_user_roles
    WHERE user_id = _user_id AND role IN ('seller', 'crm_user')
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'manager', 'crm_admin', 'analyst')
  )
$$;

-- Função helper para verificar se pode ver todos os dados do CRM (admin, manager)
CREATE OR REPLACE FUNCTION public.can_view_all_crm_data(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'manager', 'crm_admin')
  )
$$;

-- Atualizar política RLS para crm_deals - SELECT
DROP POLICY IF EXISTS "Users can view deals of their client" ON crm_deals;
DROP POLICY IF EXISTS "Role-based deals visibility" ON crm_deals;

CREATE POLICY "Role-based deals visibility" ON crm_deals
FOR SELECT USING (
  -- Admin/Manager veem todos do client
  (can_view_all_crm_data(auth.uid()) AND has_crm_client_access(auth.uid(), client_id))
  OR
  -- Vendedor só vê os seus
  (is_seller_only(auth.uid()) AND has_crm_client_access(auth.uid(), client_id) AND assigned_to_id = auth.uid())
);

-- Atualizar política RLS para crm_deals - INSERT
DROP POLICY IF EXISTS "Users can insert deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can create deals for their client" ON crm_deals;

CREATE POLICY "Users can create deals for their client" ON crm_deals
FOR INSERT WITH CHECK (
  has_crm_client_access(auth.uid(), client_id)
);

-- Atualizar política RLS para crm_deals - UPDATE
DROP POLICY IF EXISTS "Users can update deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can update deals of their client" ON crm_deals;

CREATE POLICY "Users can update deals of their client" ON crm_deals
FOR UPDATE USING (
  -- Admin/Manager podem editar todos
  (can_view_all_crm_data(auth.uid()) AND has_crm_client_access(auth.uid(), client_id))
  OR
  -- Vendedor só edita os seus
  (is_seller_only(auth.uid()) AND has_crm_client_access(auth.uid(), client_id) AND assigned_to_id = auth.uid())
);

-- Atualizar política RLS para crm_deals - DELETE
DROP POLICY IF EXISTS "Admins can delete deals" ON crm_deals;
DROP POLICY IF EXISTS "Users can delete deals of their client" ON crm_deals;

CREATE POLICY "Managers can delete deals" ON crm_deals
FOR DELETE USING (
  can_view_all_crm_data(auth.uid()) AND has_crm_client_access(auth.uid(), client_id)
);

-- Atualizar política RLS para crm_tasks - SELECT
DROP POLICY IF EXISTS "Users can view tasks of their client" ON crm_tasks;
DROP POLICY IF EXISTS "Role-based tasks visibility" ON crm_tasks;

CREATE POLICY "Role-based tasks visibility" ON crm_tasks
FOR SELECT USING (
  -- Admin/Manager veem todas do client
  (can_view_all_crm_data(auth.uid()) AND has_crm_client_access(auth.uid(), client_id))
  OR
  -- Vendedor só vê as suas
  (is_seller_only(auth.uid()) AND has_crm_client_access(auth.uid(), client_id) AND assigned_to_id = auth.uid())
);

-- Atualizar política RLS para crm_tasks - INSERT
DROP POLICY IF EXISTS "Users can insert tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Users can create tasks for their client" ON crm_tasks;

CREATE POLICY "Users can create tasks for their client" ON crm_tasks
FOR INSERT WITH CHECK (
  has_crm_client_access(auth.uid(), client_id)
);

-- Atualizar política RLS para crm_tasks - UPDATE
DROP POLICY IF EXISTS "Users can update tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Users can update tasks of their client" ON crm_tasks;

CREATE POLICY "Users can update tasks of their client" ON crm_tasks
FOR UPDATE USING (
  -- Admin/Manager podem editar todas
  (can_view_all_crm_data(auth.uid()) AND has_crm_client_access(auth.uid(), client_id))
  OR
  -- Vendedor só edita as suas
  (is_seller_only(auth.uid()) AND has_crm_client_access(auth.uid(), client_id) AND assigned_to_id = auth.uid())
);

-- Atualizar política RLS para crm_tasks - DELETE
DROP POLICY IF EXISTS "Users can delete tasks" ON crm_tasks;
DROP POLICY IF EXISTS "Managers can delete tasks" ON crm_tasks;

CREATE POLICY "Managers can delete tasks" ON crm_tasks
FOR DELETE USING (
  can_view_all_crm_data(auth.uid()) AND has_crm_client_access(auth.uid(), client_id)
);

-- Atualizar crm_sellers para incluir manager
DROP POLICY IF EXISTS "Admins and crm_admins can manage sellers" ON crm_sellers;
DROP POLICY IF EXISTS "Users can view sellers of their client" ON crm_sellers;

CREATE POLICY "Managers can manage sellers" ON crm_sellers
FOR ALL USING (
  has_analytics_role(auth.uid(), 'admin'::analytics_role) 
  OR has_analytics_role(auth.uid(), 'crm_admin'::analytics_role)
  OR has_analytics_role(auth.uid(), 'manager'::analytics_role)
) WITH CHECK (
  has_analytics_role(auth.uid(), 'admin'::analytics_role) 
  OR has_analytics_role(auth.uid(), 'crm_admin'::analytics_role)
  OR has_analytics_role(auth.uid(), 'manager'::analytics_role)
);

CREATE POLICY "All CRM users can view sellers" ON crm_sellers
FOR SELECT USING (
  has_analytics_role(auth.uid(), 'admin'::analytics_role)
  OR has_analytics_role(auth.uid(), 'crm_admin'::analytics_role)
  OR has_analytics_role(auth.uid(), 'crm_user'::analytics_role)
  OR has_analytics_role(auth.uid(), 'manager'::analytics_role)
  OR has_analytics_role(auth.uid(), 'seller'::analytics_role)
  OR has_analytics_role(auth.uid(), 'analyst'::analytics_role)
  OR EXISTS (
    SELECT 1 FROM tryvia_analytics_profiles p
    WHERE p.id = auth.uid() AND p.client_id = crm_sellers.client_id
  )
);