-- Função para buscar usuários de um cliente para exclusão (bypass RLS)
CREATE OR REPLACE FUNCTION get_client_users_for_deletion(p_client_id uuid)
RETURNS TABLE(user_id uuid, user_email text, user_whatsapp text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT id, email, whatsapp_number 
  FROM tryvia_analytics_profiles
  WHERE client_id = p_client_id;
END;
$$;

-- Função para buscar tabelas de um cliente para exclusão (bypass RLS)
CREATE OR REPLACE FUNCTION get_client_tables_for_deletion(p_client_id uuid)
RETURNS TABLE(table_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ctr.table_name 
  FROM client_table_registry ctr
  WHERE ctr.client_id = p_client_id;
END;
$$;

-- Função para buscar preview completo de exclusão (bypass RLS)
CREATE OR REPLACE FUNCTION get_client_deletion_preview(p_client_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  users_count integer;
  tables_count integer;
  crm_deals_count integer;
  crm_contacts_count integer;
  crm_companies_count integer;
  crm_tasks_count integer;
  crm_timeline_count integer;
  crm_stages_count integer;
  crm_funnels_count integer;
  crm_products_count integer;
  crm_loss_reasons_count integer;
  crm_sellers_count integer;
  credentials_count integer;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO users_count FROM tryvia_analytics_profiles WHERE client_id = p_client_id;
  
  -- Count tables
  SELECT COUNT(*) INTO tables_count FROM client_table_registry WHERE client_id = p_client_id;
  
  -- Count CRM data
  SELECT COUNT(*) INTO crm_deals_count FROM crm_deals WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_contacts_count FROM crm_contacts WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_companies_count FROM crm_companies WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_tasks_count FROM crm_tasks WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_timeline_count FROM crm_timeline_events WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_stages_count FROM crm_funnel_stages WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_funnels_count FROM crm_funnels WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_products_count FROM crm_products WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_loss_reasons_count FROM crm_loss_reasons WHERE client_id = p_client_id;
  SELECT COUNT(*) INTO crm_sellers_count FROM crm_sellers WHERE client_id = p_client_id;
  
  -- Count credentials
  SELECT COUNT(*) INTO credentials_count FROM tryvia_analytics_client_credentials WHERE client_id = p_client_id;
  
  SELECT json_build_object(
    'users', users_count,
    'tables', tables_count,
    'credentials', credentials_count,
    'crm', json_build_object(
      'deals', crm_deals_count,
      'contacts', crm_contacts_count,
      'companies', crm_companies_count,
      'tasks', crm_tasks_count,
      'timeline_events', crm_timeline_count,
      'stages', crm_stages_count,
      'funnels', crm_funnels_count,
      'products', crm_products_count,
      'loss_reasons', crm_loss_reasons_count,
      'sellers', crm_sellers_count
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Função para excluir todos os dados de CRM de um cliente (bypass RLS)
CREATE OR REPLACE FUNCTION delete_client_crm_data(p_client_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_counts json;
  deals_deleted integer;
  tasks_deleted integer;
  timeline_deleted integer;
  contacts_deleted integer;
  companies_deleted integer;
  stages_deleted integer;
  funnels_deleted integer;
  products_deleted integer;
  loss_reasons_deleted integer;
  sellers_deleted integer;
  deal_products_deleted integer;
BEGIN
  -- Delete in order to respect foreign keys
  
  -- Delete deal products first
  DELETE FROM crm_deal_products WHERE client_id = p_client_id;
  GET DIAGNOSTICS deal_products_deleted = ROW_COUNT;
  
  -- Delete tasks
  DELETE FROM crm_tasks WHERE client_id = p_client_id;
  GET DIAGNOSTICS tasks_deleted = ROW_COUNT;
  
  -- Delete timeline events
  DELETE FROM crm_timeline_events WHERE client_id = p_client_id;
  GET DIAGNOSTICS timeline_deleted = ROW_COUNT;
  
  -- Delete deals
  DELETE FROM crm_deals WHERE client_id = p_client_id;
  GET DIAGNOSTICS deals_deleted = ROW_COUNT;
  
  -- Delete contacts
  DELETE FROM crm_contacts WHERE client_id = p_client_id;
  GET DIAGNOSTICS contacts_deleted = ROW_COUNT;
  
  -- Delete companies
  DELETE FROM crm_companies WHERE client_id = p_client_id;
  GET DIAGNOSTICS companies_deleted = ROW_COUNT;
  
  -- Delete stages
  DELETE FROM crm_funnel_stages WHERE client_id = p_client_id;
  GET DIAGNOSTICS stages_deleted = ROW_COUNT;
  
  -- Delete funnels
  DELETE FROM crm_funnels WHERE client_id = p_client_id;
  GET DIAGNOSTICS funnels_deleted = ROW_COUNT;
  
  -- Delete products
  DELETE FROM crm_products WHERE client_id = p_client_id;
  GET DIAGNOSTICS products_deleted = ROW_COUNT;
  
  -- Delete loss reasons
  DELETE FROM crm_loss_reasons WHERE client_id = p_client_id;
  GET DIAGNOSTICS loss_reasons_deleted = ROW_COUNT;
  
  -- Delete sellers
  DELETE FROM crm_sellers WHERE client_id = p_client_id;
  GET DIAGNOSTICS sellers_deleted = ROW_COUNT;
  
  SELECT json_build_object(
    'deal_products', deal_products_deleted,
    'tasks', tasks_deleted,
    'timeline_events', timeline_deleted,
    'deals', deals_deleted,
    'contacts', contacts_deleted,
    'companies', companies_deleted,
    'stages', stages_deleted,
    'funnels', funnels_deleted,
    'products', products_deleted,
    'loss_reasons', loss_reasons_deleted,
    'sellers', sellers_deleted
  ) INTO deleted_counts;
  
  RETURN deleted_counts;
END;
$$;

-- Função para excluir usuários e roles de um cliente (bypass RLS)
CREATE OR REPLACE FUNCTION delete_client_users(p_client_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_ids uuid[];
  roles_deleted integer;
  profiles_deleted integer;
BEGIN
  -- Get user IDs first
  SELECT array_agg(id) INTO user_ids 
  FROM tryvia_analytics_profiles 
  WHERE client_id = p_client_id;
  
  IF user_ids IS NOT NULL AND array_length(user_ids, 1) > 0 THEN
    -- Delete roles
    DELETE FROM tryvia_analytics_user_roles WHERE user_id = ANY(user_ids);
    GET DIAGNOSTICS roles_deleted = ROW_COUNT;
    
    -- Delete profiles
    DELETE FROM tryvia_analytics_profiles WHERE client_id = p_client_id;
    GET DIAGNOSTICS profiles_deleted = ROW_COUNT;
  ELSE
    roles_deleted := 0;
    profiles_deleted := 0;
  END IF;
  
  RETURN json_build_object(
    'user_ids', user_ids,
    'roles_deleted', roles_deleted,
    'profiles_deleted', profiles_deleted
  );
END;
$$;

-- Função para excluir credenciais de um cliente (bypass RLS)
CREATE OR REPLACE FUNCTION delete_client_credentials(p_client_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM tryvia_analytics_client_credentials WHERE client_id = p_client_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Função para excluir o cliente (bypass RLS)
CREATE OR REPLACE FUNCTION delete_client_record(p_client_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM tryvia_analytics_clients WHERE id = p_client_id;
  RETURN FOUND;
END;
$$;

-- Função para excluir registros do client_table_registry (bypass RLS)
CREATE OR REPLACE FUNCTION delete_client_table_registry(p_client_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM client_table_registry WHERE client_id = p_client_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;