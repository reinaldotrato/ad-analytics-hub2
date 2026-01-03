-- Add campaign_status column to track real campaign status from Google Ads
ALTER TABLE tryvia_analytics_ad_metrics 
ADD COLUMN IF NOT EXISTS campaign_status text DEFAULT 'ENABLED';

-- Add comment to document the column
COMMENT ON COLUMN tryvia_analytics_ad_metrics.campaign_status IS 'Campaign status from Google Ads: ENABLED, PAUSED, REMOVED';