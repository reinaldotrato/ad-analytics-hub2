-- 1. Funil de vendas com filtro de data
CREATE OR REPLACE FUNCTION public.get_sales_funnel_data_filtered(
  client_id_param UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS SETOF json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  LEFT JOIN crm_deals d ON d.stage_id = fs.id 
    AND d.client_id = client_id_param
    AND (start_date IS NULL OR d.created_at::date >= start_date)
    AND (end_date IS NULL OR d.created_at::date <= end_date)
  WHERE fs.client_id = client_id_param
  GROUP BY fs.id, fs.client_id, fs.name, fs."order", fs.color, fs.is_won, fs.is_lost
  ORDER BY fs."order";
$$;

-- 2. Métricas por vendedor com filtro de data
CREATE OR REPLACE FUNCTION public.get_metrics_by_salesperson_filtered(
  client_id_param UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS SETOF json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  LEFT JOIN crm_deals d ON d.assigned_to_id = p.id 
    AND d.client_id = client_id_param
    AND (start_date IS NULL OR d.created_at::date >= start_date)
    AND (end_date IS NULL OR d.created_at::date <= end_date)
  LEFT JOIN crm_funnel_stages fs ON d.stage_id = fs.id
  WHERE p.client_id = client_id_param OR p.id IN (
    SELECT DISTINCT assigned_to_id FROM crm_deals 
    WHERE client_id = client_id_param 
      AND assigned_to_id IS NOT NULL
      AND (start_date IS NULL OR created_at::date >= start_date)
      AND (end_date IS NULL OR created_at::date <= end_date)
  )
  GROUP BY p.id, p.email
  HAVING COUNT(d.id) > 0;
$$;

-- 3. Vendas por período com filtro de range
CREATE OR REPLACE FUNCTION public.get_sales_by_period_report_filtered(
  client_id_param UUID,
  group_by TEXT DEFAULT 'month',
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS SETOF json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  WHERE d.client_id = client_id_param 
    AND d.closed_at IS NOT NULL
    AND (start_date IS NULL OR d.closed_at::date >= start_date)
    AND (end_date IS NULL OR d.closed_at::date <= end_date)
  GROUP BY to_char(d.closed_at, CASE 
    WHEN group_by = 'day' THEN 'DD/MM/YYYY'
    WHEN group_by = 'week' THEN 'IYYY-"Sem"IW'
    ELSE 'MM/YYYY'
  END)
  ORDER BY MIN(d.closed_at) DESC;
$$;