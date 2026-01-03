import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { seedDefaultFunnelStages } from '@/services/crmService';
import { toast } from 'sonner';

export function useSeedDefaultStages() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!effectiveClientId) throw new Error('Client ID not available');
      return seedDefaultFunnelStages(effectiveClientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnel-stages'] });
      toast.success('Funil padrão criado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Error seeding default stages:', error);
      const message = error.message.includes('já existem') 
        ? error.message 
        : 'Erro ao criar funil padrão';
      toast.error(message);
    },
  });

  return {
    seedStages: mutation.mutate,
    isSeeding: mutation.isPending,
  };
}
