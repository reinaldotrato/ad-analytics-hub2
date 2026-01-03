-- Corrigir RLS nas tabelas services e suppliers
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;