import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import type { Goal, ConversionRates, GoalProgress, Seller } from '../lib/types';

interface CreateGoalData {
  seller_id?: string;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  sales_quantity_goal: number;
  sales_value_goal: number;
  leads_goal: number;
  opportunities_goal: number;
  lead_to_sale_rate: number;
  lead_to_opportunity_rate: number;
  opportunity_to_sale_rate: number;
}

export function useGoals() {
  const { selectedClientId, clientId, role } = useAuth();
  const queryClient = useQueryClient();
  const effectiveClientId = role === 'admin' ? selectedClientId : clientId;

  // Buscar todas as metas do cliente
  const goalsQuery = useQuery({
    queryKey: ['crm-goals', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const { data, error } = await supabase
        .from('crm_goals')
        .select('*')
        .eq('client_id', effectiveClientId)
        .order('period_start', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!effectiveClientId,
  });

  // Buscar vendedores
  const sellersQuery = useQuery({
    queryKey: ['crm-sellers', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const { data, error } = await supabase
        .from('crm_sellers')
        .select('id, name, email, avatar_url')
        .eq('client_id', effectiveClientId)
        .eq('is_active', true);

      if (error) throw error;
      return data as Seller[];
    },
    enabled: !!effectiveClientId,
  });

  // Calcular taxas de conversão históricas (últimos 3 meses)
  const conversionRatesQuery = useQuery({
    queryKey: ['crm-conversion-rates', effectiveClientId],
    queryFn: async (): Promise<ConversionRates> => {
      if (!effectiveClientId) {
        return {
          leadToSale: 0,
          leadToOpportunity: 0,
          opportunityToSale: 0,
          totalLeads: 0,
          totalOpportunities: 0,
          totalSales: 0,
        };
      }

      const threeMonthsAgo = format(startOfMonth(subMonths(new Date(), 3)), 'yyyy-MM-dd');
      const today = format(new Date(), 'yyyy-MM-dd');

      // Buscar stages para identificar leads, oportunidades e vendas
      const { data: stages } = await supabase
        .from('crm_funnel_stages')
        .select('id, order, is_won, is_lost')
        .eq('client_id', effectiveClientId);

      if (!stages || stages.length === 0) {
        return {
          leadToSale: 0.2, // Default 20%
          leadToOpportunity: 0.5, // Default 50%
          opportunityToSale: 0.4, // Default 40%
          totalLeads: 0,
          totalOpportunities: 0,
          totalSales: 0,
        };
      }

      const leadStageIds = stages.filter(s => s.order <= 1).map(s => s.id);
      const opportunityStageIds = stages.filter(s => s.order >= 2 && !s.is_won && !s.is_lost).map(s => s.id);
      const wonStageIds = stages.filter(s => s.is_won).map(s => s.id);

      // Buscar deals dos últimos 3 meses
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('id, stage_id, created_at')
        .eq('client_id', effectiveClientId)
        .gte('created_at', threeMonthsAgo)
        .lte('created_at', today);

      if (!deals || deals.length === 0) {
        return {
          leadToSale: 0.2,
          leadToOpportunity: 0.5,
          opportunityToSale: 0.4,
          totalLeads: 0,
          totalOpportunities: 0,
          totalSales: 0,
        };
      }

      // Total de todos os deals criados = leads
      const totalLeads = deals.length;
      
      // Deals que chegaram a stages de oportunidade ou além
      const totalOpportunities = deals.filter(d => 
        opportunityStageIds.includes(d.stage_id) || wonStageIds.includes(d.stage_id)
      ).length;
      
      // Deals ganhos
      const totalSales = deals.filter(d => wonStageIds.includes(d.stage_id)).length;

      const leadToSale = totalLeads > 0 ? totalSales / totalLeads : 0.2;
      const leadToOpportunity = totalLeads > 0 ? totalOpportunities / totalLeads : 0.5;
      const opportunityToSale = totalOpportunities > 0 ? totalSales / totalOpportunities : 0.4;

      return {
        leadToSale: Math.max(leadToSale, 0.01), // Evitar divisão por zero
        leadToOpportunity: Math.max(leadToOpportunity, 0.01),
        opportunityToSale: Math.max(opportunityToSale, 0.01),
        totalLeads,
        totalOpportunities,
        totalSales,
      };
    },
    enabled: !!effectiveClientId,
  });

  // Buscar progresso atual das metas
  const goalProgressQuery = useQuery({
    queryKey: ['crm-goal-progress', effectiveClientId],
    queryFn: async (): Promise<Map<string, { sales: number; value: number; leads: number; opportunities: number }>> => {
      if (!effectiveClientId) return new Map();

      const currentMonth = new Date();
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      // Buscar stages
      const { data: stages } = await supabase
        .from('crm_funnel_stages')
        .select('id, order, is_won')
        .eq('client_id', effectiveClientId);

      if (!stages) return new Map();

      const wonStageIds = stages.filter(s => s.is_won).map(s => s.id);
      const opportunityStageIds = stages.filter(s => s.order >= 2 && !s.is_won).map(s => s.id);

      // Buscar deals do mês atual (todos, sem filtro de data inicial)
      const { data: deals } = await supabase
        .from('crm_deals')
        .select('id, stage_id, value, assigned_to_id, created_at, closed_at')
        .eq('client_id', effectiveClientId);

      if (!deals) return new Map();

      // Filtrar leads criados no período
      const leadsInPeriod = deals.filter(d => {
        const createdAt = d.created_at ? new Date(d.created_at) : null;
        return createdAt && createdAt >= new Date(monthStart) && createdAt <= new Date(monthEnd + 'T23:59:59');
      });

      // Filtrar vendas (is_won) fechadas no período usando closed_at
      const salesInPeriod = deals.filter(d => {
        const closedAt = d.closed_at ? new Date(d.closed_at) : null;
        return closedAt && 
               closedAt >= new Date(monthStart) && 
               closedAt <= new Date(monthEnd + 'T23:59:59') &&
               wonStageIds.includes(d.stage_id);
      });

      // Progresso geral (seller_id = null)
      const generalProgress = {
        sales: salesInPeriod.length,
        value: salesInPeriod.reduce((sum, d) => sum + Number(d.value), 0),
        leads: leadsInPeriod.length,
        opportunities: leadsInPeriod.filter(d => opportunityStageIds.includes(d.stage_id) || wonStageIds.includes(d.stage_id)).length,
      };

      // Criar mapa com progresso geral e por vendedor
      const progressMap = new Map<string, typeof generalProgress>();
      progressMap.set('general', generalProgress);

      // Agrupar vendas por vendedor responsável (assigned_to_id)
      const sellerSales = new Map<string, typeof salesInPeriod>();
      const sellerLeads = new Map<string, typeof leadsInPeriod>();
      
      salesInPeriod.forEach(deal => {
        if (deal.assigned_to_id) {
          const existing = sellerSales.get(deal.assigned_to_id) || [];
          existing.push(deal);
          sellerSales.set(deal.assigned_to_id, existing);
        }
      });

      leadsInPeriod.forEach(deal => {
        if (deal.assigned_to_id) {
          const existing = sellerLeads.get(deal.assigned_to_id) || [];
          existing.push(deal);
          sellerLeads.set(deal.assigned_to_id, existing);
        }
      });

      // Combinar todos os vendedores únicos
      const allSellerIds = new Set([...sellerSales.keys(), ...sellerLeads.keys()]);
      
      allSellerIds.forEach(sellerId => {
        const sellerSalesList = sellerSales.get(sellerId) || [];
        const sellerLeadsList = sellerLeads.get(sellerId) || [];
        
        progressMap.set(sellerId, {
          sales: sellerSalesList.length,
          value: sellerSalesList.reduce((sum, d) => sum + Number(d.value), 0),
          leads: sellerLeadsList.length,
          opportunities: sellerLeadsList.filter(d => opportunityStageIds.includes(d.stage_id) || wonStageIds.includes(d.stage_id)).length,
        });
      });

      return progressMap;
    },
    enabled: !!effectiveClientId,
  });

  // Criar meta
  const createGoalMutation = useMutation({
    mutationFn: async (data: CreateGoalData) => {
      if (!effectiveClientId) throw new Error('Client ID not found');

      const { error } = await supabase
        .from('crm_goals')
        .insert({
          client_id: effectiveClientId,
          ...data,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-goals', effectiveClientId] });
    },
  });

  // Atualizar meta
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...data }: CreateGoalData & { id: string }) => {
      const { error } = await supabase
        .from('crm_goals')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-goals', effectiveClientId] });
    },
  });

  // Deletar meta
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-goals', effectiveClientId] });
    },
  });

  // Função helper para calcular metas derivadas
  const calculateDerivedGoals = (salesQuantityGoal: number, rates: ConversionRates) => {
    return {
      leadsGoal: Math.ceil(salesQuantityGoal / rates.leadToSale),
      opportunitiesGoal: Math.ceil(salesQuantityGoal / rates.opportunityToSale),
    };
  };

  // Filtrar metas do período atual
  const currentMonthGoals = goalsQuery.data?.filter(goal => {
    const today = new Date();
    const start = new Date(goal.period_start);
    const end = new Date(goal.period_end);
    return today >= start && today <= end;
  }) || [];

  // Meta geral do período atual
  const currentGeneralGoal = currentMonthGoals.find(g => !g.seller_id);

  // Metas por vendedor do período atual
  const currentSellerGoals = currentMonthGoals.filter(g => g.seller_id);

  return {
    goals: goalsQuery.data || [],
    currentGeneralGoal,
    currentSellerGoals,
    sellers: sellersQuery.data || [],
    conversionRates: conversionRatesQuery.data,
    goalProgress: goalProgressQuery.data,
    isLoading: goalsQuery.isLoading || conversionRatesQuery.isLoading,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    calculateDerivedGoals,
    effectiveClientId,
  };
}
