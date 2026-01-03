import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Deal } from '../lib/types';

export function useDeals() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading, error } = useQuery({
    queryKey: ['crm-deals', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      
      // Usa a view otimizada que já inclui pending_tasks_count calculado via SQL
      // Colunas específicas ao invés de select('*') para reduzir payload
      const { data, error } = await supabase
        .from('crm_deals_with_pending_tasks')
        .select(`
          id, client_id, name, value, probability, expected_close_date,
          stage_id, contact_id, assigned_to_id, created_by_id, source,
          source_lead_id, status, days_without_interaction, lost_reason,
          created_at, updated_at, closed_at, pending_tasks_count,
          contact:crm_contacts(id, client_id, name, email, phone, mobile_phone, position, company_id, company:crm_companies(id, name)),
          funnel_stage:crm_funnel_stages(id, name, order, color, is_won, is_lost)
        `)
        .eq('client_id', effectiveClientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []) as Deal[];
    },
    enabled: !!effectiveClientId,
  });

  const moveDealMutation = useMutation({
    mutationFn: async ({ dealId, newStageId }: { dealId: string; newStageId: string }) => {
      const { error } = await supabase
        .from('crm_deals')
        .update({ stage_id: newStageId })
        .eq('id', dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals', effectiveClientId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics', effectiveClientId] });
    },
    onError: (error) => {
      console.error('Error moving deal:', error);
      toast.error('Erro ao mover negócio');
    },
  });

  const addDealMutation = useMutation({
    mutationFn: async (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'contact' | 'funnel_stage'>) => {
      const { data, error } = await supabase
        .from('crm_deals')
        .insert(deal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals', effectiveClientId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics', effectiveClientId] });
      toast.success('Negócio criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error adding deal:', error);
      toast.error('Erro ao criar negócio');
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ dealId, updates }: { dealId: string; updates: Partial<Deal> }) => {
      const { error } = await supabase
        .from('crm_deals')
        .update(updates)
        .eq('id', dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals', effectiveClientId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics', effectiveClientId] });
      toast.success('Negócio atualizado!');
    },
    onError: (error) => {
      console.error('Error updating deal:', error);
      toast.error('Erro ao atualizar negócio');
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const { error } = await supabase
        .from('crm_deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals', effectiveClientId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics', effectiveClientId] });
      toast.success('Negócio removido!');
    },
    onError: (error) => {
      console.error('Error deleting deal:', error);
      toast.error('Erro ao remover negócio');
    },
  });

  const moveDeal = (dealId: string, newStageId: string) => {
    moveDealMutation.mutate({ dealId, newStageId });
  };

  const addDeal = (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'contact' | 'funnel_stage'>) => {
    addDealMutation.mutate(deal);
  };

  const updateDeal = (dealId: string, updates: Partial<Deal>) => {
    updateDealMutation.mutate({ dealId, updates });
  };

  const deleteDeal = (dealId: string) => {
    deleteDealMutation.mutate(dealId);
  };

  return {
    deals,
    isLoading,
    error,
    moveDeal,
    addDeal,
    updateDeal,
    deleteDeal,
  };
}
