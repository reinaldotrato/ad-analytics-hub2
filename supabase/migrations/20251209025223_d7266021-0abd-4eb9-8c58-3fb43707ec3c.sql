-- Corrigir problemas de RLS em tabelas existentes
-- Habilitar RLS nas tabelas que tem políticas mas RLS desabilitado

-- Verificar quais tabelas precisam de RLS habilitado
DO $$ 
DECLARE
  t RECORD;
BEGIN
  FOR t IN 
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', t.schemaname, t.tablename);
  END LOOP;
END $$;