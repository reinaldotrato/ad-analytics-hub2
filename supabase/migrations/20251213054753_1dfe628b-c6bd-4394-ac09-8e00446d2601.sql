-- Insert default funnel stages for "Menina Oficina" client
INSERT INTO public.crm_funnel_stages (client_id, name, "order", color, is_won, is_lost)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Novo Lead', 0, '#3B82F6', false, false),
  ('11111111-1111-1111-1111-111111111111', 'Qualificação', 1, '#8B5CF6', false, false),
  ('11111111-1111-1111-1111-111111111111', 'Proposta', 2, '#F59E0B', false, false),
  ('11111111-1111-1111-1111-111111111111', 'Negociação', 3, '#EC4899', false, false),
  ('11111111-1111-1111-1111-111111111111', 'Fechado Ganho', 4, '#10B981', true, false),
  ('11111111-1111-1111-1111-111111111111', 'Fechado Perdido', 5, '#EF4444', false, true)
ON CONFLICT DO NOTHING;