-- 1. Add new columns to crm_deals
ALTER TABLE crm_deals
ADD COLUMN IF NOT EXISTS days_without_interaction integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES crm_sellers(id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';

-- Add check constraint for status
DO $$ BEGIN
  ALTER TABLE crm_deals ADD CONSTRAINT crm_deals_status_check 
    CHECK (status IN ('open', 'won', 'lost'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add new columns to crm_companies
ALTER TABLE crm_companies
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS city text;

-- 3. Add new column to crm_contacts
ALTER TABLE crm_contacts
ADD COLUMN IF NOT EXISTS mobile_phone text;

-- 4. Create junction table for deal products
CREATE TABLE IF NOT EXISTS crm_deal_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES crm_products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  unit_price numeric DEFAULT 0,
  client_id uuid NOT NULL REFERENCES tryvia_analytics_clients(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(deal_id, product_id)
);

-- Enable RLS on deal_products
ALTER TABLE crm_deal_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_deal_products
CREATE POLICY "Users can view deal products of their client"
ON crm_deal_products FOR SELECT
USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert deal products"
ON crm_deal_products FOR INSERT
WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update deal products"
ON crm_deal_products FOR UPDATE
USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can delete deal products"
ON crm_deal_products FOR DELETE
USING (has_crm_client_access(auth.uid(), client_id));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_crm_deal_products_deal_id ON crm_deal_products(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_deal_products_product_id ON crm_deal_products(product_id);