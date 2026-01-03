import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { SellerMetrics, LostOpportunity, SalesPeriodData } from '../lib/types';
import { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useFunnels } from '@/hooks/useCrmData';

interface OverviewMetrics {
  total_leads: number;
  total_opportunities: number;
  total_sales: number;
  conversion_rate: number;
  average_ticket: number;
}

interface FunnelMetric {
  id: string;
  client_id: string;
  funnel_id: string | null;
  name: string;
  order: number;
  color: string;
  is_won: boolean | null;
  is_lost: boolean | null;
  deals_count: number;
  deals_value: number;
}

export function useCrmReports() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');
  
  // Funnel filter state
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  
  // Fetch available funnels
  const { data: funnels = [] } = useFunnels();
  
  // Default to current month
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  // Overview Metrics - usando apenas crm_deals com filtro de datas
  const overviewQuery = useQuery<OverviewMetrics | null>({
    queryKey: ['crm-report-overview', effectiveClientId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!effectiveClientId) return null;
      const { data, error } = await supabase.rpc('get_crm_overview_metrics', { 
        client_id_param: effectiveClientId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });
      if (error) throw error;
      return data as unknown as OverviewMetrics;
    },
    enabled: !!effectiveClientId,
  });

  // Funnel Metrics - with date filter
  const funnelQuery = useQuery<FunnelMetric[]>({
    queryKey: ['crm-report-funnel', effectiveClientId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      const { data, error } = await supabase.rpc('get_sales_funnel_data_filtered', { 
        client_id_param: effectiveClientId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });
      if (error) throw error;
      return (data as unknown as FunnelMetric[]) || [];
    },
    enabled: !!effectiveClientId,
  });

  // Seller Metrics - with date filter
  const sellerQuery = useQuery<SellerMetrics[]>({
    queryKey: ['crm-report-sellers', effectiveClientId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      const { data, error } = await supabase.rpc('get_metrics_by_salesperson_filtered', { 
        client_id_param: effectiveClientId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });
      if (error) throw error;
      return (data as unknown as SellerMetrics[]) || [];
    },
    enabled: !!effectiveClientId,
  });

  // Lost Opportunities - with date filter
  const lostQuery = useQuery<LostOpportunity[]>({
    queryKey: ['crm-report-lost', effectiveClientId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      const { data, error } = await supabase.rpc('get_lost_opportunities_report_filtered', { 
        client_id_param: effectiveClientId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });
      if (error) throw error;
      return (data as unknown as LostOpportunity[]) || [];
    },
    enabled: !!effectiveClientId,
  });

  // Sales by Period - with date filter
  const salesPeriodQuery = useQuery<SalesPeriodData[]>({
    queryKey: ['crm-report-sales-period', effectiveClientId, groupBy, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      const { data, error } = await supabase.rpc('get_sales_by_period_report_filtered', { 
        client_id_param: effectiveClientId,
        group_by: groupBy,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });
      if (error) throw error;
      return (data as unknown as SalesPeriodData[]) || [];
    },
    enabled: !!effectiveClientId,
  });

  // Transform funnel data to match expected interface with calculated conversion rates
  // Filter by selected funnel if one is selected
  const filteredFunnelData = useMemo(() => {
    const rawData = funnelQuery.data || [];
    if (!selectedFunnelId) {
      // If no funnel selected, return all data
      return rawData;
    }
    // Filter stages that belong to the selected funnel
    return rawData.filter(item => item.funnel_id === selectedFunnelId);
  }, [funnelQuery.data, selectedFunnelId]);
  
  const sortedFunnelData = [...filteredFunnelData].sort((a, b) => a.order - b.order);

  const funnelMetrics = sortedFunnelData.map((item, index) => {
    // Calculate conversion rate based on previous stage
    let conversionRate: number | null = null;
    
    if (index > 0) {
      const previousStage = sortedFunnelData[index - 1];
      if (previousStage.deals_count > 0) {
        conversionRate = (item.deals_count / previousStage.deals_count) * 100;
      }
    }
    
    return {
      stage: {
        id: item.id,
        client_id: item.client_id,
        name: item.name,
        order: item.order,
        color: item.color,
        is_won: item.is_won,
        is_lost: item.is_lost,
      },
      deals_count: item.deals_count,
      deals_value: item.deals_value,
      conversion_rate: conversionRate,
    };
  });

  const getSalesByPeriodData = (newGroupBy: 'day' | 'week' | 'month') => {
    if (newGroupBy !== groupBy) {
      setGroupBy(newGroupBy);
    }
    return salesPeriodQuery.data || [];
  };

  const isLoading = 
    overviewQuery.isLoading || 
    funnelQuery.isLoading || 
    sellerQuery.isLoading || 
    lostQuery.isLoading || 
    salesPeriodQuery.isLoading;

  return {
    overviewMetrics: overviewQuery.data || {
      total_leads: 0,
      total_opportunities: 0,
      total_sales: 0,
      conversion_rate: 0,
      average_ticket: 0,
    },
    funnelMetrics,
    sellerMetrics: sellerQuery.data || [],
    lostOpportunities: lostQuery.data || [],
    getSalesByPeriodData,
    isLoading,
    // Date filter controls
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    // Funnel filter controls
    funnels,
    selectedFunnelId,
    setSelectedFunnelId,
  };
}
