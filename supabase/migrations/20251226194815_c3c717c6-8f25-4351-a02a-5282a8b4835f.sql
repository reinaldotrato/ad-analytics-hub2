-- Create enum for ticket status
CREATE TYPE support_ticket_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES tryvia_analytics_clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  problem TEXT NOT NULL,
  status support_ticket_status DEFAULT 'pending',
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tickets OR admins can view all
CREATE POLICY "Users can view own tickets or admins view all"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_analytics_role(auth.uid(), 'admin'));

-- Policy: Authenticated users can create tickets
CREATE POLICY "Users can create tickets"
  ON public.support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Only admins can update tickets
CREATE POLICY "Admins can update tickets"
  ON public.support_tickets
  FOR UPDATE
  TO authenticated
  USING (has_analytics_role(auth.uid(), 'admin'));

-- Policy: Only admins can delete tickets
CREATE POLICY "Admins can delete tickets"
  ON public.support_tickets
  FOR DELETE
  TO authenticated
  USING (has_analytics_role(auth.uid(), 'admin'));

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  today_count INTEGER;
  today_date TEXT;
BEGIN
  today_date := to_char(NOW(), 'YYYYMMDD');
  
  SELECT COUNT(*) + 1 INTO today_count
  FROM public.support_tickets
  WHERE ticket_number LIKE 'TKT-' || today_date || '-%';
  
  NEW.ticket_number := 'TKT-' || today_date || '-' || LPAD(today_count::TEXT, 3, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate ticket number
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();