import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format, subDays } from 'date-fns';

export function useGoalMetrics() {
  const { selectedClientId, clientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId : clientId;

  // Dados diários para o gráfico de evolução
  const dailyDataQuery = useQuery({
    queryKey: ['crm-daily-sales', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      // Buscar stages de venda
      const { data: stages } = await supabase
        .from('crm_funnel_stages')
        .select('id')
        .eq('client_id', effectiveClientId)
        .eq('is_won', true);

      if (!stages || stages.length === 0) return [];

      const wonStageIds = stages.map(s => s.id);

      // Buscar deals ganhos no mês
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('id, value, closed_at, created_by_id')
        .eq('client_id', effectiveClientId)
        .in('stage_id', wonStageIds)
        .gte('closed_at', monthStart)
        .lte('closed_at', monthEnd + 'T23:59:59');

      if (!deals) return [];

      // Agrupar por data
      const byDate = new Map<string, { count: number; value: number }>();
      deals.forEach(deal => {
        if (deal.closed_at) {
          const date = format(new Date(deal.closed_at), 'yyyy-MM-dd');
          const existing = byDate.get(date) || { count: 0, value: 0 };
          byDate.set(date, {
            count: existing.count + 1,
            value: existing.value + Number(deal.value),
          });
        }
      });

      return Array.from(byDate.entries()).map(([date, data]) => ({
        date,
        value: data.count,
        revenue: data.value,
      }));
    },
    enabled: !!effectiveClientId,
  });

  // Vendas de hoje
  const todaySalesQuery = useQuery({
    queryKey: ['crm-today-sales', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return { count: 0, value: 0 };

      const today = format(new Date(), 'yyyy-MM-dd');

      // Buscar stages de venda
      const { data: stages } = await supabase
        .from('crm_funnel_stages')
        .select('id')
        .eq('client_id', effectiveClientId)
        .eq('is_won', true);

      if (!stages || stages.length === 0) return { count: 0, value: 0 };

      const wonStageIds = stages.map(s => s.id);

      // Buscar deals ganhos hoje
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('id, value')
        .eq('client_id', effectiveClientId)
        .in('stage_id', wonStageIds)
        .gte('closed_at', today)
        .lte('closed_at', today + 'T23:59:59');

      if (!deals) return { count: 0, value: 0 };

      return {
        count: deals.length,
        value: deals.reduce((sum, d) => sum + Number(d.value), 0),
      };
    },
    enabled: !!effectiveClientId,
  });

  // Motivos de perda
  const lostDealsQuery = useQuery({
    queryKey: ['crm-lost-deals', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      // Buscar stages de perda
      const { data: stages } = await supabase
        .from('crm_funnel_stages')
        .select('id')
        .eq('client_id', effectiveClientId)
        .eq('is_lost', true);

      if (!stages || stages.length === 0) return [];

      const lostStageIds = stages.map(s => s.id);

      // Buscar deals perdidos no mês
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('id, value, lost_reason, closed_at')
        .eq('client_id', effectiveClientId)
        .in('stage_id', lostStageIds)
        .gte('closed_at', monthStart)
        .lte('closed_at', monthEnd + 'T23:59:59');

      if (!deals) return [];

      // Agrupar por motivo
      const byReason = new Map<string, { count: number; value: number }>();
      deals.forEach(deal => {
        const reason = deal.lost_reason || 'Não especificado';
        const existing = byReason.get(reason) || { count: 0, value: 0 };
        byReason.set(reason, {
          count: existing.count + 1,
          value: existing.value + Number(deal.value),
        });
      });

      return Array.from(byReason.entries())
        .map(([reason, data]) => ({
          reason,
          count: data.count,
          value: data.value,
        }))
        .sort((a, b) => b.count - a.count);
    },
    enabled: !!effectiveClientId,
  });

  return {
    dailyData: dailyDataQuery.data || [],
    todaySales: todaySalesQuery.data || { count: 0, value: 0 },
    lostDeals: lostDealsQuery.data || [],
    isLoading: dailyDataQuery.isLoading || todaySalesQuery.isLoading || lostDealsQuery.isLoading,
  };
}
