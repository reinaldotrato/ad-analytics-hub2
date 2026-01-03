-- Create keywords table for Google Ads keyword-level metrics
CREATE TABLE tryvia_analytics_keywords (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES tryvia_analytics_clients(id),
  date DATE NOT NULL,
  keyword TEXT NOT NULL,
  campaign_name TEXT,
  match_type TEXT, -- exact, phrase, broad
  status TEXT DEFAULT 'active', -- active, paused, inactive
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  quality_score INTEGER, -- 1-10
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_keywords_client_date ON tryvia_analytics_keywords(client_id, date);
CREATE INDEX idx_keywords_campaign ON tryvia_analytics_keywords(campaign_name);