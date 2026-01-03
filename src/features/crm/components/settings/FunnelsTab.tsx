import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Pencil, Trash2, Star, StarOff } from 'lucide-react';
import { useFunnels, useCreateFunnel, useUpdateFunnel, useDeleteFunnel, useSetDefaultFunnel } from '@/hooks/useCrmData';
import { toast } from 'sonner';

export function FunnelsTab() {
  const { data: funnels = [], isLoading } = useFunnels();
  const createFunnel = useCreateFunnel();
  const updateFunnel = useUpdateFunnel();
  const deleteFunnel = useDeleteFunnel();
  const setDefaultFunnel = useSetDefaultFunnel();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfirmCreateOpen, setIsConfirmCreateOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<{ id: string; name: string; description: string; is_default: boolean } | null>(null);
  const [deletingFunnelId, setDeletingFunnelId] = useState<string | null>(null);
  const [deletingFunnelName, setDeletingFunnelName] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const currentDefaultFunnel = funnels.find(f => f.is_default);

  const checkDuplicateName = (funnelName: string, excludeId?: string): boolean => {
    return funnels.some(f => {
      if (excludeId && f.id === excludeId) return false;
      return f.name.toLowerCase().trim() === funnelName.toLowerCase().trim();
    });
  };

  const validateAndConfirmCreate = () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (checkDuplicateName(name)) {
      toast.error('Já existe um funil com este nome');
      return;
    }
    
    setIsConfirmCreateOpen(true);
  };

  const handleCreate = async () => {
    setIsConfirmCreateOpen(false);
    try {
      // First funnel is always default, or if user marked it as default
      const shouldBeDefault = funnels.length === 0 || isDefault;
      await createFunnel.mutateAsync({ name: name.trim(), description, is_default: shouldBeDefault });
      toast.success('Funil criado com sucesso');
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao criar funil');
    }
  };

  const handleUpdate = async () => {
    if (!editingFunnel || !name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (checkDuplicateName(name, editingFunnel.id)) {
      toast.error('Já existe um funil com este nome');
      return;
    }

    // Prevent unmarking the only default funnel
    if (editingFunnel.is_default && !isDefault && funnels.length > 0) {
      const otherDefaultExists = funnels.some(f => f.id !== editingFunnel.id && f.is_default);
      if (!otherDefaultExists) {
        toast.error('Deve haver pelo menos um funil padrão. Defina outro funil como padrão primeiro.');
        return;
      }
    }
    
    try {
      await updateFunnel.mutateAsync({ 
        id: editingFunnel.id, 
        updates: { name: name.trim(), description, is_default: isDefault } 
      });
      toast.success('Funil atualizado');
      setEditingFunnel(null);
      resetForm();
    } catch (error) {
      toast.error('Erro ao atualizar funil');
    }
  };

  const handleDelete = async () => {
    if (!deletingFunnelId) return;
    try {
      await deleteFunnel.mutateAsync(deletingFunnelId);
      toast.success('Funil excluído');
    } catch (error) {
      toast.error('Erro ao excluir funil');
    } finally {
      setDeletingFunnelId(null);
      setDeletingFunnelName('');
    }
  };

  const handleSetDefault = async (funnelId: string) => {
    try {
      await setDefaultFunnel.mutateAsync(funnelId);
      toast.success('Funil definido como padrão');
    } catch (error) {
      toast.error('Erro ao definir funil padrão');
    }
  };

  const openDeleteConfirm = (funnel: { id: string; name: string }) => {
    setDeletingFunnelId(funnel.id);
    setDeletingFunnelName(funnel.name);
  };

  const openEdit = (funnel: { id: string; name: string; description?: string; is_default?: boolean }) => {
    setEditingFunnel({ 
      id: funnel.id, 
      name: funnel.name, 
      description: funnel.description || '',
      is_default: funnel.is_default || false
    });
    setName(funnel.name);
    setDescription(funnel.description || '');
    setIsDefault(funnel.is_default || false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsDefault(false);
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) resetForm();
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando funis...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Funis de Vendas</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={handleCreateDialogChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Funil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Funil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Funil de Vendas" />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do funil..." />
              </div>
              {funnels.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="is-default" className="text-sm font-medium">Definir como funil padrão</Label>
                    {isDefault && currentDefaultFunnel && (
                      <p className="text-xs text-muted-foreground">
                        O funil "{currentDefaultFunnel.name}" deixará de ser o padrão
                      </p>
                    )}
                  </div>
                  <Switch
                    id="is-default"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                </div>
              )}
              {funnels.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Este será o primeiro funil e será definido como padrão automaticamente.
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleCreateDialogChange(false)}>Cancelar</Button>
                <Button onClick={validateAndConfirmCreate} disabled={createFunnel.isPending}>Criar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirm Create Dialog */}
        <AlertDialog open={isConfirmCreateOpen} onOpenChange={setIsConfirmCreateOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar criação de funil</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja realmente criar o funil "{name}"?
                {isDefault && currentDefaultFunnel && (
                  <span className="block mt-2 text-amber-600 dark:text-amber-400">
                    O funil "{currentDefaultFunnel.name}" deixará de ser o padrão.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreate} disabled={createFunnel.isPending}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        {funnels.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum funil cadastrado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Padrão</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funnels.map((funnel) => (
                <TableRow key={funnel.id}>
                  <TableCell className="font-medium">{funnel.name}</TableCell>
                  <TableCell className="text-muted-foreground">{funnel.description || '-'}</TableCell>
                  <TableCell>
                    {funnel.is_default && <Badge variant="secondary">Padrão</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => !funnel.is_default && handleSetDefault(funnel.id)}
                              disabled={funnel.is_default || setDefaultFunnel.isPending}
                              className={funnel.is_default ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}
                            >
                              {funnel.is_default ? (
                                <Star className="h-4 w-4 fill-current" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {funnel.is_default ? 'Este é o funil padrão' : 'Definir como padrão'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(funnel)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(funnel)}>
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
        <AlertDialog open={!!deletingFunnelId} onOpenChange={(open) => { if (!open) { setDeletingFunnelId(null); setDeletingFunnelName(''); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir funil</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o funil "{deletingFunnelName}"?
                <br />
                <span className="text-destructive font-medium">Etapas e deals associados podem ser afetados.</span>
                {funnels.find(f => f.id === deletingFunnelId)?.is_default && funnels.length > 1 && (
                  <span className="block mt-2 text-amber-600 dark:text-amber-400">
                    Este é o funil padrão. Outro funil será definido como padrão automaticamente.
                  </span>
                )}
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
        <Dialog open={!!editingFunnel} onOpenChange={(open) => { if (!open) { setEditingFunnel(null); resetForm(); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Funil</DialogTitle>
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
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-is-default" className="text-sm font-medium">Funil padrão</Label>
                  {editingFunnel?.is_default && !isDefault && (
                    <p className="text-xs text-destructive">
                      Não é possível desmarcar o único funil padrão
                    </p>
                  )}
                  {!editingFunnel?.is_default && isDefault && currentDefaultFunnel && (
                    <p className="text-xs text-muted-foreground">
                      O funil "{currentDefaultFunnel.name}" deixará de ser o padrão
                    </p>
                  )}
                </div>
                <Switch
                  id="edit-is-default"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                  disabled={editingFunnel?.is_default && funnels.filter(f => f.is_default).length === 1}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setEditingFunnel(null); resetForm(); }}>Cancelar</Button>
                <Button onClick={handleUpdate} disabled={updateFunnel.isPending}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
