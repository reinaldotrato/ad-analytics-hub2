-- Criar enum de roles para analytics
CREATE TYPE public.analytics_role AS ENUM ('admin', 'user');

-- Criar tabela de roles separada (seguindo best practices de segurança)
CREATE TABLE public.tryvia_analytics_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role analytics_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

-- Habilitar RLS
ALTER TABLE public.tryvia_analytics_user_roles ENABLE ROW LEVEL SECURITY;

-- Função security definer para verificar roles (evita recursão infinita)
CREATE OR REPLACE FUNCTION public.has_analytics_role(_user_id UUID, _role analytics_role)
RETURNS BOOLEAN
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

-- Policy: usuários podem ver suas próprias roles
CREATE POLICY "Users can view own roles"
ON public.tryvia_analytics_user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Policy: admins podem gerenciar todas as roles
CREATE POLICY "Admins can manage all roles"
ON public.tryvia_analytics_user_roles
FOR ALL TO authenticated
USING (public.has_analytics_role(auth.uid(), 'admin'))
WITH CHECK (public.has_analytics_role(auth.uid(), 'admin'));

-- Policy: permitir insert para novos usuários (durante signup)
CREATE POLICY "Users can insert own role on signup"
ON public.tryvia_analytics_user_roles
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());