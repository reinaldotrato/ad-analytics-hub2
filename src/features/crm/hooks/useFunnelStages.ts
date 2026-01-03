import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { FunnelStage } from '../lib/types';

export function useFunnelStages(funnelId?: string) {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;

  const { data: stages = [], isLoading, error } = useQuery({
    queryKey: ['crm-funnel-stages', effectiveClientId, funnelId],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      
      let query = supabase
        .from('crm_funnel_stages')
        .select('*')
        .eq('client_id', effectiveClientId);
      
      if (funnelId) {
        query = query.eq('funnel_id', funnelId);
      }
      
      const { data, error } = await query.order('order', { ascending: true });

      if (error) throw error;
      
      return data as FunnelStage[];
    },
    enabled: !!effectiveClientId,
  });

  return {
    stages,
    isLoading,
    error,
  };
}
