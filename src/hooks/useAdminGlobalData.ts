import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  logoUrl: string | null;
  googleCampaignsActive: number;
  metaCampaignsActive: number;
  googleSpend: number;
  metaSpend: number;
  leads: number;
  opportunities: number;
  sales: number;
  revenue: number;
  cal: number;
  cav: number;
  roas: number;
  hasSyncedData: boolean;
}

export interface ActiveCampaign {
  clientName: string;
  campaignName: string;
  channel: 'google' | 'meta';
  spend: number;
  results: number;
  status: string;
}

export interface GlobalMetrics {
  totals: {
    totalSpend: number;
    googleSpend: number;
    metaSpend: number;
    leads: number;
    opportunities: number;
    sales: number;
    revenue: number;
    cal: number;
    cav: number;
    roas: number;
    conversionRate: number;
  };
  byClient: ClientMetrics[];
  activeCampaigns: ActiveCampaign[];
}

export function useAdminGlobalData(startDate?: Date, endDate?: Date) {
  const defaultEndDate = new Date();
  const defaultStartDate = subDays(defaultEndDate, 30);

  const start = startDate || defaultStartDate;
  const end = endDate || defaultEndDate;

  return useQuery({
    queryKey: ['admin-global-metrics', format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')],
    queryFn: async (): Promise<GlobalMetrics> => {
      const { data, error } = await supabase.functions.invoke('admin-global-metrics', {
        body: {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        },
      });

      if (error) {
        console.error('Error fetching admin global metrics:', error);
        throw error;
      }

      return data as GlobalMetrics;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
