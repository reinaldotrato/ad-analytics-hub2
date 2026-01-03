import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useContacts, useFunnels, type CrmDeal } from '@/hooks/useCrmData';
import { useFunnelStages } from '../../hooks/useFunnelStages';
import { useSellers } from '../../hooks/useSellers';

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Partial<CrmDeal> | null;
  onSave: (deal: Partial<CrmDeal>) => void;
}

const DEAL_SOURCES = [
  'Website',
  'Indicação',
  'LinkedIn',
  'Google Ads',
  'Meta Ads',
  'E-mail Marketing',
  'Evento',
  'Telefone',
  'Outro',
];

export function DealFormDialog({ open, onOpenChange, deal, onSave }: DealFormDialogProps) {
  const { data: contacts = [] } = useContacts();
  const { data: funnels = [] } = useFunnels();
  const { data: sellers = [] } = useSellers();

  const [formData, setFormData] = useState({
    funnel_id: '',
    name: '',
    value: '',
    stage_id: '',
    contact_id: '',
    assigned_to_id: '',
    source: '',
    probability: '50',
    expected_close_date: undefined as Date | undefined,
  });

  // Busca etapas apenas do funil selecionado
  const { stages } = useFunnelStages(formData.funnel_id || undefined);

  // Busca todas as etapas para detectar o funil da etapa atual (ao editar)
  const { stages: allStages } = useFunnelStages();

  // Detectar funil ao editar deal existente
  useEffect(() => {
    if (deal && deal.stage_id && allStages.length > 0 && !formData.funnel_id) {
      const currentStage = allStages.find(s => s.id === deal.stage_id);
      if (currentStage?.funnel_id) {
        setFormData(prev => ({ ...prev, funnel_id: currentStage.funnel_id! }));
      }
    }
  }, [deal, allStages]);

  useEffect(() => {
    if (deal) {
      setFormData(prev => ({
        ...prev,
        name: deal.name || '',
        value: deal.value?.toString() || '',
        stage_id: deal.stage_id || '',
        contact_id: deal.contact_id || '',
        assigned_to_id: deal.assigned_to_id || '',
        source: deal.source || '',
        probability: deal.probability?.toString() || '50',
        expected_close_date: deal.expected_close_date ? new Date(deal.expected_close_date) : undefined,
      }));
    } else {
      // Para novo deal, selecionar funil padrão
      const defaultFunnel = funnels.find(f => f.is_default) || funnels[0];
      setFormData({
        funnel_id: defaultFunnel?.id || '',
        name: '',
        value: '',
        stage_id: '',
        contact_id: '',
        assigned_to_id: '',
        source: '',
        probability: '50',
        expected_close_date: undefined,
      });
    }
  }, [deal, open, funnels]);

  // Limpar etapa quando funil mudar
  const handleFunnelChange = (funnelId: string) => {
    setFormData(prev => ({
      ...prev,
      funnel_id: funnelId === '__none__' ? '' : funnelId,
      stage_id: '', // Limpa etapa ao trocar funil
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      value: parseFloat(formData.value) || 0,
      stage_id: formData.stage_id || undefined,
      contact_id: formData.contact_id || undefined,
      assigned_to_id: formData.assigned_to_id || undefined,
      source: formData.source || undefined,
      probability: parseInt(formData.probability) || 50,
      expected_close_date: formData.expected_close_date?.toISOString().split('T')[0],
    });
    onOpenChange(false);
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const number = parseFloat(numericValue) / 100;
    if (isNaN(number)) return '';
    return number.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = parseFloat(rawValue) / 100;
    setFormData({ ...formData, value: isNaN(numericValue) ? '' : numericValue.toString() });
  };

  const isEditing = !!deal?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Negócio' : 'Novo Negócio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Negócio *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Projeto Website"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                value={formData.value ? formatCurrency((parseFloat(formData.value) * 100).toString()) : ''}
                onChange={handleValueChange}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probabilidade (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                placeholder="50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funnel">Funil</Label>
            <Select
              value={formData.funnel_id || '__none__'}
              onValueChange={handleFunnelChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o funil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Selecione...</SelectItem>
                {funnels.map((funnel) => (
                  <SelectItem key={funnel.id} value={funnel.id}>
                    {funnel.name}
                    {funnel.is_default && ' (Padrão)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Etapa do Funil</Label>
              <Select
                value={formData.stage_id || '__none__'}
                onValueChange={(v) => setFormData({ ...formData, stage_id: v === '__none__' ? '' : v })}
                disabled={!formData.funnel_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.funnel_id ? "Selecione a etapa" : "Selecione um funil primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Selecione...</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <Select
                value={formData.source || '__none__'}
                onValueChange={(v) => setFormData({ ...formData, source: v === '__none__' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Selecione...</SelectItem>
                  {DEAL_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contato</Label>
              <Select
                value={formData.contact_id || '__none__'}
                onValueChange={(v) => setFormData({ ...formData, contact_id: v === '__none__' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum contato</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned">Responsável</Label>
              <Select
                value={formData.assigned_to_id || '__none__'}
                onValueChange={(v) => setFormData({ ...formData, assigned_to_id: v === '__none__' ? '' : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem responsável</SelectItem>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data Prevista de Fechamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.expected_close_date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expected_close_date
                    ? format(formData.expected_close_date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expected_close_date}
                  onSelect={(date) => setFormData({ ...formData, expected_close_date: date })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar' : 'Criar Negócio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
