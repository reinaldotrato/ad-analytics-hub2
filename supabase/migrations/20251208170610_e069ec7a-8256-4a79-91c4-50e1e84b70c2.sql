-- Adicionar campo whatsapp à tabela tryvia_analytics_profiles
ALTER TABLE public.tryvia_analytics_profiles 
ADD COLUMN IF NOT EXISTS whatsapp text;