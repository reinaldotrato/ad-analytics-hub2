-- Criar bucket para anexos de suporte
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Política de upload (usuários autenticados)
CREATE POLICY "Authenticated users can upload support attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'support-attachments');

-- Política de leitura (pública para o suporte acessar)
CREATE POLICY "Anyone can view support attachments"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'support-attachments');

-- Adicionar coluna de anexos na tabela support_tickets
ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS attachment_urls TEXT[] DEFAULT '{}';