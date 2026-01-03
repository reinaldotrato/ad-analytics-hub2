-- 1. Adicionar constraint UNIQUE apenas em user_id para permitir ON CONFLICT funcionar
ALTER TABLE public.tryvia_analytics_user_roles 
ADD CONSTRAINT tryvia_analytics_user_roles_user_id_unique UNIQUE (user_id);

-- 2. Corrigir usuário existente: consultorreinaldo@hotmail.com
-- Criar profile (se não existir)
INSERT INTO public.tryvia_analytics_profiles (id, email, client_id, whatsapp, password_hash)
VALUES (
  '42493e3c-256f-4f74-9881-87acf6ebf4f9',
  'consultorreinaldo@hotmail.com',
  'b8fb2ee4-069f-4cfc-b226-cc665cf50df2',
  '91992002607',
  'managed_by_auth'
)
ON CONFLICT (id) DO NOTHING;

-- Criar role (se não existir)
INSERT INTO public.tryvia_analytics_user_roles (user_id, role)
VALUES ('42493e3c-256f-4f74-9881-87acf6ebf4f9', 'crm_user')
ON CONFLICT (user_id) DO NOTHING;

-- Criar seller (se não existir)
INSERT INTO public.crm_sellers (id, client_id, name, email, phone, is_active)
VALUES (
  '42493e3c-256f-4f74-9881-87acf6ebf4f9',
  'b8fb2ee4-069f-4cfc-b226-cc665cf50df2',
  'Reinaldo',
  'consultorreinaldo@hotmail.com',
  '91992002607',
  true
)
ON CONFLICT (id) DO NOTHING;