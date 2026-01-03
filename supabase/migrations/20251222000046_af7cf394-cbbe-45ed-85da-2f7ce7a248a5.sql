-- =====================================================
-- Migration: Atualizar RPC get_crm_overview_metrics
-- Objetivo: Usar apenas crm_deals com filtro de datas
-- =====================================================

CREATE OR REPLACE FUNCTION get_crm_overview_metrics(
  client_id_param UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_leads', COUNT(*),
    'total_opportunities', COUNT(*) FILTER (
      WHERE fs."order" >= 2 
      AND fs.is_won IS DISTINCT FROM true 
      AND fs.is_lost IS DISTINCT FROM true
    ),
    'total_sales', COUNT(*) FILTER (WHERE fs.is_won = true),
    'conversion_rate', CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE fs.is_won = true)::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0 
    END,
    'average_ticket', COALESCE(ROUND(AVG(d.value) FILTER (WHERE fs.is_won = true), 2), 0)
  )
  FROM crm_deals d
  JOIN crm_funnel_stages fs ON d.stage_id = fs.id
  WHERE d.client_id = client_id_param
    AND (start_date IS NULL OR d.created_at::date >= start_date)
    AND (end_date IS NULL OR d.created_at::date <= end_date);
$$ LANGUAGE sql STABLE SECURITY DEFINER;