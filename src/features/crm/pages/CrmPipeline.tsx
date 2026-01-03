import { useState, useMemo, useEffect } from 'react';
import { startOfMonth } from 'date-fns';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Kanban, List } from 'lucide-react';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';
import { DealListView } from '../components/pipeline/DealListView';
import { AddDealDialog } from '../components/pipeline/AddDealDialog';
import { PipelineFiltersSheet, type PipelineFilters } from '../components/pipeline/PipelineFiltersSheet';
import { PipelineMetrics } from '../components/pipeline/PipelineMetrics';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import { useDeals } from '../hooks/useDeals';
import { useFunnels } from '@/hooks/useCrmData';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function CrmPipeline() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;
  const { deals, addDeal, isLoading } = useDeals();
  const { data: funnels = [], isLoading: loadingFunnels } = useFunnels();
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filters, setFilters] = useState<PipelineFilters>({});
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>('');

  // Auto-select default funnel when funnels are loaded
  useEffect(() => {
    if (funnels.length > 0 && !selectedFunnelId) {
      const defaultFunnel = funnels.find(f => f.is_default) || funnels[0];
      setSelectedFunnelId(defaultFunnel.id);
    }
  }, [funnels, selectedFunnelId]);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // Seller filter
      if (filters.sellerId && deal.assigned_to_id !== filters.sellerId) {
        return false;
      }
      // Source filter
      if (filters.source && deal.source !== filters.source) {
        return false;
      }
      // Stage filter
      if (filters.stageId && deal.stage_id !== filters.stageId) {
        return false;
      }
      // Created date filter
      if (filters.createdDateStart) {
        const dealDate = new Date(deal.created_at);
        if (dealDate < filters.createdDateStart) return false;
      }
      if (filters.createdDateEnd) {
        const dealDate = new Date(deal.created_at);
        if (dealDate > filters.createdDateEnd) return false;
      }
      // Closed date filter
      if (filters.closedDateStart && deal.closed_at) {
        const closedDate = new Date(deal.closed_at);
        if (closedDate < filters.closedDateStart) return false;
      }
      if (filters.closedDateEnd && deal.closed_at) {
        const closedDate = new Date(deal.closed_at);
        if (closedDate > filters.closedDateEnd) return false;
      }
      return true;
    });
  }, [deals, filters]);

  return (
    <div className="flex flex-col h-full p-4 lg:p-6">
      {/* Header fixo */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">Pipeline de Vendas</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie seus deals e acompanhe o progresso do funil
              </p>
            </div>
            {/* Funnel Selector */}
            {funnels.length > 0 && (
              <Select value={selectedFunnelId} onValueChange={setSelectedFunnelId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecione um funil" />
                </SelectTrigger>
                <SelectContent>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      <span className="flex items-center gap-2">
                        {funnel.name}
                        {funnel.is_default && (
                          <Badge variant="secondary" className="text-xs">Padrão</Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 flex-wrap">
            <PeriodFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <div className="flex items-center gap-2">
              <PipelineFiltersSheet filters={filters} onFiltersChange={setFilters} />
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v as 'kanban' | 'list')}
                className="flex-shrink-0"
              >
                <ToggleGroupItem value="kanban" aria-label="Visualização Kanban">
                  <Kanban className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Visualização Lista">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <AddDealDialog onAdd={addDeal} clientId={effectiveClientId || ''} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="flex-shrink-0 pb-4">
        <PipelineMetrics />
      </div>

      {/* Área de scroll do Kanban */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <KanbanBoard filteredDeals={filteredDeals} funnelId={selectedFunnelId} />
        ) : (
          <div className="overflow-auto h-full">
            <DealListView deals={filteredDeals} funnelId={selectedFunnelId} />
          </div>
        )}
      </div>
    </div>
  );
}
