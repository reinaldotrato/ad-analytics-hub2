-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create updated function that only creates records when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_new_analytics_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_client_id uuid;
  v_role text;
  v_whatsapp text;
  v_is_seller boolean;
  v_name text;
  v_phone text;
BEGIN
  -- For UPDATE: Only proceed when email is just being confirmed (user accepted invite)
  IF TG_OP = 'UPDATE' THEN
    -- Check if email was just confirmed
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
      -- User just confirmed their email - NOW create the records
      v_client_id := (NEW.raw_user_meta_data->>'client_id')::uuid;
      v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
      v_whatsapp := NEW.raw_user_meta_data->>'whatsapp';
      v_is_seller := COALESCE((NEW.raw_user_meta_data->>'is_seller')::boolean, false);
      v_name := NEW.raw_user_meta_data->>'name';
      v_phone := NEW.raw_user_meta_data->>'phone';

      -- Only proceed if client_id is present (indicates this is a managed user)
      IF v_client_id IS NOT NULL THEN
        -- Create profile
        INSERT INTO public.tryvia_analytics_profiles (id, email, client_id, whatsapp, password_hash)
        VALUES (
          NEW.id,
          NEW.email,
          v_client_id,
          COALESCE(v_whatsapp, v_phone),
          'managed_by_auth'
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          client_id = COALESCE(EXCLUDED.client_id, tryvia_analytics_profiles.client_id),
          whatsapp = COALESCE(EXCLUDED.whatsapp, tryvia_analytics_profiles.whatsapp);
        
        -- Create role
        INSERT INTO public.tryvia_analytics_user_roles (user_id, role)
        VALUES (NEW.id, v_role::analytics_role)
        ON CONFLICT (user_id) DO NOTHING;

        -- If this is a seller, also create the seller record
        IF v_is_seller = true THEN
          INSERT INTO public.crm_sellers (id, client_id, name, email, phone, is_active)
          VALUES (
            NEW.id,
            v_client_id,
            COALESCE(v_name, split_part(NEW.email, '@', 1)),
            NEW.email,
            v_phone,
            true
          )
          ON CONFLICT (id) DO NOTHING;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger to fire on INSERT OR UPDATE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_analytics_user();