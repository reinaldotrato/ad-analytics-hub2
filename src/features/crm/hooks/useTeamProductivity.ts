import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, format } from 'date-fns';

export interface ProductivityMetrics {
  seller_id: string | null;
  seller_name: string | null;
  seller_email: string | null;
  task_type: string | null;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  completion_rate: number;
}

export interface ProductivityEvolution {
  task_date: string;
  total_tasks: number;
  completed_tasks: number;
}

export interface SellerRanking {
  seller_id: string;
  seller_name: string;
  seller_email: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
}

export interface TaskWithDetails {
  task_id: string;
  task_title: string;
  task_type: string | null;
  task_completed: boolean;
  task_due_date: string | null;
  task_completed_at: string | null;
  seller_id: string | null;
  seller_name: string | null;
  deal_id: string | null;
  deal_name: string | null;
  contact_name: string | null;
  company_name: string | null;
}

export function useTeamProductivity() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [taskTypeFilter, setTaskTypeFilter] = useState<string | null>(null);

  // Buscar métricas gerais por tipo de tarefa
  const metricsQuery = useQuery({
    queryKey: ['team-productivity-metrics', effectiveClientId, selectedSellerId, startDate, endDate],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const { data, error } = await supabase.rpc('get_team_productivity_metrics', {
        client_id_param: effectiveClientId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        seller_id_param: selectedSellerId || null,
      });

      if (error) throw error;
      return (data || []) as ProductivityMetrics[];
    },
    enabled: !!effectiveClientId,
  });

  // Buscar evolução diária
  const evolutionQuery = useQuery({
    queryKey: ['productivity-evolution', effectiveClientId, selectedSellerId, startDate, endDate],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const { data, error } = await supabase.rpc('get_productivity_evolution', {
        client_id_param: effectiveClientId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        seller_id_param: selectedSellerId || null,
      });

      if (error) throw error;
      return (data || []) as ProductivityEvolution[];
    },
    enabled: !!effectiveClientId,
  });

  // Buscar ranking de vendedores
  const rankingQuery = useQuery({
    queryKey: ['seller-ranking', effectiveClientId, startDate, endDate],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const { data, error } = await supabase.rpc('get_seller_productivity_ranking', {
        client_id_param: effectiveClientId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });

      if (error) throw error;
      return (data || []) as SellerRanking[];
    },
    enabled: !!effectiveClientId,
  });

  // Buscar tarefas com detalhes
  const tasksQuery = useQuery({
    queryKey: ['tasks-with-details', effectiveClientId, selectedSellerId, startDate, endDate, taskTypeFilter],
    queryFn: async () => {
      if (!effectiveClientId) return [];

      const { data, error } = await supabase.rpc('get_tasks_with_details', {
        client_id_param: effectiveClientId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        seller_id_param: selectedSellerId || null,
        task_type_param: taskTypeFilter || null,
      });

      if (error) throw error;
      return (data || []) as TaskWithDetails[];
    },
    enabled: !!effectiveClientId,
  });

  // Calcular totais agregados
  const totals = {
    totalTasks: metricsQuery.data?.reduce((acc, m) => acc + m.total_tasks, 0) || 0,
    completedTasks: metricsQuery.data?.reduce((acc, m) => acc + m.completed_tasks, 0) || 0,
    pendingTasks: metricsQuery.data?.reduce((acc, m) => acc + m.pending_tasks, 0) || 0,
    completionRate: 0,
  };
  
  if (totals.totalTasks > 0) {
    totals.completionRate = Math.round((totals.completedTasks / totals.totalTasks) * 100 * 10) / 10;
  }

  // Agrupar métricas por tipo de tarefa
  const tasksByType = metricsQuery.data?.reduce((acc, m) => {
    const type = m.task_type || 'Sem tipo';
    if (!acc[type]) {
      acc[type] = { total: 0, completed: 0, pending: 0 };
    }
    acc[type].total += m.total_tasks;
    acc[type].completed += m.completed_tasks;
    acc[type].pending += m.pending_tasks;
    return acc;
  }, {} as Record<string, { total: number; completed: number; pending: number }>);

  return {
    metrics: metricsQuery.data || [],
    evolution: evolutionQuery.data || [],
    ranking: rankingQuery.data || [],
    tasks: tasksQuery.data || [],
    totals,
    tasksByType: tasksByType || {},
    filters: {
      selectedSellerId,
      startDate,
      endDate,
      taskTypeFilter,
    },
    setFilters: {
      setSelectedSellerId,
      setStartDate,
      setEndDate,
      setTaskTypeFilter,
    },
    isLoading: metricsQuery.isLoading || evolutionQuery.isLoading || rankingQuery.isLoading || tasksQuery.isLoading,
  };
}
