-- Função para criar cliente e profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_analytics_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_client_id uuid;
  client_name_value text;
  whatsapp_value text;
BEGIN
  -- Extrair dados do user_metadata
  client_name_value := NEW.raw_user_meta_data->>'client_name';
  whatsapp_value := NEW.raw_user_meta_data->>'whatsapp_number';
  
  -- Criar cliente
  INSERT INTO tryvia_analytics_clients (name, whatsapp_number)
  VALUES (COALESCE(client_name_value, 'Novo Cliente'), whatsapp_value)
  RETURNING id INTO new_client_id;
  
  -- Criar profile
  INSERT INTO tryvia_analytics_profiles (id, email, client_id, password_hash, role, whatsapp)
  VALUES (NEW.id, NEW.email, new_client_id, 'managed_by_supabase_auth', 'viewer', whatsapp_value);
  
  -- Criar role inicial (user)
  INSERT INTO tryvia_analytics_user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger que executa após criação de usuário no auth
DROP TRIGGER IF EXISTS on_auth_user_created_analytics ON auth.users;
CREATE TRIGGER on_auth_user_created_analytics
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_analytics_user();