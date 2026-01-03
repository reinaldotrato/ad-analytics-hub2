import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Seller {
  id: string;
  name: string;
  email: string;
}

export function useSellers() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;

  return useQuery({
    queryKey: ['crm-sellers', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const { data, error } = await supabase
        .from('crm_sellers')
        .select('id, name, email')
        .eq('client_id', effectiveClientId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as Seller[];
    },
    enabled: !!effectiveClientId,
  });
}
