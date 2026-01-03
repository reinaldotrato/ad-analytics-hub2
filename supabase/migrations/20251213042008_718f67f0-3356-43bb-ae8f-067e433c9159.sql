-- Insert Eduzz table mappings for Menina Oficina client
INSERT INTO client_table_registry (client_id, channel, table_type, table_name)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'dashboard_summary', 'mo_dashboard_summary'),
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'metrics_by_product', 'mo_eduzz_metrics_by_product'),
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'invoices', 'mo_eduzz_invoices'),
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'metrics_daily', 'mo_eduzz_metrics_daily'),
  ('11111111-1111-1111-1111-111111111111', 'eduzz', 'summary', 'mo_eduzz_summary');