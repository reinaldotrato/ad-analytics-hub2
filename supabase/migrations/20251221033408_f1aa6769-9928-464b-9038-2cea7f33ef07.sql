-- Drop the existing view
DROP VIEW IF EXISTS mo_dashboard_summary;

-- Create a real table for storing cached dashboard summary
CREATE TABLE mo_dashboard_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rd_period TEXT NOT NULL,
  leads_rd_station INTEGER DEFAULT 0,
  funil_leads INTEGER DEFAULT 0,
  funil_oportunidades INTEGER DEFAULT 0,
  funil_vendas INTEGER DEFAULT 0,
  eduzz_receita_bruta NUMERIC(12,2) DEFAULT 0,
  eduzz_receita_liquida NUMERIC(12,2) DEFAULT 0,
  eduzz_vendas INTEGER DEFAULT 0,
  eduzz_tentativas INTEGER DEFAULT 0,
  taxa_lead_to_checkout NUMERIC(6,2) DEFAULT 0,
  taxa_checkout_to_sale NUMERIC(6,2) DEFAULT 0,
  taxa_lead_to_sale NUMERIC(6,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT mo_dashboard_summary_rd_period_unique UNIQUE (rd_period)
);

-- Enable RLS
ALTER TABLE mo_dashboard_summary ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read access" 
ON mo_dashboard_summary 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow service role full access (for edge function updates)
CREATE POLICY "Allow service role full access" 
ON mo_dashboard_summary 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create index for faster period lookups
CREATE INDEX mo_dashboard_summary_period_idx ON mo_dashboard_summary(rd_period);

-- Insert initial data based on the old view logic
INSERT INTO mo_dashboard_summary (
  rd_period,
  leads_rd_station,
  funil_leads,
  funil_oportunidades,
  funil_vendas,
  eduzz_receita_bruta,
  eduzz_receita_liquida,
  eduzz_vendas,
  eduzz_tentativas,
  taxa_lead_to_checkout,
  taxa_checkout_to_sale,
  taxa_lead_to_sale,
  last_updated
)
SELECT 
  COALESCE(rd.period, '2025-11') as rd_period,
  COALESCE(rd.total_leads, 0) AS leads_rd_station,
  COALESCE(rd.total_leads, 0) AS funil_leads,
  COALESCE(edz.total_tentativas, 0) AS funil_oportunidades,
  COALESCE(edz.total_vendas, 0) AS funil_vendas,
  COALESCE(edz.receita_bruta_total, 0)::NUMERIC(12,2) AS eduzz_receita_bruta,
  COALESCE(edz.receita_liquida_total, 0)::NUMERIC(12,2) AS eduzz_receita_liquida,
  COALESCE(edz.total_vendas, 0) AS eduzz_vendas,
  COALESCE(edz.total_tentativas, 0) AS eduzz_tentativas,
  CASE WHEN COALESCE(rd.total_leads, 0) > 0 
    THEN ROUND(COALESCE(edz.total_tentativas, 0)::NUMERIC / rd.total_leads::NUMERIC * 100, 2)
    ELSE 0 
  END AS taxa_lead_to_checkout,
  CASE WHEN COALESCE(edz.total_tentativas, 0) > 0 
    THEN ROUND(COALESCE(edz.total_vendas, 0)::NUMERIC / edz.total_tentativas::NUMERIC * 100, 2)
    ELSE 0 
  END AS taxa_checkout_to_sale,
  CASE WHEN COALESCE(rd.total_leads, 0) > 0 
    THEN ROUND(COALESCE(edz.total_vendas, 0)::NUMERIC / rd.total_leads::NUMERIC * 100, 2)
    ELSE 0 
  END AS taxa_lead_to_sale,
  now() AS last_updated
FROM 
  (SELECT * FROM mo_rdstation_metrics WHERE period = '2025-11' LIMIT 1) rd,
  mo_eduzz_summary edz
ON CONFLICT (rd_period) DO NOTHING;