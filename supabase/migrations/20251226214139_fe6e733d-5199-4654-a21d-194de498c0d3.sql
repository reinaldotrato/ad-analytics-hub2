
-- =====================================================
-- FASE 1: CORREÇÕES DE SEGURANÇA
-- =====================================================

-- 1. Corrigir policy do client_table_registry (remover acesso público)
DROP POLICY IF EXISTS "Anyone can read table registry" ON public.client_table_registry;

CREATE POLICY "Authenticated users can read table registry" 
ON public.client_table_registry 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Corrigir função get_crm_overview_metrics (versão com parâmetros de data que está sem search_path)
CREATE OR REPLACE FUNCTION public.get_crm_overview_metrics(client_id_param uuid, start_date date DEFAULT NULL::date, end_date date DEFAULT NULL::date)
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 3. Corrigir função mo_eduzz_upsert_invoice (adicionar search_path)
CREATE OR REPLACE FUNCTION public.mo_eduzz_upsert_invoice(
  p_invoice_id text, 
  p_status text, 
  p_buyer_name text, 
  p_buyer_email text, 
  p_buyer_phone text, 
  p_product_id text, 
  p_product_name text, 
  p_product_type text, 
  p_valor_item numeric, 
  p_ganho numeric, 
  p_parcelas integer, 
  p_created_at timestamp with time zone, 
  p_paid_at timestamp with time zone, 
  p_is_abandonment boolean, 
  p_raw_data jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO mo_eduzz_invoices (
    invoice_id, status, buyer_name, buyer_email, buyer_phone,
    product_id, product_name, product_type,
    valor_item, ganho, parcelas,
    created_at, paid_at, is_abandonment, raw_data
  ) VALUES (
    p_invoice_id, p_status, p_buyer_name, p_buyer_email, p_buyer_phone,
    p_product_id, p_product_name, p_product_type,
    p_valor_item, p_ganho, p_parcelas,
    p_created_at, p_paid_at, p_is_abandonment, p_raw_data
  )
  ON CONFLICT (invoice_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    paid_at = COALESCE(EXCLUDED.paid_at, mo_eduzz_invoices.paid_at),
    ganho = COALESCE(EXCLUDED.ganho, mo_eduzz_invoices.ganho),
    raw_data = EXCLUDED.raw_data,
    received_at = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$function$;
