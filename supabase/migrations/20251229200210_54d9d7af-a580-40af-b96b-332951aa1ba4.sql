-- Corrigir views para usar SECURITY INVOKER (padrão seguro)
-- Isso garante que as views respeitam as permissões do usuário que consulta

ALTER VIEW v_meta_ads_daily_summary SET (security_invoker = true);
ALTER VIEW v_meta_campaigns_summary SET (security_invoker = true);
ALTER VIEW v_google_ads_daily_summary SET (security_invoker = true);
ALTER VIEW v_crm_funnel_metrics SET (security_invoker = true);