import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import type { Deal } from '../lib/types';

const DEALS_PER_PAGE = 20;

export function usePaginatedDeals() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['crm-deals-paginated', effectiveClientId, currentPage],
    queryFn: async () => {
      if (!effectiveClientId) return { deals: [], count: 0 };

      const from = (currentPage - 1) * DEALS_PER_PAGE;
      const to = from + DEALS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('crm_deals')
        .select(`
          *,
          contact:crm_contacts(*),
          funnel_stage:crm_funnel_stages(*)
        `, { count: 'exact' })
        .eq('client_id', effectiveClientId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return { deals: data as Deal[], count: count ?? 0 };
    },
    enabled: !!effectiveClientId,
  });

  const totalPages = Math.ceil((data?.count ?? 0) / DEALS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const previousPage = () => goToPage(currentPage - 1);

  return {
    deals: data?.deals ?? [],
    totalCount: data?.count ?? 0,
    currentPage,
    totalPages,
    isLoading,
    error,
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    pageSize: DEALS_PER_PAGE,
  };
}
