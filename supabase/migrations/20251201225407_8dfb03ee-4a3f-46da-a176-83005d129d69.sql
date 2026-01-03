-- Enable RLS on keywords table (consistent with other analytics tables that don't have RLS for simplicity)
-- Note: This project uses application-level security via client_id filtering
-- If you need row-level security, uncomment the following lines:

-- ALTER TABLE tryvia_analytics_keywords ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view keywords for their client"
--   ON tryvia_analytics_keywords FOR SELECT
--   USING (
--     client_id IN (
--       SELECT client_id FROM tryvia_analytics_profiles
--       WHERE id = auth.uid()
--     )
--   );

-- For now, keep consistent with other tryvia_analytics tables (no RLS)