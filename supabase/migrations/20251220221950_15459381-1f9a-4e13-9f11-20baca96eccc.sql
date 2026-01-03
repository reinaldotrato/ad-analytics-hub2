-- Remove Eduzz tables from lo_, sm_, ac_ clients (keep only mo_)

-- Drop physical tables
DROP TABLE IF EXISTS public.lo_eduzz_invoices CASCADE;
DROP TABLE IF EXISTS public.lo_eduzz_metrics_by_product CASCADE;
DROP TABLE IF EXISTS public.lo_eduzz_metrics_daily CASCADE;

DROP TABLE IF EXISTS public.sm_eduzz_invoices CASCADE;
DROP TABLE IF EXISTS public.sm_eduzz_metrics_by_product CASCADE;
DROP TABLE IF EXISTS public.sm_eduzz_metrics_daily CASCADE;

DROP TABLE IF EXISTS public.ac_eduzz_invoices CASCADE;
DROP TABLE IF EXISTS public.ac_eduzz_metrics_by_product CASCADE;
DROP TABLE IF EXISTS public.ac_eduzz_metrics_daily CASCADE;

-- Remove registry entries for Eduzz channel (except for Menina Oficina client)
DELETE FROM public.client_table_registry 
WHERE channel = 'eduzz' 
AND client_id IN (
  '52502e4e-3e10-4e54-a123-80adf45f4c91',  -- Lorpen
  '1e9bc1d6-a6d9-470c-9a90-6afc96ba9ada',  -- Santa Madre
  '9ef28fd8-7393-408f-937b-31bfaefc7afa'   -- ACCEB
);