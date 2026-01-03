-- Políticas RLS para upload de logos de clientes no bucket 'assets'

-- Política para INSERT (upload)
CREATE POLICY "Allow authenticated users to upload client logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets' 
  AND (storage.foldername(name))[1] = 'client-logos'
);

-- Política para UPDATE (upsert)
CREATE POLICY "Allow authenticated users to update client logos"  
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assets' 
  AND (storage.foldername(name))[1] = 'client-logos'
);

-- Política para SELECT (visualizar)
CREATE POLICY "Allow public to view client logos"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'assets' 
  AND (storage.foldername(name))[1] = 'client-logos'
);