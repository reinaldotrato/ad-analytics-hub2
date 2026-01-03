import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSellers } from '../../hooks/useSellers';

interface ProductivityFiltersProps {
  filters: {
    selectedSellerId: string | null;
    startDate: Date;
    endDate: Date;
    taskTypeFilter: string | null;
  };
  setFilters: {
    setSelectedSellerId: (id: string | null) => void;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
    setTaskTypeFilter: (type: string | null) => void;
  };
}

const TASK_TYPES = [
  { value: 'call', label: 'Ligação' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'task', label: 'Tarefa' },
  { value: 'follow_up', label: 'Follow-up' },
];

const PERIOD_PRESETS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 15 dias', days: 15 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 60 dias', days: 60 },
  { label: 'Últimos 90 dias', days: 90 },
];

export function ProductivityFilters({ filters, setFilters }: ProductivityFiltersProps) {
  const { data: sellers = [] } = useSellers();

  const handlePeriodPreset = (days: number) => {
    setFilters.setStartDate(subDays(new Date(), days));
    setFilters.setEndDate(new Date());
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Filtro de Vendedor */}
      <Select
        value={filters.selectedSellerId || 'all'}
        onValueChange={(value) => setFilters.setSelectedSellerId(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos os vendedores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os vendedores</SelectItem>
          {sellers.map((seller) => (
            <SelectItem key={seller.id} value={seller.id}>
              {seller.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro de Tipo de Tarefa */}
      <Select
        value={filters.taskTypeFilter || 'all'}
        onValueChange={(value) => setFilters.setTaskTypeFilter(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tipo de tarefa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {TASK_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Período Presets */}
      <Select
        onValueChange={(value) => handlePeriodPreset(parseInt(value))}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_PRESETS.map((preset) => (
            <SelectItem key={preset.days} value={preset.days.toString()}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Data Início */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[140px] justify-start text-left font-normal',
              !filters.startDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data início'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.startDate}
            onSelect={(date) => date && setFilters.setStartDate(date)}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      {/* Data Fim */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[140px] justify-start text-left font-normal',
              !filters.endDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data fim'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.endDate}
            onSelect={(date) => date && setFilters.setEndDate(date)}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
