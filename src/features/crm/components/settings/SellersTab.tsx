import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { UserPlus, Trash2, Mail, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface Seller {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface PendingInvite {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  created_at: string;
}

interface SellerFormData {
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'seller';
}

export function SellersTab() {
  const { selectedClientId, clientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId : clientId;
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelInviteDialogOpen, setIsCancelInviteDialogOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<PendingInvite | null>(null);
  const [formData, setFormData] = useState<SellerFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'seller',
  });

  // Fetch active sellers (those who have confirmed their email)
  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['crm-sellers', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      const { data, error } = await supabase
        .from('crm_sellers')
        .select('*')
        .eq('client_id', effectiveClientId)
        .order('name');
      if (error) throw error;
      return data as Seller[];
    },
    enabled: !!effectiveClientId,
  });

  // Fetch pending invites
  const { data: pendingInvites = [], isLoading: isLoadingInvites } = useQuery({
    queryKey: ['crm-pending-invites', effectiveClientId],
    queryFn: async () => {
      if (!effectiveClientId) return [];
      
      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'list-pending-invites',
          clientId: effectiveClientId,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return (response.data?.pendingInvites || []) as PendingInvite[];
    },
    enabled: !!effectiveClientId,
  });

  // Create seller mutation (sends invite)
  const createSellerMutation = useMutation({
    mutationFn: async (data: SellerFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'create-seller',
          email: data.email,
          name: data.name,
          phone: data.phone,
          clientId: effectiveClientId,
          role: data.role,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-sellers'] });
      queryClient.invalidateQueries({ queryKey: ['crm-pending-invites'] });
      toast.success('Convite enviado! O vendedor receberá um email para definir sua senha.');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar convite: ${error.message}`);
    },
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: async (invite: PendingInvite) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'resend-invite',
          email: invite.email,
          name: invite.name,
          clientId: effectiveClientId,
          role: invite.role,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Convite reenviado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao reenviar convite: ${error.message}`);
    },
  });

  // Cancel invite mutation
  const cancelInviteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'cancel-invite',
          userId,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-pending-invites'] });
      toast.success('Convite cancelado');
      setIsCancelInviteDialogOpen(false);
      setInviteToCancel(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cancelar convite: ${error.message}`);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('crm_sellers')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-sellers'] });
      toast.success('Status atualizado');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Delete seller mutation
  const deleteSellerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'delete',
          userId: id,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-sellers'] });
      toast.success('Vendedor removido');
      setIsDeleteDialogOpen(false);
      setSellerToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', role: 'seller' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    createSellerMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  if (!effectiveClientId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Selecione um cliente para gerenciar vendedores
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Convites Pendentes</CardTitle>
              <Badge variant="secondary" className="ml-2">{pendingInvites.length}</Badge>
            </div>
            <CardDescription>
              Vendedores que ainda não aceitaram o convite por email
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInvites ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Convidado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-amber-500/10 text-amber-600 text-xs">
                              {getInitials(invite.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{invite.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(invite.role === 'crm_admin' || invite.role === 'manager') ? 'Gestor' : 'Vendedor'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invite.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                          <Clock className="h-3 w-3" />
                          Pendente
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => resendInviteMutation.mutate(invite)}
                                  disabled={resendInviteMutation.isPending}
                                >
                                  <RefreshCw className={`h-4 w-4 text-primary ${resendInviteMutation.isPending ? 'animate-spin' : ''}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reenviar convite</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setInviteToCancel(invite);
                                    setIsCancelInviteDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cancelar convite</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Sellers Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vendedores Confirmados</CardTitle>
            <CardDescription>
              Vendedores que já aceitaram o convite e têm acesso ao CRM
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Vendedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Novo Vendedor</DialogTitle>
                  <DialogDescription>
                    O vendedor receberá um email com um link para definir sua senha. 
                    Ele aparecerá na lista após clicar no link e criar sua senha.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vendedor@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Tipo de Acesso *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'manager' | 'seller') =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">
                          Gestor (acesso completo ao CRM e Dashboards)
                        </SelectItem>
                        <SelectItem value="seller">
                          Vendedor (apenas Pipeline e seus dados)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createSellerMutation.isPending}>
                    {createSellerMutation.isPending ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum vendedor confirmado</p>
              <p className="text-sm mt-1">Adicione vendedores e aguarde que aceitem o convite por email</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status da Conta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(seller.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{seller.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{seller.email}</TableCell>
                    <TableCell>{seller.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmada
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={seller.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: seller.id, isActive: checked })
                          }
                        />
                        <Badge variant={seller.is_active ? 'default' : 'secondary'}>
                          {seller.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSellerToDelete(seller);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remover vendedor</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete seller confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o vendedor "{sellerToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => sellerToDelete && deleteSellerMutation.mutate(sellerToDelete.id)}
              disabled={deleteSellerMutation.isPending}
            >
              {deleteSellerMutation.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel invite confirmation dialog */}
      <Dialog open={isCancelInviteDialogOpen} onOpenChange={setIsCancelInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Convite</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar o convite para "{inviteToCancel?.name}" ({inviteToCancel?.email})? O usuário não poderá mais usar o link de convite.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelInviteDialogOpen(false)}>
              Manter Convite
            </Button>
            <Button
              variant="destructive"
              onClick={() => inviteToCancel && cancelInviteMutation.mutate(inviteToCancel.id)}
              disabled={cancelInviteMutation.isPending}
            >
              {cancelInviteMutation.isPending ? 'Cancelando...' : 'Cancelar Convite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}