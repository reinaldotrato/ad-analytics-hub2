-- Create table for loss reasons
CREATE TABLE public.crm_loss_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for client_id
CREATE INDEX idx_crm_loss_reasons_client_id ON public.crm_loss_reasons(client_id);

-- Enable RLS
ALTER TABLE public.crm_loss_reasons ENABLE ROW LEVEL SECURITY;

-- RLS policies for loss reasons
CREATE POLICY "Users can view loss reasons for their client" 
ON public.crm_loss_reasons 
FOR SELECT 
USING (public.has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert loss reasons for their client" 
ON public.crm_loss_reasons 
FOR INSERT 
WITH CHECK (public.has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update loss reasons for their client" 
ON public.crm_loss_reasons 
FOR UPDATE 
USING (public.has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can delete loss reasons for their client" 
ON public.crm_loss_reasons 
FOR DELETE 
USING (public.has_crm_client_access(auth.uid(), client_id));

-- Create trigger for updated_at
CREATE TRIGGER update_crm_loss_reasons_updated_at
BEFORE UPDATE ON public.crm_loss_reasons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();