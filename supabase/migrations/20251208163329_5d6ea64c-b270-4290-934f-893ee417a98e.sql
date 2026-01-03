-- Add 'analyst' value to the analytics_role enum
ALTER TYPE analytics_role ADD VALUE 'analyst';

-- Update the has_analytics_role function to handle the new role
CREATE OR REPLACE FUNCTION public.has_analytics_role(_user_id uuid, _role analytics_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tryvia_analytics_user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;