-- Drop and recreate get_table_statistics function
DROP FUNCTION IF EXISTS public.get_table_statistics();

CREATE OR REPLACE FUNCTION public.get_table_statistics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT has_analytics_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  SELECT json_agg(row_data)
  INTO result
  FROM (
    SELECT 
      pst.relname::text as table_name,
      pst.n_live_tup as row_count,
      pst.n_dead_tup as dead_tuples,
      pst.last_vacuum,
      pst.last_autovacuum,
      pst.last_analyze
    FROM pg_stat_user_tables pst
    WHERE pst.schemaname = 'public'
    ORDER BY pst.n_live_tup DESC
    LIMIT 20
  ) row_data;

  RETURN COALESCE(result, '[]'::json);
END;
$$;