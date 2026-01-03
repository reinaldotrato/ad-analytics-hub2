import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { ReportFilters } from '../../lib/types';
import { mockSellers, mockFunnelStages } from '../../lib/mock-data';

interface ReportsFiltersTabProps {
  filters: ReportFilters;
  onUpdateFilters: (filters: Partial<ReportFilters>) => void;
  onClearFilters: () => void;
}

const sources = [
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'site', label: 'Site' },
  { value: 'referral', label: 'Indicação' },
  { value: 'manual', label: 'Manual' },
];

export function ReportsFiltersTab({ filters, onUpdateFilters, onClearFilters }: ReportsFiltersTabProps) {
  const hasActiveFilters = filters.startDate || filters.endDate || filters.seller_id || 
    filters.stage_id || (filters.status && filters.status !== 'all') || filters.source;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate 
                    ? format(filters.startDate, "PPP", { locale: ptBR })
                    : "Selecionar data"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => onUpdateFilters({ startDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data de Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate 
                    ? format(filters.endDate, "PPP", { locale: ptBR })
                    : "Selecionar data"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => onUpdateFilters({ endDate: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seller */}
          <div className="space-y-2">
            <Label>Vendedor</Label>
            <Select
              value={filters.seller_id || "all"}
              onValueChange={(value) => onUpdateFilters({ seller_id: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vendedores</SelectItem>
                {mockSellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage */}
          <div className="space-y-2">
            <Label>Etapa do Funil</Label>
            <Select
              value={filters.stage_id || "all"}
              onValueChange={(value) => onUpdateFilters({ stage_id: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as etapas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etapas</SelectItem>
                {mockFunnelStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => onUpdateFilters({ status: value as ReportFilters['status'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="won">Ganho</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label>Origem do Lead</Label>
            <Select
              value={filters.source || "all"}
              onValueChange={(value) => onUpdateFilters({ source: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as origens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm font-medium mb-2">Filtros ativos:</p>
            <div className="flex flex-wrap gap-2">
              {filters.startDate && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                  Início: {format(filters.startDate, "dd/MM/yyyy")}
                </span>
              )}
              {filters.endDate && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                  Fim: {format(filters.endDate, "dd/MM/yyyy")}
                </span>
              )}
              {filters.seller_id && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                  Vendedor: {mockSellers.find(s => s.id === filters.seller_id)?.name}
                </span>
              )}
              {filters.stage_id && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                  Etapa: {mockFunnelStages.find(s => s.id === filters.stage_id)?.name}
                </span>
              )}
              {filters.status && filters.status !== 'all' && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                  Status: {filters.status === 'won' ? 'Ganho' : filters.status === 'lost' ? 'Perdido' : 'Aberto'}
                </span>
              )}
              {filters.source && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-sm">
                  Origem: {sources.find(s => s.value === filters.source)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
