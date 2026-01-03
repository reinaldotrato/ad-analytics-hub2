-- Remover o trigger problemático que tenta inserir na tabela profiles
-- Este trigger estava causando erro "record new has no field id"
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Opcional: podemos manter a função caso seja necessária no futuro
-- DROP FUNCTION IF EXISTS public.handle_new_user();
