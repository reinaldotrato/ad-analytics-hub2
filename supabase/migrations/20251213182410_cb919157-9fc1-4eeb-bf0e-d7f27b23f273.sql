-- Create crm_funnels table
CREATE TABLE public.crm_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_funnels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_funnels
CREATE POLICY "Users can view funnels of their client"
ON public.crm_funnels FOR SELECT
USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert funnels"
ON public.crm_funnels FOR INSERT
WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update funnels"
ON public.crm_funnels FOR UPDATE
USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins can delete funnels"
ON public.crm_funnels FOR DELETE
USING (has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- Add funnel_id to crm_funnel_stages
ALTER TABLE public.crm_funnel_stages ADD COLUMN funnel_id UUID REFERENCES public.crm_funnels(id) ON DELETE CASCADE;

-- Create crm_products table
CREATE TABLE public.crm_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, code)
);

-- Enable RLS
ALTER TABLE public.crm_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_products
CREATE POLICY "Users can view products of their client"
ON public.crm_products FOR SELECT
USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert products"
ON public.crm_products FOR INSERT
WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update products"
ON public.crm_products FOR UPDATE
USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins can delete products"
ON public.crm_products FOR DELETE
USING (has_analytics_role(auth.uid(), 'admin'::analytics_role));

-- Add trigger for updated_at on crm_products
CREATE TRIGGER update_crm_products_updated_at
BEFORE UPDATE ON public.crm_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();