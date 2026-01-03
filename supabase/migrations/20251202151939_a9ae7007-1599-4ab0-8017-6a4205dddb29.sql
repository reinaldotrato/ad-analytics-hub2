-- Enable RLS on tryvia_analytics_keywords if not enabled
ALTER TABLE public.tryvia_analytics_keywords ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read keywords based on their client_id
CREATE POLICY "Users can view keywords for their client"
ON public.tryvia_analytics_keywords
FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM tryvia_analytics_profiles WHERE id = auth.uid()
  )
);