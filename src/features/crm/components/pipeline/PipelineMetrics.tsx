import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Target, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  isLoading?: boolean;
}

function MetricCard({ title, value, icon, color = 'primary', isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className="liquid-glass">
        <CardContent className="p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 sm:h-5 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="liquid-glass hover:scale-[1.02] transition-transform">
      <CardContent className="p-2 sm:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className={cn(
            "p-1.5 sm:p-2 rounded-lg w-fit flex-shrink-0",
            color === 'primary' && "bg-primary/10 text-primary",
            color === 'cyan' && "bg-tryvia-cyan/10 text-tryvia-cyan",
            color === 'green' && "bg-green-500/10 text-green-500",
            color === 'orange' && "bg-tryvia-orange/10 text-tryvia-orange",
            color === 'purple' && "bg-tryvia-magenta/10 text-tryvia-magenta"
          )}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-sm sm:text-lg font-bold truncate">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PipelineMetrics() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['pipeline-metrics', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return null;

      // Fetch deals grouped by stage type
      const { data: deals, error } = await supabase
        .from('crm_deals')
        .select(`
        id,
          value,
          funnel_stage:crm_funnel_stages(is_won, is_lost, order, name)
        `)
        .eq('client_id', effectiveClientId);

      if (error) throw error;

      const totalDeals = deals?.length || 0;
      const wonDeals = deals?.filter(d => d.funnel_stage?.is_won) || [];
      
      // LEADS = Deals na primeira etapa do funil (order = 0)
      const leadDeals = deals?.filter(d => 
        d.funnel_stage?.order === 0
      ) || [];
      
      // OPORTUNIDADES = Apenas deals nos estágios "Proposta" ou "Negociação"
      const opportunityDeals = deals?.filter(d => 
        d.funnel_stage && 
        !d.funnel_stage.is_won && 
        !d.funnel_stage.is_lost &&
        (d.funnel_stage.name === 'Proposta' || d.funnel_stage.name === 'Negociação')
      ) || [];
      
      const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const conversionRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;
      const avgTicket = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;

      return {
        totalLeads: leadDeals.length,
        opportunities: opportunityDeals.length,
        wonDeals: wonDeals.length,
        conversionRate,
        avgTicket,
        totalRevenue
      };
    },
    enabled: !!effectiveClientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      <MetricCard
        title="Leads Abertos"
        value={metrics?.totalLeads ?? 0}
        icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
        color="primary"
        isLoading={isLoading}
      />
      <MetricCard
        title="Oportunidades"
        value={metrics?.opportunities ?? 0}
        icon={<Target className="h-4 w-4 sm:h-5 sm:w-5" />}
        color="cyan"
        isLoading={isLoading}
      />
      <MetricCard
        title="Vendas Fechadas"
        value={metrics?.wonDeals ?? 0}
        icon={<Trophy className="h-4 w-4 sm:h-5 sm:w-5" />}
        color="green"
        isLoading={isLoading}
      />
      <MetricCard
        title="Taxa Conversão"
        value={`${(metrics?.conversionRate ?? 0).toFixed(1)}%`}
        icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
        color="orange"
        isLoading={isLoading}
      />
      <MetricCard
        title="Ticket Médio"
        value={formatCurrency(metrics?.avgTicket ?? 0)}
        icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />}
        color="purple"
        isLoading={isLoading}
      />
    </div>
  );
}
