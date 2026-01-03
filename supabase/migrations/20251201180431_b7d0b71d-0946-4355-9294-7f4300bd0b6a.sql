-- Remover trigger que conflita com signup do Trato Analytics (na tabela auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created_billing ON auth.users;

-- Remover trigger antigo do gestão de tarefas (caso ainda exista na tabela auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover trigger na tabela gestao_tarefas_billing_settings que depende da função
DROP TRIGGER IF EXISTS create_default_activities_trigger ON gestao_tarefas_billing_settings;

-- Agora podemos remover as funções com CASCADE
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_activities() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_billing_settings() CASCADE;