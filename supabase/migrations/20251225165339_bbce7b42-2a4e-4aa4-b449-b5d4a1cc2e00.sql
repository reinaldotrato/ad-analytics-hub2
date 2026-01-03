-- Add task_type and duration_minutes columns to crm_tasks
ALTER TABLE crm_tasks 
ADD COLUMN IF NOT EXISTS task_type text DEFAULT 'call' CHECK (task_type IN ('call', 'meeting', 'whatsapp')),
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 30 CHECK (duration_minutes IN (5, 10, 15, 30, 45, 60, 120));