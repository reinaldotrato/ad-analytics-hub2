-- Atualizar profile para o ID correto do JWT
UPDATE tryvia_analytics_profiles 
SET id = 'a4b81c8f-2a14-472d-a2e2-a9d017f8726a'
WHERE email = 'reinaldovalente@tratomkt.com.br';

-- Atualizar user_roles para o ID correto do JWT
UPDATE tryvia_analytics_user_roles 
SET user_id = 'a4b81c8f-2a14-472d-a2e2-a9d017f8726a'
WHERE user_id = 'e56c8e39-aded-4afa-906c-f4c01123e672';

-- Garantir que o role é admin
INSERT INTO tryvia_analytics_user_roles (user_id, role)
VALUES ('a4b81c8f-2a14-472d-a2e2-a9d017f8726a', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';