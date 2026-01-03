import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type TicketStatus = 'pending' | 'in_progress' | 'completed';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string | null;
  client_id: string | null;
  name: string;
  company: string;
  problem: string;
  status: TicketStatus;
  whatsapp_sent: boolean;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  attachment_urls: string[] | null;
}

export function useSupportTickets(statusFilter?: TicketStatus) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['support-tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user,
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: TicketStatus }) => {
      const updateData: Partial<SupportTicket> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updateData.resolved_at = new Date().toISOString();
      } else {
        updateData.resolved_at = null;
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Status do ticket atualizado');
    },
    onError: (error) => {
      console.error('Error updating ticket:', error);
      toast.error('Erro ao atualizar ticket');
    },
  });

  const createTicket = useMutation({
    mutationFn: async ({ 
      name, 
      company, 
      problem,
      attachmentUrls = [],
    }: { 
      name: string; 
      company: string; 
      problem: string;
      attachmentUrls?: string[];
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar logado para abrir um ticket');
      }

      // Get user's client_id
      const { data: profile } = await supabase
        .from('tryvia_analytics_profiles')
        .select('client_id')
        .eq('id', session.user.id)
        .single();

      const response = await supabase.functions.invoke('send-support-whatsapp', {
        body: {
          name,
          company,
          problem,
          client_id: profile?.client_id,
          attachment_urls: attachmentUrls,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar ticket');
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success(`Ticket ${data.ticket.ticket_number} criado com sucesso!`);
    },
    onError: (error: Error) => {
      console.error('Error creating ticket:', error);
      toast.error(error.message || 'Erro ao criar ticket de suporte');
    },
  });

  return {
    tickets,
    isLoading,
    error,
    updateTicketStatus,
    createTicket,
  };
}
