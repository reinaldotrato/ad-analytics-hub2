import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useBulkCompanyActions() {
  const queryClient = useQueryClient();

  const bulkDeleteMutation = useMutation({
    mutationFn: async (companyIds: string[]) => {
      const { error } = await supabase
        .from('crm_companies')
        .delete()
        .in('id', companyIds);
      
      if (error) throw error;
      return companyIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      toast.success(`${count} empresa(s) excluída(s) com sucesso`);
    },
    onError: (error) => {
      console.error('Erro ao excluir empresas:', error);
      toast.error('Erro ao excluir empresas');
    },
  });

  return {
    bulkDelete: bulkDeleteMutation.mutate,
    isDeleting: bulkDeleteMutation.isPending,
  };
}
