-- Expandir enum analytics_role com novas roles de CRM
ALTER TYPE analytics_role ADD VALUE IF NOT EXISTS 'crm_admin';
ALTER TYPE analytics_role ADD VALUE IF NOT EXISTS 'crm_user';