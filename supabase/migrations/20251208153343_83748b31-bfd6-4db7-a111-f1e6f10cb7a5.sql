-- Passo 1: Corrigir profile do reinaldovalente@tratomkt.com.br
UPDATE tryvia_analytics_profiles 
SET id = 'e56c8e39-aded-4afa-906c-f4c01123e672'
WHERE email = 'reinaldovalente@tratomkt.com.br';

-- Passo 2: Corrigir role do reinaldovalente@tratomkt.com.br
UPDATE tryvia_analytics_user_roles 
SET user_id = 'e56c8e39-aded-4afa-906c-f4c01123e672'
WHERE user_id = '19260c2e-c5d8-439a-851b-4b867978cb4c';

-- Passo 3: Criar profile para mkt.reinaldo@gmail.com
INSERT INTO tryvia_analytics_profiles (id, email, role, client_id, password_hash)
SELECT 
  'b339cb5a-30fd-485f-bfba-122f826658a2',
  'mkt.reinaldo@gmail.com',
  'admin',
  client_id,
  'supabase_auth'
FROM tryvia_analytics_profiles 
WHERE email = 'reinaldovalente@tratomkt.com.br'
ON CONFLICT (id) DO NOTHING;

-- Passo 4: Criar role admin para mkt.reinaldo@gmail.com
INSERT INTO tryvia_analytics_user_roles (user_id, role)
VALUES ('b339cb5a-30fd-485f-bfba-122f826658a2', 'admin')
ON CONFLICT (user_id) DO NOTHING;