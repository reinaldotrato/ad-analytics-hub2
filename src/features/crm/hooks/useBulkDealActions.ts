import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useBulkDealActions() {
  const queryClient = useQueryClient();

  const bulkDeleteMutation = useMutation({
    mutationFn: async (dealIds: string[]) => {
      const { error } = await supabase
        .from('crm_deals')
        .delete()
        .in('id', dealIds);
      
      if (error) throw error;
      return dealIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast.success(`${count} negócio(s) excluído(s) com sucesso`);
    },
    onError: (error) => {
      console.error('Erro ao excluir deals:', error);
      toast.error('Erro ao excluir negócios');
    },
  });

  const bulkMoveStageMutation = useMutation({
    mutationFn: async ({ dealIds, stageId }: { dealIds: string[]; stageId: string }) => {
      const { error } = await supabase
        .from('crm_deals')
        .update({ stage_id: stageId, updated_at: new Date().toISOString() })
        .in('id', dealIds);
      
      if (error) throw error;
      return dealIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast.success(`${count} negócio(s) movido(s) com sucesso`);
    },
    onError: (error) => {
      console.error('Erro ao mover deals:', error);
      toast.error('Erro ao mover negócios');
    },
  });

  const bulkAssignSellerMutation = useMutation({
    mutationFn: async ({ dealIds, sellerId }: { dealIds: string[]; sellerId: string | null }) => {
      const { error } = await supabase
        .from('crm_deals')
        .update({ assigned_to_id: sellerId, updated_at: new Date().toISOString() })
        .in('id', dealIds);
      
      if (error) throw error;
      return dealIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast.success(`${count} negócio(s) atribuído(s) com sucesso`);
    },
    onError: (error) => {
      console.error('Erro ao atribuir deals:', error);
      toast.error('Erro ao atribuir negócios');
    },
  });

  return {
    bulkDelete: bulkDeleteMutation.mutate,
    bulkMoveStage: bulkMoveStageMutation.mutate,
    bulkAssignSeller: bulkAssignSellerMutation.mutate,
    isDeleting: bulkDeleteMutation.isPending,
    isMoving: bulkMoveStageMutation.isPending,
    isAssigning: bulkAssignSellerMutation.isPending,
    isLoading: bulkDeleteMutation.isPending || bulkMoveStageMutation.isPending || bulkAssignSellerMutation.isPending,
  };
}
