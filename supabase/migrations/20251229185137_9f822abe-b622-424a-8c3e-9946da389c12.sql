-- Adicionar novos valores ao enum analytics_role
ALTER TYPE analytics_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE analytics_role ADD VALUE IF NOT EXISTS 'seller';