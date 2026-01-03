import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { useFunnels, useFunnelStagesSupabase, useCreateFunnelStage, useUpdateFunnelStage, useDeleteFunnelStage } from '@/hooks/useCrmData';
import { toast } from 'sonner';

const STAGE_COLORS = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#F97316', label: 'Laranja' },
  { value: '#EAB308', label: 'Amarelo' },
  { value: '#10B981', label: 'Verde' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#6B7280', label: 'Cinza' },
];

export function StagesTab() {
  const { data: funnels = [] } = useFunnels();
  const { data: stages = [], isLoading } = useFunnelStagesSupabase();
  const createStage = useCreateFunnelStage();
  const updateStage = useUpdateFunnelStage();
  const deleteStage = useDeleteFunnelStage();

  const [selectedFunnelId, setSelectedFunnelId] = useState<string>('__all__');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfirmCreateOpen, setIsConfirmCreateOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<any>(null);
  const [deletingStageId, setDeletingStageId] = useState<string | null>(null);
  const [deletingStageName, setDeletingStageName] = useState<string>('');

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);

  const filteredStages = selectedFunnelId === '__all__' 
    ? stages 
    : stages.filter(s => s.funnel_id === selectedFunnelId || (!s.funnel_id && selectedFunnelId === '__none__'));

  const resetForm = () => {
    setName('');
    setColor('#3B82F6');
    setIsWon(false);
    setIsLost(false);
  };

  const checkDuplicateName = (stageName: string, excludeId?: string): boolean => {
    const targetFunnelId = selectedFunnelId !== '__all__' && selectedFunnelId !== '__none__' 
      ? selectedFunnelId 
      : null;
    
    return stages.some(s => {
      if (excludeId && s.id === excludeId) return false;
      const sameName = s.name.toLowerCase().trim() === stageName.toLowerCase().trim();
      const sameFunnel = targetFunnelId 
        ? s.funnel_id === targetFunnelId 
        : (!s.funnel_id || s.funnel_id === null);
      return sameName && sameFunnel;
    });
  };

  const validateAndConfirmCreate = () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (checkDuplicateName(name)) {
      toast.error('Já existe uma etapa com este nome neste funil');
      return;
    }
    
    setIsConfirmCreateOpen(true);
  };

  const handleCreate = async () => {
    setIsConfirmCreateOpen(false);
    try {
      const maxOrder = Math.max(...stages.map(s => s.order), 0);
      await createStage.mutateAsync({
        name: name.trim(),
        color,
        is_won: isWon,
        is_lost: isLost,
        order: maxOrder + 1,
        funnel_id: selectedFunnelId !== '__all__' && selectedFunnelId !== '__none__' ? selectedFunnelId : undefined,
      });
      toast.success('Etapa criada com sucesso');
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao criar etapa');
    }
  };

  const handleUpdate = async () => {
    if (!editingStage || !name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (checkDuplicateName(name, editingStage.id)) {
      toast.error('Já existe uma etapa com este nome neste funil');
      return;
    }
    
    try {
      await updateStage.mutateAsync({
        id: editingStage.id,
        updates: { name: name.trim(), color, is_won: isWon, is_lost: isLost },
      });
      toast.success('Etapa atualizada');
      setEditingStage(null);
      resetForm();
    } catch (error) {
      toast.error('Erro ao atualizar etapa');
    }
  };

  const handleDelete = async () => {
    if (!deletingStageId) return;
    try {
      await deleteStage.mutateAsync(deletingStageId);
      toast.success('Etapa excluída');
    } catch (error) {
      toast.error('Erro ao excluir etapa');
    } finally {
      setDeletingStageId(null);
      setDeletingStageName('');
    }
  };

  const openDeleteConfirm = (stage: any) => {
    setDeletingStageId(stage.id);
    setDeletingStageName(stage.name);
  };

  const openEdit = (stage: any) => {
    setEditingStage(stage);
    setName(stage.name);
    setColor(stage.color);
    setIsWon(stage.is_won || false);
    setIsLost(stage.is_lost || false);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando etapas...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CardTitle>Etapas do Funil</CardTitle>
          <Select value={selectedFunnelId} onValueChange={setSelectedFunnelId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por funil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas as etapas</SelectItem>
              <SelectItem value="__none__">Sem funil</SelectItem>
              {funnels.map((funnel) => (
                <SelectItem key={funnel.id} value={funnel.id}>{funnel.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Etapa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Etapa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stage-name">Nome *</Label>
                <Input id="stage-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Qualificação" />
              </div>
              <div>
                <Label htmlFor="stage-color">Cor</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is-won">Marcar como "Ganho"</Label>
                <Switch id="is-won" checked={isWon} onCheckedChange={(v) => { setIsWon(v); if (v) setIsLost(false); }} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is-lost">Marcar como "Perdido"</Label>
                <Switch id="is-lost" checked={isLost} onCheckedChange={(v) => { setIsLost(v); if (v) setIsWon(false); }} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={validateAndConfirmCreate} disabled={createStage.isPending}>Criar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirm Create Dialog */}
        <AlertDialog open={isConfirmCreateOpen} onOpenChange={setIsConfirmCreateOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar criação de etapa</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja realmente criar a etapa "{name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreate} disabled={createStage.isPending}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        {filteredStages.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhuma etapa encontrada</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStages.sort((a, b) => a.order - b.order).map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  </TableCell>
                  <TableCell className="font-medium">{stage.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: stage.color }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    {stage.is_won && <Badge className="bg-green-500">Ganho</Badge>}
                    {stage.is_lost && <Badge variant="destructive">Perdido</Badge>}
                    {!stage.is_won && !stage.is_lost && <Badge variant="secondary">Aberto</Badge>}
                  </TableCell>
                  <TableCell>{stage.order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(stage)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(stage)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingStageId} onOpenChange={(open) => { if (!open) { setDeletingStageId(null); setDeletingStageName(''); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir etapa</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a etapa "{deletingStageName}"?
                <br />
                <span className="text-destructive font-medium">Deals associados a esta etapa podem ser afetados.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingStage} onOpenChange={(open) => { if (!open) { setEditingStage(null); resetForm(); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Etapa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-stage-name">Nome *</Label>
                <Input id="edit-stage-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-stage-color">Cor</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is-won">Marcar como "Ganho"</Label>
                <Switch id="edit-is-won" checked={isWon} onCheckedChange={(v) => { setIsWon(v); if (v) setIsLost(false); }} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is-lost">Marcar como "Perdido"</Label>
                <Switch id="edit-is-lost" checked={isLost} onCheckedChange={(v) => { setIsLost(v); if (v) setIsWon(false); }} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStage(null)}>Cancelar</Button>
                <Button onClick={handleUpdate} disabled={updateStage.isPending}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
