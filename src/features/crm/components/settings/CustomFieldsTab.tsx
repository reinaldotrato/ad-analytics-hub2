import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useCustomFieldDefinitions, 
  useCreateCustomFieldDefinition, 
  useUpdateCustomFieldDefinition, 
  useDeleteCustomFieldDefinition,
  type CrmCustomFieldDefinition 
} from '@/hooks/useCrmData';

const ENTITY_TYPES = [
  { value: 'deal', label: 'Negócios' },
  { value: 'contact', label: 'Contatos' },
  { value: 'company', label: 'Empresas' },
];

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Seleção' },
  { value: 'checkbox', label: 'Checkbox' },
];

export function CustomFieldsTab() {
  const [selectedEntity, setSelectedEntity] = useState<'deal' | 'contact' | 'company'>('deal');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CrmCustomFieldDefinition | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    field_type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    is_required: boolean;
    options: string[];
  }>({
    name: '',
    field_type: 'text',
    is_required: false,
    options: [],
  });
  const [optionInput, setOptionInput] = useState('');

  const { data: fields = [], isLoading } = useCustomFieldDefinitions(selectedEntity);
  const createField = useCreateCustomFieldDefinition();
  const updateField = useUpdateCustomFieldDefinition();
  const deleteField = useDeleteCustomFieldDefinition();

  const handleOpenDialog = (field?: CrmCustomFieldDefinition) => {
    if (field) {
      setEditingField(field);
      setFormData({
        name: field.name,
        field_type: field.field_type as 'text' | 'number' | 'date' | 'select' | 'checkbox',
        is_required: field.is_required || false,
        options: Array.isArray(field.options) ? field.options as string[] : [],
      });
    } else {
      setEditingField(null);
      setFormData({
        name: '',
        field_type: 'text',
        is_required: false,
        options: [],
      });
    }
    setOptionInput('');
    setDialogOpen(true);
  };

  const handleAddOption = () => {
    const input = optionInput.trim();
    if (!input) return;

    // Se contém vírgula, separar em múltiplas opções
    const newOptions = input.includes(',')
      ? input.split(',').map(o => o.trim()).filter(o => o.length > 0)
      : [input];

    // Adicionar apenas opções que ainda não existem
    const uniqueNewOptions = newOptions.filter(opt => !formData.options.includes(opt));

    if (uniqueNewOptions.length > 0) {
      setFormData({
        ...formData,
        options: [...formData.options, ...uniqueNewOptions],
      });
    }
    setOptionInput('');
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do campo é obrigatório');
      return;
    }

    const data = {
      name: formData.name,
      field_type: formData.field_type,
      entity_type: selectedEntity,
      is_required: formData.is_required,
      options: formData.field_type === 'select' ? formData.options : [],
      order: fields.length,
    };

    if (editingField) {
      updateField.mutate(
        { id: editingField.id, updates: data },
        {
          onSuccess: () => {
            toast.success('Campo atualizado com sucesso');
            setDialogOpen(false);
          },
          onError: () => toast.error('Erro ao atualizar campo'),
        }
      );
    } else {
      createField.mutate(data, {
        onSuccess: () => {
          toast.success('Campo criado com sucesso');
          setDialogOpen(false);
        },
        onError: () => toast.error('Erro ao criar campo'),
      });
    }
  };

  const handleDelete = (field: CrmCustomFieldDefinition) => {
    if (confirm(`Deseja excluir o campo "${field.name}"?`)) {
      deleteField.mutate(field.id, {
        onSuccess: () => toast.success('Campo excluído'),
        onError: () => toast.error('Erro ao excluir campo'),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Campos Personalizados</CardTitle>
            <CardDescription>
              Crie campos personalizados para armazenar informações extras
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Campo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entity Type Selector */}
        <div className="flex gap-2">
          {ENTITY_TYPES.map((entity) => (
            <Button
              key={entity.value}
              variant={selectedEntity === entity.value ? 'default' : 'outline'}
              onClick={() => setSelectedEntity(entity.value as 'deal' | 'contact' | 'company')}
            >
              {entity.label}
            </Button>
          ))}
        </div>

        {/* Fields Table */}
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum campo personalizado criado para {ENTITY_TYPES.find(e => e.value === selectedEntity)?.label}</p>
            <Button variant="link" onClick={() => handleOpenDialog()}>
              Criar primeiro campo
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Obrigatório</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{field.name}</TableCell>
                  <TableCell>
                    {FIELD_TYPES.find(t => t.value === field.field_type)?.label}
                  </TableCell>
                  <TableCell>
                    {field.is_required ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(field)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(field)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Editar Campo' : 'Novo Campo Personalizado'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Campo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: CPF, Observações"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field_type">Tipo de Campo</Label>
              <Select
                value={formData.field_type}
                onValueChange={(v) => setFormData({ ...formData, field_type: v as typeof formData.field_type })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.field_type === 'select' && (
              <div className="space-y-2">
                <Label>Opções</Label>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Digite opções (separadas por vírgula)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddOption}>
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ex: Opção 1, Opção 2, Opção 3
                  </p>
                </div>
                {formData.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.options.map((opt, i) => (
                      <div
                        key={i}
                        className="bg-muted px-2 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(i)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
              <Label htmlFor="is_required">Campo obrigatório</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createField.isPending || updateField.isPending}>
                {editingField ? 'Salvar' : 'Criar Campo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
