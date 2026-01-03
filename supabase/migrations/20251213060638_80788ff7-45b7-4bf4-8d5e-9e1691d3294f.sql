-- ===== CRM REPORTS RPC FUNCTIONS =====

-- Function 1: Dashboard Metrics
CREATE OR REPLACE FUNCTION get_crm_dashboard_metrics(client_id_param UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_deals', COUNT(*),
    'total_value', COALESCE(SUM(d.value), 0),
    'won_deals', COUNT(*) FILTER (WHERE fs.is_won = true),
    'won_value', COALESCE(SUM(d.value) FILTER (WHERE fs.is_won = true), 0),
    'lost_deals', COUNT(*) FILTER (WHERE fs.is_lost = true),
    'lost_value', COALESCE(SUM(d.value) FILTER (WHERE fs.is_lost = true), 0),
    'pending_tasks', (SELECT COUNT(*) FROM crm_tasks t WHERE t.client_id = client_id_param AND t.completed = false),
    'overdue_tasks', (SELECT COUNT(*) FROM crm_tasks t WHERE t.client_id = client_id_param AND t.completed = false AND t.due_date < NOW()),
    'conversion_rate', CASE 
      WHEN COUNT(*) FILTER (WHERE fs.is_won OR fs.is_lost) > 0 
      THEN (COUNT(*) FILTER (WHERE fs.is_won = true)::DECIMAL / COUNT(*) FILTER (WHERE fs.is_won OR fs.is_lost)) * 100 
      ELSE 0 
    END,
    'average_deal_value', CASE WHEN COUNT(*) > 0 THEN AVG(d.value) ELSE 0 END
  )
  FROM crm_deals d
  LEFT JOIN crm_funnel_stages fs ON d.stage_id = fs.id
  WHERE d.client_id = client_id_param;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Function 2: Funnel Data with Metrics
CREATE OR REPLACE FUNCTION get_sales_funnel_data(client_id_param UUID)
RETURNS SETOF JSON AS $$
  SELECT json_build_object(
    'id', fs.id,
    'client_id', fs.client_id,
    'name', fs.name,
    'order', fs."order",
    'color', fs.color,
    'is_won', fs.is_won,
    'is_lost', fs.is_lost,
    'deals_count', COUNT(d.id),
    'deals_value', COALESCE(SUM(d.value), 0)
  )
  FROM crm_funnel_stages fs
  LEFT JOIN crm_deals d ON d.stage_id = fs.id AND d.client_id = client_id_param
  WHERE fs.client_id = client_id_param
  GROUP BY fs.id, fs.client_id, fs.name, fs."order", fs.color, fs.is_won, fs.is_lost
  ORDER BY fs."order";
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Function 3: Metrics by Seller
CREATE OR REPLACE FUNCTION get_metrics_by_salesperson(client_id_param UUID)
RETURNS SETOF JSON AS $$
  SELECT json_build_object(
    'seller', json_build_object(
      'id', p.id,
      'name', COALESCE(p.email, p.id::text),
      'email', p.email,
      'avatar_url', null
    ),
    'opportunities_count', COUNT(d.id) FILTER (WHERE fs.is_lost IS DISTINCT FROM true),
    'sales_count', COUNT(d.id) FILTER (WHERE fs.is_won = true),
    'total_value', COALESCE(SUM(d.value) FILTER (WHERE fs.is_won = true), 0),
    'conversion_rate', CASE 
      WHEN COUNT(d.id) FILTER (WHERE fs.is_lost IS DISTINCT FROM true) > 0 
      THEN (COUNT(d.id) FILTER (WHERE fs.is_won = true)::DECIMAL / COUNT(d.id) FILTER (WHERE fs.is_lost IS DISTINCT FROM true)) * 100 
      ELSE 0 
    END
  )
  FROM tryvia_analytics_profiles p
  LEFT JOIN crm_deals d ON d.assigned_to_id = p.id AND d.client_id = client_id_param
  LEFT JOIN crm_funnel_stages fs ON d.stage_id = fs.id
  WHERE p.client_id = client_id_param OR p.id IN (SELECT DISTINCT assigned_to_id FROM crm_deals WHERE client_id = client_id_param AND assigned_to_id IS NOT NULL)
  GROUP BY p.id, p.email
  HAVING COUNT(d.id) > 0;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Function 4: Lost Opportunities Report
CREATE OR REPLACE FUNCTION get_lost_opportunities_report(client_id_param UUID)
RETURNS SETOF JSON AS $$
  SELECT json_build_object(
    'deal', json_build_object(
      'id', d.id,
      'name', d.name,
      'value', d.value,
      'contact', json_build_object('name', c.name, 'email', c.email)
    ),
    'reason', COALESCE(d.lost_reason, 'Não especificado'),
    'closed_at', COALESCE(d.closed_at, d.updated_at),
    'value', d.value,
    'seller_name', COALESCE(p.email, 'Não atribuído')
  )
  FROM crm_deals d
  JOIN crm_funnel_stages fs ON d.stage_id = fs.id AND fs.is_lost = true
  LEFT JOIN crm_contacts c ON d.contact_id = c.id
  LEFT JOIN tryvia_analytics_profiles p ON d.assigned_to_id = p.id
  WHERE d.client_id = client_id_param
  ORDER BY d.closed_at DESC NULLS LAST;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Function 5: Sales by Period Report
CREATE OR REPLACE FUNCTION get_sales_by_period_report(client_id_param UUID, group_by TEXT DEFAULT 'month')
RETURNS SETOF JSON AS $$
  SELECT json_build_object(
    'period', to_char(d.closed_at, CASE 
      WHEN group_by = 'day' THEN 'DD/MM/YYYY'
      WHEN group_by = 'week' THEN 'IYYY-"Sem"IW'
      ELSE 'MM/YYYY'
    END),
    'total_value', SUM(d.value),
    'deals_count', COUNT(*)
  )
  FROM crm_deals d
  JOIN crm_funnel_stages fs ON d.stage_id = fs.id AND fs.is_won = true
  WHERE d.client_id = client_id_param AND d.closed_at IS NOT NULL
  GROUP BY to_char(d.closed_at, CASE 
    WHEN group_by = 'day' THEN 'DD/MM/YYYY'
    WHEN group_by = 'week' THEN 'IYYY-"Sem"IW'
    ELSE 'MM/YYYY'
  END)
  ORDER BY MIN(d.closed_at) DESC;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Function 6: Global Search
CREATE OR REPLACE FUNCTION global_search(search_term TEXT, client_id_param UUID)
RETURNS TABLE(id UUID, name TEXT, type TEXT, path TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT d.id, d.name, 'Negócio'::TEXT, '/crm/deals/' || d.id::text
    FROM crm_deals d 
    WHERE d.client_id = client_id_param AND d.name ILIKE '%' || search_term || '%'
    UNION ALL
    SELECT c.id, c.name, 'Contato'::TEXT, '/crm/contacts'::TEXT
    FROM crm_contacts c 
    WHERE c.client_id = client_id_param AND c.name ILIKE '%' || search_term || '%'
    UNION ALL
    SELECT co.id, co.name, 'Empresa'::TEXT, '/crm/companies'::TEXT
    FROM crm_companies co 
    WHERE co.client_id = client_id_param AND co.name ILIKE '%' || search_term || '%'
    LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function 7: Overview Metrics for Reports
CREATE OR REPLACE FUNCTION get_crm_overview_metrics(client_id_param UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_leads', COUNT(*) FILTER (WHERE fs."order" = 0 OR fs."order" = 1),
    'total_opportunities', COUNT(*) FILTER (WHERE fs."order" >= 2 AND fs.is_won IS DISTINCT FROM true AND fs.is_lost IS DISTINCT FROM true),
    'total_sales', COUNT(*) FILTER (WHERE fs.is_won = true),
    'conversion_rate', CASE 
      WHEN COUNT(*) FILTER (WHERE fs.is_won OR fs.is_lost) > 0 
      THEN (COUNT(*) FILTER (WHERE fs.is_won = true)::DECIMAL / COUNT(*) FILTER (WHERE fs.is_won OR fs.is_lost)) * 100 
      ELSE 0 
    END,
    'average_ticket', COALESCE(AVG(d.value) FILTER (WHERE fs.is_won = true), 0)
  )
  FROM crm_deals d
  LEFT JOIN crm_funnel_stages fs ON d.stage_id = fs.id
  WHERE d.client_id = client_id_param;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;