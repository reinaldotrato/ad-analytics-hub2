-- Adicionar colunas para status de integração e links N8N
ALTER TABLE tryvia_analytics_client_credentials
ADD COLUMN IF NOT EXISTS connection_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_sync_at timestamptz,
ADD COLUMN IF NOT EXISTS n8n_workflow_url text,
ADD COLUMN IF NOT EXISTS last_error_message text;

-- Atualizar credencial existente com status conectado
UPDATE tryvia_analytics_client_credentials 
SET connection_status = 'connected', 
    last_sync_at = now()
WHERE channel = 'meta_ads';