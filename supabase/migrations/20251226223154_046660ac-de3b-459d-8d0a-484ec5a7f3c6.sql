-- =====================================================
-- FASE 2: OTIMIZAÇÕES DE PERFORMANCE
-- =====================================================

-- 1. Criar view para deals com contagem de tasks pendentes (evita join no frontend)
CREATE OR REPLACE VIEW crm_deals_with_pending_tasks AS
SELECT 
  d.*,
  COALESCE(
    (SELECT COUNT(*) FROM crm_tasks t 
     WHERE t.deal_id = d.id AND t.completed = false), 
    0
  )::integer as pending_tasks_count
FROM crm_deals d;

-- Habilitar RLS na view usando security_invoker
ALTER VIEW crm_deals_with_pending_tasks SET (security_invoker = on);

-- 2. Criar índices compostos para queries frequentes

-- Índice para filtrar deals por client + status (usado no Kanban)
CREATE INDEX IF NOT EXISTS idx_crm_deals_client_status 
ON crm_deals(client_id, status);

-- Índice para filtrar deals por client + stage (usado em filtros)
CREATE INDEX IF NOT EXISTS idx_crm_deals_client_stage 
ON crm_deals(client_id, stage_id);

-- Índice para contagem de tasks pendentes por deal
CREATE INDEX IF NOT EXISTS idx_crm_tasks_deal_completed 
ON crm_tasks(deal_id, completed);

-- Índice para timeline por deal ordenado por data
CREATE INDEX IF NOT EXISTS idx_crm_timeline_deal_created 
ON crm_timeline_events(deal_id, created_at DESC);

-- Índice para deals por assigned_to (relatórios por vendedor)
CREATE INDEX IF NOT EXISTS idx_crm_deals_assigned 
ON crm_deals(client_id, assigned_to_id);

-- Índice para tasks por assigned_to e due_date (calendário)
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned_due 
ON crm_tasks(client_id, assigned_to_id, due_date);