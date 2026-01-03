-- Deletar as 12 etapas duplicadas do cliente Tryvia
-- Mantendo apenas as 6 originais criadas em 27/12/2025

DELETE FROM public.crm_funnel_stages 
WHERE id IN (
  '57102b14-847c-4ad6-ba5b-e19355fab0e3',  -- Novo Lead - duplicata 1
  '737539d2-eda2-47fc-ab64-35c1456fd423',  -- Novo Lead - duplicata 2
  '9d94add8-83e3-4b05-a588-509779aa4822',  -- Qualificação - duplicata 1
  'ba92ba42-0eab-41e8-af4e-5a2b63066fdc',  -- Qualificação - duplicata 2
  'db3838bc-e56c-47c2-bcd6-2bb6fea8543e',  -- Proposta - duplicata 1
  '1750e809-2747-491f-a2ef-54fd563ea83a',  -- Proposta - duplicata 2
  'c453d003-035a-4d6d-89ab-cd44909aa4c0',  -- Negociação - duplicata 1
  '3920e02b-e7f2-4124-a6dd-50f920d94b3c',  -- Negociação - duplicata 2
  'cad6537b-e350-4ab2-8501-75d94a68e2e3',  -- Fechado Ganho - duplicata 1
  '7086005e-14b0-492e-b55d-9653ed553449',  -- Fechado Ganho - duplicata 2
  '8cc36b73-eec4-4f69-8456-3f7e4b55a945',  -- Fechado Perdido - duplicata 1
  'ad020c20-52ab-48a7-922b-3b592950e1c1'   -- Fechado Perdido - duplicata 2
);