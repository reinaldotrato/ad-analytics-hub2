import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreVertical, Settings, Plus, Calendar, DollarSign, User, Clock, Pencil, Save, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DetailData, DetailEntityType } from '../../hooks/useDetailData';
import { DealFormDialog } from '../deals/DealFormDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { fixEncoding } from '@/lib/fixEncoding';
import { useCustomFieldDefinitions, useUpdateDeal, useCreateCustomFieldDefinition, type CrmDeal } from '@/hooks/useCrmData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface DetailLeftSidebarProps {
  type: DetailEntityType;
  data: DetailData;
}

export function DetailLeftSidebar({ type, data }: DetailLeftSidebarProps) {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomFields, setEditingCustomFields] = useState(false);
  const [createFieldDialogOpen, setCreateFieldDialogOpen] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>(
    (data.custom_fields as Record<string, unknown>) || {}
  );
  
  // New field form state
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const { data: customFieldDefinitions = [] } = useCustomFieldDefinitions(type === 'deal' ? 'deal' : type);
  const updateDeal = useUpdateDeal();
  const createCustomField = useCreateCustomFieldDefinition();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Não definido';
    try {
      return format(new Date(dateStr), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const handleEditDeal = (dealData: Partial<CrmDeal>) => {
    // Remove contact field from updates (it's a relation, not updatable directly)
    const { contact, funnel_stage, assigned_to, ...updates } = dealData as Record<string, unknown>;
    updateDeal.mutate(
      { id: data.id, updates: updates as Partial<CrmDeal> },
      {
        onSuccess: () => {
          toast.success('Negócio atualizado com sucesso');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', type, data.id] });
          setEditDialogOpen(false);
        },
        onError: () => {
          toast.error('Erro ao atualizar negócio');
        },
      }
    );
  };

  const handleSaveCustomFields = () => {
    if (type === 'deal') {
      updateDeal.mutate(
        { id: data.id, updates: { custom_fields: customFieldValues } },
        {
          onSuccess: () => {
            toast.success('Campos personalizados salvos');
            queryClient.invalidateQueries({ queryKey: ['crm-detail', type, data.id] });
            setEditingCustomFields(false);
          },
          onError: () => {
            toast.error('Erro ao salvar campos');
          },
        }
      );
    }
  };

  const renderCustomFieldInput = (field: { id: string; name: string; field_type: string; options?: unknown }) => {
    const value = customFieldValues[field.id];
    
    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            className="h-8 text-sm"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.id]: parseFloat(e.target.value) || 0 }))}
            className="h-8 text-sm"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            className="h-8 text-sm"
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) => setCustomFieldValues(prev => ({ ...prev, [field.id]: checked }))}
          />
        );
      case 'select':
        const options = Array.isArray(field.options) ? field.options : [];
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
            className="w-full h-8 text-sm rounded-md border border-input bg-background px-3"
          >
            <option value="">Selecione...</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const renderCustomFieldValue = (field: { id: string; name: string; field_type: string }) => {
    const value = customFieldValues[field.id];
    if (value === undefined || value === null || value === '') return 'Não preenchido';
    
    if (field.field_type === 'checkbox') return value ? 'Sim' : 'Não';
    if (field.field_type === 'date' && value) {
      try {
        return format(new Date(value as string), "dd/MM/yyyy", { locale: ptBR });
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const getMainFields = () => {
    if (type === 'deal') {
      return [
        { 
          label: 'Valor', 
          value: formatCurrency(data.value || 0),
          icon: DollarSign 
        },
        { 
          label: 'Data prevista', 
          value: formatDate(data.expected_close_date),
          icon: Calendar 
        },
        { 
          label: 'Data que ganhou', 
          value: data.closed_at ? formatDate(data.closed_at) : 'Não fechado',
          icon: Calendar 
        },
        { 
          label: 'Responsável', 
          value: data.assigned_to?.name || data.assigned_to?.email || 'Não atribuído',
          icon: User 
        },
        { 
          label: 'Probabilidade', 
          value: `${data.probability || 0}%`,
          icon: Clock 
        },
      ];
    } else if (type === 'contact') {
      return [
        { label: 'Email', value: data.email || 'Não informado', icon: null },
        { label: 'Telefone', value: data.phone || 'Não informado', icon: null },
        { label: 'Celular', value: data.mobile_phone || 'Não informado', icon: null },
        { label: 'Cargo', value: data.position || 'Não informado', icon: null },
      ];
    } else if (type === 'company') {
      return [
        { label: 'CNPJ', value: data.cnpj || 'Não cadastrado', icon: null },
        { label: 'Email', value: data.email || 'Não informado', icon: null },
        { label: 'Telefone', value: data.phone || 'Não informado', icon: null },
        { label: 'Site', value: data.website || 'Não cadastrado', icon: null },
        { label: 'Endereço', value: data.address || 'Não cadastrado', icon: null },
        { label: 'Cidade/Estado', value: data.city && data.state ? `${data.city}, ${data.state}` : 'Não informado', icon: null },
      ];
    }
    return [];
  };

  const mainFields = getMainFields();

  return (
    <div className="space-y-4">
      {/* Card Principal */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <CardTitle className="text-lg break-words line-clamp-2">
                {fixEncoding(data.name)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Criado em {formatDate(data.created_at)}
              </p>
            </div>
            {type === 'deal' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil size={16} className="mr-2" />
                    Editar Negócio
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {type !== 'deal' && (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={18} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Badge for Deals */}
          {type === 'deal' && data.funnel_stage && (
            <div 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
              style={{ 
                backgroundColor: `${data.funnel_stage.color}20`,
                color: data.funnel_stage.color 
              }}
            >
              {data.funnel_stage.name}
            </div>
          )}

          {/* Campos Principais */}
          <div className="space-y-3">
            {mainFields.map((field) => (
              <div key={field.label} className="flex justify-between items-start">
                <span className="text-muted-foreground text-sm">{field.label}</span>
                <span className="font-medium text-foreground text-sm text-right max-w-[60%] truncate">
                  {field.value}
                </span>
              </div>
            ))}
          </div>

          {/* Origin/Source for deals */}
          {type === 'deal' && data.source && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground text-sm">Origem</span>
                <span className="font-medium text-foreground text-sm">{data.source}</span>
              </div>
            </div>
          )}

          {/* Lost reason */}
          {type === 'deal' && data.status === 'lost' && data.lost_reason && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm font-medium text-destructive">Motivo da perda:</p>
              <p className="text-sm text-destructive/80">{data.lost_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campos Personalizados */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings size={18} />
              Campos Personalizados
            </CardTitle>
            {editingCustomFields ? (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    setCustomFieldValues((data.custom_fields as Record<string, unknown>) || {});
                    setEditingCustomFields(false);
                  }}
                >
                  <X size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary"
                  onClick={handleSaveCustomFields}
                >
                  <Save size={18} />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-primary"
                onClick={() => setEditingCustomFields(true)}
              >
                <Plus size={18} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {customFieldDefinitions.length > 0 ? (
            <div className="space-y-3">
              {customFieldDefinitions.map((field) => (
                <div key={field.id} className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground text-sm flex-shrink-0">{field.name}</span>
                  {editingCustomFields ? (
                    <div className="flex-1 max-w-[60%]">
                      {renderCustomFieldInput(field)}
                    </div>
                  ) : (
                    <span className="font-medium text-foreground text-sm text-right max-w-[60%] truncate">
                      {renderCustomFieldValue(field)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">Nenhum campo configurado</p>
              <Button 
                variant="link" 
                className="h-auto p-0 text-primary text-sm"
                onClick={() => setCreateFieldDialogOpen(true)}
              >
                Criar campo personalizado
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Criar Campo Personalizado */}
      <Dialog open={createFieldDialogOpen} onOpenChange={setCreateFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Campo Personalizado</DialogTitle>
            <DialogDescription>
              Crie um novo campo personalizado para seus negócios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Nome do Campo *</Label>
              <Input
                id="fieldName"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Ex: Data de Follow-up"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Tipo do Campo *</Label>
              <Select value={newFieldType} onValueChange={setNewFieldType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="select">Seleção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newFieldType === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="fieldOptions">Opções (separadas por vírgula)</Label>
                <Textarea
                  id="fieldOptions"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="Opção 1, Opção 2, Opção 3"
                  className="min-h-20"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="fieldRequired"
                checked={newFieldRequired}
                onCheckedChange={(checked) => setNewFieldRequired(!!checked)}
              />
              <Label htmlFor="fieldRequired" className="text-sm font-normal">
                Campo obrigatório
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFieldDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!newFieldName.trim()) {
                  toast.error('Nome do campo é obrigatório');
                  return;
                }
                
                const options = newFieldType === 'select' 
                  ? newFieldOptions.split(',').map(o => o.trim()).filter(Boolean)
                  : undefined;
                
                createCustomField.mutate(
                  {
                    entity_type: type === 'deal' ? 'deal' : type,
                    name: newFieldName.trim(),
                    field_type: newFieldType,
                    options: options,
                    is_required: newFieldRequired,
                    order: customFieldDefinitions.length,
                  },
                  {
                    onSuccess: () => {
                      toast.success('Campo criado com sucesso');
                      queryClient.invalidateQueries({ queryKey: ['crm-custom-fields'] });
                      setCreateFieldDialogOpen(false);
                      setNewFieldName('');
                      setNewFieldType('text');
                      setNewFieldOptions('');
                      setNewFieldRequired(false);
                    },
                    onError: () => {
                      toast.error('Erro ao criar campo');
                    },
                  }
                );
              }}
              disabled={createCustomField.isPending}
            >
              {createCustomField.isPending ? 'Criando...' : 'Criar Campo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição do Deal */}
      {type === 'deal' && (
        <DealFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          deal={{
            id: data.id,
            name: data.name,
            value: data.value,
            stage_id: data.stage_id,
            contact_id: data.contact_id,
            assigned_to_id: data.assigned_to_id,
            source: data.source,
            probability: data.probability,
            expected_close_date: data.expected_close_date,
          }}
          onSave={handleEditDeal}
        />
      )}
    </div>
  );
}

export default DetailLeftSidebar;
