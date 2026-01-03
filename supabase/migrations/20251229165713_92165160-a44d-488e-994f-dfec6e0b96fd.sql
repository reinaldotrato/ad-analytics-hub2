-- Update the get_sales_funnel_data_filtered function to include funnel_id
CREATE OR REPLACE FUNCTION public.get_sales_funnel_data_filtered(client_id_param uuid, start_date date DEFAULT NULL::date, end_date date DEFAULT NULL::date)
 RETURNS SETOF json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT json_build_object(
    'id', fs.id,
    'client_id', fs.client_id,
    'funnel_id', fs.funnel_id,
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
  GROUP BY fs.id, fs.client_id, fs.funnel_id, fs.name, fs."order", fs.color, fs.is_won, fs.is_lost
  ORDER BY fs."order";
$function$;