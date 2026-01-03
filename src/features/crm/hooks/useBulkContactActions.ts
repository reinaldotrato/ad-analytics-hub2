import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useBulkContactActions() {
  const queryClient = useQueryClient();

  const bulkDeleteMutation = useMutation({
    mutationFn: async (contactIds: string[]) => {
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .in('id', contactIds);
      
      if (error) throw error;
      return contactIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast.success(`${count} contato(s) excluído(s) com sucesso`);
    },
    onError: (error) => {
      console.error('Erro ao excluir contatos:', error);
      toast.error('Erro ao excluir contatos');
    },
  });

  return {
    bulkDelete: bulkDeleteMutation.mutate,
    isDeleting: bulkDeleteMutation.isPending,
  };
}
