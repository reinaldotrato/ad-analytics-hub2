-- Add logo_url column to clients table
ALTER TABLE tryvia_analytics_clients 
ADD COLUMN IF NOT EXISTS logo_url TEXT NULL;