import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useLossReasons, useCreateLossReason, useUpdateLossReason, useDeleteLossReason } from '@/hooks/useCrmData';
import { toast } from 'sonner';

export function LossReasonsTab() {
  const { data: lossReasons = [], isLoading } = useLossReasons();
  const createLossReason = useCreateLossReason();
  const updateLossReason = useUpdateLossReason();
  const deleteLossReason = useDeleteLossReason();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<{ id: string; name: string; description: string; is_active: boolean } | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsActive(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    try {
      await createLossReason.mutateAsync({ name, description, is_active: isActive });
      toast.success('Motivo de perda criado com sucesso');
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao criar motivo de perda');
    }
  };

  const handleUpdate = async () => {
    if (!editingReason || !name.trim()) return;
    try {
      await updateLossReason.mutateAsync({ id: editingReason.id, updates: { name, description, is_active: isActive } });
      toast.success('Motivo de perda atualizado');
      setEditingReason(null);
      resetForm();
    } catch (error) {
      toast.error('Erro ao atualizar motivo de perda');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este motivo de perda?')) return;
    try {
      await deleteLossReason.mutateAsync(id);
      toast.success('Motivo de perda excluído');
    } catch (error) {
      toast.error('Erro ao excluir motivo de perda');
    }
  };

  const openEdit = (reason: { id: string; name: string; description?: string; is_active?: boolean }) => {
    setEditingReason({ 
      id: reason.id, 
      name: reason.name, 
      description: reason.description || '', 
      is_active: reason.is_active ?? true 
    });
    setName(reason.name);
    setDescription(reason.description || '');
    setIsActive(reason.is_active ?? true);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando motivos de perda...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Motivos de Perda</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Motivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Motivo de Perda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ex: Preço alto" 
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Descrição do motivo..." 
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="is_active" 
                  checked={isActive} 
                  onCheckedChange={setIsActive} 
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={createLossReason.isPending}>Criar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {lossReasons.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum motivo de perda cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lossReasons.map((reason) => (
                <TableRow key={reason.id}>
                  <TableCell className="font-medium">{reason.name}</TableCell>
                  <TableCell className="text-muted-foreground">{reason.description || '-'}</TableCell>
                  <TableCell>
                    {reason.is_active ? (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(reason)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(reason.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingReason} onOpenChange={(open) => {
          if (!open) {
            setEditingReason(null);
            resetForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Motivo de Perda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome *</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="edit-is_active" 
                  checked={isActive} 
                  onCheckedChange={setIsActive} 
                />
                <Label htmlFor="edit-is_active">Ativo</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingReason(null)}>Cancelar</Button>
                <Button onClick={handleUpdate} disabled={updateLossReason.isPending}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
