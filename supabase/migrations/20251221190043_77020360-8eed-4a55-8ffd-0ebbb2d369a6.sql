-- =====================================================
-- Migration: Registrar tabelas de breakdown do Meta Ads
-- Cliente: Menina Oficina (11111111-1111-1111-1111-111111111111)
-- =====================================================

-- Inserir registros das tabelas de breakdown específicas
INSERT INTO client_table_registry (client_id, channel, table_type, table_name)
VALUES 
  -- Plataforma (Facebook, Instagram, Audience Network) + Posição
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'campaign_platform', 'mo_meta_campaign_platform'),
  
  -- Gênero (male, female, unknown)
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'campaign_gender', 'mo_meta_campaign_gender'),
  
  -- Faixa Etária + Gênero (18-24, 25-34, 35-44, etc.)
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'campaign_age_gender', 'mo_meta_campaign_age_gender'),
  
  -- Região/Estado (São Paulo, Rio de Janeiro, etc.)
  ('11111111-1111-1111-1111-111111111111', 'meta_ads', 'campaign_region', 'mo_meta_campaign_region')
ON CONFLICT (client_id, channel, table_type) DO UPDATE 
SET table_name = EXCLUDED.table_name;