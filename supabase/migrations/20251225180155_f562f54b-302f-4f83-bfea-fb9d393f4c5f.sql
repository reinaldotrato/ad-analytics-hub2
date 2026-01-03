-- Função para buscar métricas de produtividade da equipe
CREATE OR REPLACE FUNCTION get_team_productivity_metrics(
  client_id_param UUID,
  start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  end_date DATE DEFAULT CURRENT_DATE,
  seller_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  seller_id UUID,
  seller_name TEXT,
  seller_email TEXT,
  task_type TEXT,
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.assigned_to_id,
    s.name,
    s.email,
    t.task_type,
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE t.completed = true)::BIGINT as completed,
    COUNT(*) FILTER (WHERE t.completed = false)::BIGINT as pending,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE t.completed = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)
      ELSE 0 
    END as rate
  FROM crm_tasks t
  LEFT JOIN crm_sellers s ON t.assigned_to_id = s.id
  WHERE t.client_id = client_id_param
    AND (t.due_date IS NULL OR t.due_date::DATE BETWEEN start_date AND end_date)
    AND (seller_id_param IS NULL OR t.assigned_to_id = seller_id_param)
  GROUP BY t.assigned_to_id, s.name, s.email, t.task_type
  ORDER BY s.name NULLS LAST, t.task_type;
END;
$$;

-- Função para evolução diária de tarefas
CREATE OR REPLACE FUNCTION get_productivity_evolution(
  client_id_param UUID,
  start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '7 days')::DATE,
  end_date DATE DEFAULT CURRENT_DATE,
  seller_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  task_date DATE,
  total_tasks BIGINT,
  completed_tasks BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.due_date::DATE as date_val,
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE t.completed = true)::BIGINT as completed
  FROM crm_tasks t
  WHERE t.client_id = client_id_param
    AND t.due_date IS NOT NULL
    AND t.due_date::DATE BETWEEN start_date AND end_date
    AND (seller_id_param IS NULL OR t.assigned_to_id = seller_id_param)
  GROUP BY t.due_date::DATE
  ORDER BY date_val;
END;
$$;

-- Função para ranking de vendedores por produtividade
CREATE OR REPLACE FUNCTION get_seller_productivity_ranking(
  client_id_param UUID,
  start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  seller_id UUID,
  seller_name TEXT,
  seller_email TEXT,
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT,
  overdue_tasks BIGINT,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.email,
    COUNT(t.id)::BIGINT as total,
    COUNT(t.id) FILTER (WHERE t.completed = true)::BIGINT as completed,
    COUNT(t.id) FILTER (WHERE t.completed = false)::BIGINT as pending,
    COUNT(t.id) FILTER (WHERE t.completed = false AND t.due_date < NOW())::BIGINT as overdue,
    CASE 
      WHEN COUNT(t.id) > 0 THEN 
        ROUND((COUNT(t.id) FILTER (WHERE t.completed = true)::NUMERIC / COUNT(t.id)::NUMERIC) * 100, 1)
      ELSE 0 
    END as rate
  FROM crm_sellers s
  LEFT JOIN crm_tasks t ON t.assigned_to_id = s.id 
    AND t.client_id = client_id_param
    AND (t.due_date IS NULL OR t.due_date::DATE BETWEEN start_date AND end_date)
  WHERE s.client_id = client_id_param
    AND s.is_active = true
  GROUP BY s.id, s.name, s.email
  ORDER BY completed DESC, rate DESC;
END;
$$;

-- Função para buscar tarefas com detalhes de empresa/contato
CREATE OR REPLACE FUNCTION get_tasks_with_details(
  client_id_param UUID,
  start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  end_date DATE DEFAULT CURRENT_DATE,
  seller_id_param UUID DEFAULT NULL,
  task_type_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  task_id UUID,
  task_title TEXT,
  task_type TEXT,
  task_completed BOOLEAN,
  task_due_date TIMESTAMPTZ,
  task_completed_at TIMESTAMPTZ,
  seller_id UUID,
  seller_name TEXT,
  deal_id UUID,
  deal_name TEXT,
  contact_name TEXT,
  company_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.task_type,
    t.completed,
    t.due_date,
    t.completed_at,
    t.assigned_to_id,
    s.name as seller,
    d.id as deal,
    d.name as deal_title,
    c.name as contact,
    co.name as company
  FROM crm_tasks t
  LEFT JOIN crm_sellers s ON t.assigned_to_id = s.id
  LEFT JOIN crm_deals d ON t.deal_id = d.id
  LEFT JOIN crm_contacts c ON d.contact_id = c.id
  LEFT JOIN crm_companies co ON c.company_id = co.id
  WHERE t.client_id = client_id_param
    AND (t.due_date IS NULL OR t.due_date::DATE BETWEEN start_date AND end_date)
    AND (seller_id_param IS NULL OR t.assigned_to_id = seller_id_param)
    AND (task_type_param IS NULL OR t.task_type = task_type_param)
  ORDER BY t.due_date DESC NULLS LAST;
END;
$$;