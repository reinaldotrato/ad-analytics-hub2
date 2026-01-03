-- Create function to get lost opportunities with date filters
CREATE OR REPLACE FUNCTION public.get_lost_opportunities_report_filtered(
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
    AND (start_date IS NULL OR COALESCE(d.closed_at, d.updated_at)::date >= start_date)
    AND (end_date IS NULL OR COALESCE(d.closed_at, d.updated_at)::date <= end_date)
  ORDER BY d.closed_at DESC NULLS LAST;
$$;