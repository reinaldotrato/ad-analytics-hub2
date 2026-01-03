import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PipelineFilters {
  sellerId?: string;
  source?: string;
  stageId?: string;
  createdDateStart?: Date;
  createdDateEnd?: Date;
  closedDateStart?: Date;
  closedDateEnd?: Date;
}

interface PipelineFiltersSheetProps {
  filters: PipelineFilters;
  onFiltersChange: (filters: PipelineFilters) => void;
}

const sources = [
  { value: 'rdstation', label: 'RD Station' },
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'site', label: 'Site' },
  { value: 'referral', label: 'Indicação' },
  { value: 'manual', label: 'Manual' },
];

export function PipelineFiltersSheet({ filters, onFiltersChange }: PipelineFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<PipelineFilters>(filters);
  const { clientId } = useAuth();

  // Fetch real sellers from database
  const { data: sellers = [] } = useQuery({
    queryKey: ['crm-sellers', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('crm_sellers')
        .select('id, name')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });

  // Fetch real funnel stages from database
  const { data: stages = [] } = useQuery({
    queryKey: ['crm-funnel-stages', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('crm_funnel_stages')
        .select('id, name, color')
        .eq('client_id', clientId)
        .order('order');
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const emptyFilters: PipelineFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const updateFilter = <K extends keyof PipelineFilters>(key: K, value: PipelineFilters[K]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filtros do Pipeline</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Vendedor */}
          <div className="space-y-2">
            <Label>Vendedor</Label>
            <Select
              value={localFilters.sellerId || '__all__'}
              onValueChange={(v) => updateFilter('sellerId', v === '__all__' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos os vendedores</SelectItem>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Origem */}
          <div className="space-y-2">
            <Label>Origem</Label>
            <Select
              value={localFilters.source || '__all__'}
              onValueChange={(v) => updateFilter('source', v === '__all__' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as origens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas as origens</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Etapa */}
          <div className="space-y-2">
            <Label>Etapa</Label>
            <Select
              value={localFilters.stageId || '__all__'}
              onValueChange={(v) => updateFilter('stageId', v === '__all__' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as etapas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas as etapas</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data de Criação */}
          <div className="space-y-2">
            <Label>Data de Criação</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start text-left font-normal',
                      !localFilters.createdDateStart && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.createdDateStart
                      ? format(localFilters.createdDateStart, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Início'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.createdDateStart}
                    onSelect={(d) => updateFilter('createdDateStart', d)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start text-left font-normal',
                      !localFilters.createdDateEnd && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.createdDateEnd
                      ? format(localFilters.createdDateEnd, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Fim'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.createdDateEnd}
                    onSelect={(d) => updateFilter('createdDateEnd', d)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Data de Fechamento */}
          <div className="space-y-2">
            <Label>Data de Fechamento</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start text-left font-normal',
                      !localFilters.closedDateStart && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.closedDateStart
                      ? format(localFilters.closedDateStart, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Início'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.closedDateStart}
                    onSelect={(d) => updateFilter('closedDateStart', d)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start text-left font-normal',
                      !localFilters.closedDateEnd && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.closedDateEnd
                      ? format(localFilters.closedDateEnd, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Fim'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.closedDateEnd}
                    onSelect={(d) => updateFilter('closedDateEnd', d)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={handleClear} className="flex-1 gap-2">
            <X className="h-4 w-4" />
            Limpar
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
