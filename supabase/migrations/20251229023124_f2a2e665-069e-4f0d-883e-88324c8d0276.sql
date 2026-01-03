-- =============================================
-- Custom Fields
-- =============================================

-- Table for custom field definitions
CREATE TABLE crm_custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES tryvia_analytics_clients(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('deal', 'contact', 'company')),
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'checkbox')),
  options JSONB DEFAULT '[]',
  is_required BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE crm_custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view custom fields of their client"
  ON crm_custom_field_definitions FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert custom fields for their client"
  ON crm_custom_field_definitions FOR INSERT
  WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can update custom fields for their client"
  ON crm_custom_field_definitions FOR UPDATE
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Admins can delete custom fields"
  ON crm_custom_field_definitions FOR DELETE
  USING (has_analytics_role(auth.uid(), 'admin'::analytics_role) OR has_analytics_role(auth.uid(), 'crm_admin'::analytics_role));

-- Add custom_fields column to crm_deals
ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- =============================================
-- File Uploads
-- =============================================

-- Create storage bucket for CRM files (5MB limit, specific MIME types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crm-files',
  'crm-files',
  false,
  5242880,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Table for deal file references
CREATE TABLE crm_deal_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES tryvia_analytics_clients(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE crm_deal_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal files
CREATE POLICY "Users can view deal files of their client"
  ON crm_deal_files FOR SELECT
  USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can insert deal files for their client"
  ON crm_deal_files FOR INSERT
  WITH CHECK (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Users can delete deal files for their client"
  ON crm_deal_files FOR DELETE
  USING (has_crm_client_access(auth.uid(), client_id));

-- Storage policies for crm-files bucket
CREATE POLICY "Users can upload CRM files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'crm-files');

CREATE POLICY "Users can view CRM files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'crm-files');

CREATE POLICY "Users can delete CRM files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'crm-files');