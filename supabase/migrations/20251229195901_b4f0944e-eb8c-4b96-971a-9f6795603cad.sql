-- =============================================
-- FASE 1: Índices de Performance para Queries Otimizadas
-- =============================================

-- Índices para dm_google_ad_metrics
CREATE INDEX IF NOT EXISTS idx_google_ad_metrics_client_date 
ON dm_google_ad_metrics(client_id, date);

CREATE INDEX IF NOT EXISTS idx_google_ad_metrics_campaign 
ON dm_google_ad_metrics(campaign_name, date);

-- Índices para dm_meta_ads
CREATE INDEX IF NOT EXISTS idx_meta_ads_account_date 
ON dm_meta_ads(account_id, date_start, date_end);

CREATE INDEX IF NOT EXISTS idx_meta_ads_campaign 
ON dm_meta_ads(campaign_id, date_start);

CREATE INDEX IF NOT EXISTS idx_meta_ads_adset 
ON dm_meta_ads(adset_id, date_start);

-- Índices para dm_meta_adsets
CREATE INDEX IF NOT EXISTS idx_meta_adsets_account_date 
ON dm_meta_adsets(account_id, date_start, date_end);

CREATE INDEX IF NOT EXISTS idx_meta_adsets_campaign 
ON dm_meta_adsets(campaign_id, date_start);

-- Índices para dm_meta_campaigns
CREATE INDEX IF NOT EXISTS idx_meta_campaigns_account_date 
ON dm_meta_campaigns(account_id, date_start, date_end);

-- Índices para dm_meta_ads_breakdowns
CREATE INDEX IF NOT EXISTS idx_meta_breakdowns_account_date 
ON dm_meta_ads_breakdowns(account_id, date_start, date_end);

-- Índices para dm_meta_campaigns_breakdowns
CREATE INDEX IF NOT EXISTS idx_meta_campaigns_breakdowns_account_date 
ON dm_meta_campaigns_breakdowns(account_id, date_start, date_end);

CREATE INDEX IF NOT EXISTS idx_meta_campaigns_breakdowns_campaign 
ON dm_meta_campaigns_breakdowns(campaign_id, date_start);

-- Índices para dm_google_keywords
CREATE INDEX IF NOT EXISTS idx_google_keywords_client_date 
ON dm_google_keywords(client_id, date);

-- Índices para crm_deals (otimização de queries por período)
CREATE INDEX IF NOT EXISTS idx_crm_deals_client_created 
ON crm_deals(client_id, created_at);

CREATE INDEX IF NOT EXISTS idx_crm_deals_client_stage 
ON crm_deals(client_id, stage_id);

CREATE INDEX IF NOT EXISTS idx_crm_deals_client_source 
ON crm_deals(client_id, source);

-- =============================================
-- FASE 3: Views de Agregação SQL
-- =============================================

-- View para KPIs diários consolidados de Meta Ads
CREATE OR REPLACE VIEW v_meta_ads_daily_summary AS
SELECT 
  account_id,
  date_start,
  SUM(spend) as total_spend,
  SUM(impressions) as total_impressions,
  SUM(reach) as total_reach,
  SUM(results) as total_results,
  SUM(leads) as total_leads,
  SUM(conversions) as total_conversions,
  SUM(messages) as total_messages,
  SUM(page_views) as total_page_views,
  CASE WHEN SUM(results) > 0 
    THEN SUM(spend) / SUM(results) 
    ELSE 0 
  END as avg_cpr,
  CASE WHEN SUM(leads) > 0 
    THEN SUM(spend) / SUM(leads) 
    ELSE 0 
  END as avg_cpl
FROM dm_meta_ads
GROUP BY account_id, date_start;

-- View para agregação por campanha Meta Ads
CREATE OR REPLACE VIEW v_meta_campaigns_summary AS
SELECT 
  account_id,
  campaign_id,
  MIN(campaign_name) as campaign_name,
  MIN(objective) as objective,
  MIN(effective_status) as status,
  MIN(date_start) as period_start,
  MAX(date_end) as period_end,
  SUM(spend) as total_spend,
  SUM(impressions) as total_impressions,
  SUM(reach) as total_reach,
  SUM(results) as total_results,
  SUM(leads) as total_leads,
  SUM(messages) as total_messages,
  SUM(page_views) as total_page_views,
  SUM(conversions) as total_conversions,
  CASE WHEN SUM(results) > 0 
    THEN SUM(spend) / SUM(results) 
    ELSE NULL 
  END as cost_per_result,
  CASE WHEN SUM(conversions) > 0 
    THEN SUM(spend) / SUM(conversions) 
    ELSE NULL 
  END as cost_per_conversion
FROM dm_meta_campaigns
GROUP BY account_id, campaign_id;

-- View para KPIs diários consolidados de Google Ads
CREATE OR REPLACE VIEW v_google_ads_daily_summary AS
SELECT 
  client_id,
  date,
  SUM(cost) as total_cost,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  SUM(conversions) as total_conversions,
  SUM(leads) as total_leads,
  CASE WHEN SUM(clicks) > 0 
    THEN SUM(cost) / SUM(clicks) 
    ELSE 0 
  END as avg_cpc,
  CASE WHEN SUM(impressions) > 0 
    THEN (SUM(clicks)::numeric / SUM(impressions)) * 100 
    ELSE 0 
  END as ctr
FROM dm_google_ad_metrics
GROUP BY client_id, date;

-- View para métricas do funil CRM
CREATE OR REPLACE VIEW v_crm_funnel_metrics AS
SELECT 
  d.client_id,
  DATE_TRUNC('day', d.created_at)::date as date,
  d.source,
  COUNT(*) as total_deals,
  COUNT(*) FILTER (WHERE fs.is_won IS NOT TRUE AND fs.is_lost IS NOT TRUE) as open_deals,
  COUNT(*) FILTER (WHERE fs.is_won = true) as won_deals,
  COUNT(*) FILTER (WHERE fs.is_lost = true) as lost_deals,
  COALESCE(SUM(d.value), 0) as total_value,
  COALESCE(SUM(d.value) FILTER (WHERE fs.is_won = true), 0) as won_value,
  COALESCE(SUM(d.value) FILTER (WHERE fs.is_lost = true), 0) as lost_value
FROM crm_deals d
LEFT JOIN crm_funnel_stages fs ON d.stage_id = fs.id
GROUP BY d.client_id, DATE_TRUNC('day', d.created_at)::date, d.source;

-- =============================================
-- FASE 4: Funções RPC para Agregações Otimizadas
-- =============================================

-- Função para KPIs consolidados de Meta Ads por período
CREATE OR REPLACE FUNCTION get_meta_ads_kpis(
  p_account_id TEXT,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_spend NUMERIC,
  total_impressions BIGINT,
  total_reach BIGINT,
  total_results INTEGER,
  total_leads INTEGER,
  total_messages INTEGER,
  total_page_views INTEGER,
  avg_cpr NUMERIC,
  avg_cpl NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(spend), 0)::NUMERIC,
    COALESCE(SUM(impressions), 0)::BIGINT,
    COALESCE(SUM(reach), 0)::BIGINT,
    COALESCE(SUM(results), 0)::INTEGER,
    COALESCE(SUM(leads), 0)::INTEGER,
    COALESCE(SUM(messages), 0)::INTEGER,
    COALESCE(SUM(page_views), 0)::INTEGER,
    CASE WHEN SUM(results) > 0 THEN SUM(spend) / SUM(results) ELSE 0 END,
    CASE WHEN SUM(leads) > 0 THEN SUM(spend) / SUM(leads) ELSE 0 END
  FROM dm_meta_campaigns
  WHERE account_id = p_account_id
    AND date_start >= p_start_date
    AND date_end <= p_end_date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Função para KPIs consolidados de Google Ads por período
CREATE OR REPLACE FUNCTION get_google_ads_kpis(
  p_client_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_cost NUMERIC,
  total_impressions BIGINT,
  total_clicks BIGINT,
  total_conversions INTEGER,
  total_leads INTEGER,
  avg_cpc NUMERIC,
  ctr NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(cost), 0)::NUMERIC,
    COALESCE(SUM(impressions), 0)::BIGINT,
    COALESCE(SUM(clicks), 0)::BIGINT,
    COALESCE(SUM(conversions), 0)::INTEGER,
    COALESCE(SUM(leads), 0)::INTEGER,
    CASE WHEN SUM(clicks) > 0 THEN SUM(cost) / SUM(clicks) ELSE 0 END,
    CASE WHEN SUM(impressions) > 0 THEN (SUM(clicks)::NUMERIC / SUM(impressions)) * 100 ELSE 0 END
  FROM dm_google_ad_metrics
  WHERE client_id = p_client_id
    AND date >= p_start_date
    AND date <= p_end_date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Função para métricas do CRM por período
CREATE OR REPLACE FUNCTION get_crm_period_metrics(
  p_client_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_deals BIGINT,
  open_deals BIGINT,
  won_deals BIGINT,
  lost_deals BIGINT,
  total_value NUMERIC,
  won_value NUMERIC,
  lost_value NUMERIC,
  avg_ticket NUMERIC,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH stage_info AS (
    SELECT id, is_won, is_lost FROM crm_funnel_stages WHERE client_id = p_client_id
  ),
  deal_stats AS (
    SELECT 
      COUNT(*)::BIGINT as total,
      COUNT(*) FILTER (WHERE si.is_won IS NOT TRUE AND si.is_lost IS NOT TRUE)::BIGINT as open_cnt,
      COUNT(*) FILTER (WHERE si.is_won = true)::BIGINT as won_cnt,
      COUNT(*) FILTER (WHERE si.is_lost = true)::BIGINT as lost_cnt,
      COALESCE(SUM(d.value), 0)::NUMERIC as total_val,
      COALESCE(SUM(d.value) FILTER (WHERE si.is_won = true), 0)::NUMERIC as won_val,
      COALESCE(SUM(d.value) FILTER (WHERE si.is_lost = true), 0)::NUMERIC as lost_val
    FROM crm_deals d
    LEFT JOIN stage_info si ON d.stage_id = si.id
    WHERE d.client_id = p_client_id
      AND d.created_at::date >= p_start_date
      AND d.created_at::date <= p_end_date
  )
  SELECT 
    ds.total,
    ds.open_cnt,
    ds.won_cnt,
    ds.lost_cnt,
    ds.total_val,
    ds.won_val,
    ds.lost_val,
    CASE WHEN ds.won_cnt > 0 THEN ds.won_val / ds.won_cnt ELSE 0 END,
    CASE WHEN (ds.won_cnt + ds.lost_cnt) > 0 
      THEN (ds.won_cnt::NUMERIC / (ds.won_cnt + ds.lost_cnt)) * 100 
      ELSE 0 
    END
  FROM deal_stats ds;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;