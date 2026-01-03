-- Function to check database health
CREATE OR REPLACE FUNCTION public.check_database_health()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  idx_count INTEGER;
  rls_count INTEGER;
  view_count INTEGER;
  table_count INTEGER;
BEGIN
  -- Count performance indexes
  SELECT COUNT(*) INTO idx_count 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
  
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_count 
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  WHERE t.schemaname = 'public' 
    AND c.relrowsecurity = true;
  
  -- Count views
  SELECT COUNT(*) INTO view_count 
  FROM pg_views 
  WHERE schemaname = 'public';
  
  -- Count tables
  SELECT COUNT(*) INTO table_count 
  FROM pg_tables 
  WHERE schemaname = 'public';

  SELECT json_build_object(
    'indexes_count', idx_count,
    'rls_enabled_tables', rls_count,
    'views_count', view_count,
    'tables_count', table_count,
    'status', CASE 
      WHEN idx_count >= 5 AND rls_count >= 10 THEN 'healthy'
      WHEN idx_count >= 3 OR rls_count >= 5 THEN 'warning'
      ELSE 'critical'
    END,
    'checked_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION public.get_table_statistics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'table_name', relname,
      'row_count', n_live_tup,
      'dead_tuples', n_dead_tup,
      'last_vacuum', last_vacuum,
      'last_autovacuum', last_autovacuum,
      'last_analyze', last_analyze
    )
  )
  INTO result
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY n_live_tup DESC
  LIMIT 20;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Table for storing performance logs
CREATE TABLE IF NOT EXISTS public.system_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_performance_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view performance logs"
ON public.system_performance_logs
FOR SELECT
USING (public.has_analytics_role(auth.uid(), 'admin'));

-- Anyone can insert logs (for client-side monitoring)
CREATE POLICY "Users can insert performance logs"
ON public.system_performance_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_performance_logs_created_at 
ON public.system_performance_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_logs_metric_type 
ON public.system_performance_logs(metric_type);

-- Function to get performance summary
CREATE OR REPLACE FUNCTION public.get_performance_summary(hours_back INTEGER DEFAULT 24)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'avg_response_time', COALESCE(AVG(value) FILTER (WHERE metric_type = 'response_time'), 0),
    'avg_payload_size', COALESCE(AVG(value) FILTER (WHERE metric_type = 'payload_size'), 0),
    'total_queries', COUNT(*) FILTER (WHERE metric_type = 'query'),
    'error_count', COUNT(*) FILTER (WHERE metric_type = 'error'),
    'slow_queries', COUNT(*) FILTER (WHERE metric_type = 'response_time' AND value > 500),
    'period_start', NOW() - (hours_back || ' hours')::INTERVAL,
    'period_end', NOW()
  )
  INTO result
  FROM public.system_performance_logs
  WHERE created_at >= NOW() - (hours_back || ' hours')::INTERVAL;

  RETURN result;
END;
$$;

-- Function to log performance metric
CREATE OR REPLACE FUNCTION public.log_performance_metric(
  p_metric_type TEXT,
  p_metric_name TEXT,
  p_value NUMERIC,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.system_performance_logs (metric_type, metric_name, value, metadata, user_id)
  VALUES (p_metric_type, p_metric_name, p_value, p_metadata, auth.uid())
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;