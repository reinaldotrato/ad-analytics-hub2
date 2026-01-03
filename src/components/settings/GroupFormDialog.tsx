import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  createAccessGroup, 
  updateAccessGroup, 
  getGroupPermissions,
  updateGroupPermissions,
  AccessGroup, 
  AppFeature 
} from '@/services/permissionsService';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9_]+$/, 'Slug deve conter apenas letras minúsculas, números e underscores'),
  description: z.string().optional(),
  can_see_all_deals: z.boolean(),
  can_see_all_tasks: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AccessGroup | null;
  features: AppFeature[];
}

export function GroupFormDialog({ open, onOpenChange, group, features }: GroupFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!group;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      can_see_all_deals: false,
      can_see_all_tasks: false,
    },
  });

  const { data: currentPermissions } = useQuery({
    queryKey: ['group-permissions', group?.id],
    queryFn: () => getGroupPermissions(group!.id),
    enabled: !!group?.id,
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        slug: group.slug,
        description: group.description || '',
        can_see_all_deals: group.can_see_all_deals,
        can_see_all_tasks: group.can_see_all_tasks,
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        can_see_all_deals: false,
        can_see_all_tasks: false,
      });
    }
  }, [group, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const newGroup = await createAccessGroup({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        can_see_all_deals: data.can_see_all_deals,
        can_see_all_tasks: data.can_see_all_tasks,
        client_id: null,
        is_system_default: false,
      });
      
      // Criar permissões padrão (todas desabilitadas)
      const permissions = features.map(f => ({
        featureId: f.id,
        isEnabled: false,
      }));
      await updateGroupPermissions(newGroup.id, permissions);
      
      return newGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-groups'] });
      toast.success('Grupo criado com sucesso');
      onOpenChange(false);
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Já existe um grupo com este slug');
      } else {
        toast.error('Erro ao criar grupo');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateAccessGroup(group!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-groups'] });
      toast.success('Grupo atualizado com sucesso');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erro ao atualizar grupo');
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Grupo' : 'Novo Grupo de Acesso'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do grupo de acesso'
              : 'Crie um novo grupo de acesso para gerenciar permissões de usuários'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supervisor de Vendas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificador (slug)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: supervisor_vendas" 
                      {...field} 
                      disabled={isEditing && group?.is_system_default}
                    />
                  </FormControl>
                  <FormDescription>
                    Usado internamente para identificar o grupo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o propósito deste grupo..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Visibilidade de Dados</h4>
              
              <FormField
                control={form.control}
                name="can_see_all_deals"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Ver todos os negócios</FormLabel>
                      <FormDescription>
                        Permite visualizar negócios de outros usuários
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="can_see_all_tasks"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Ver todas as tarefas</FormLabel>
                      <FormDescription>
                        Permite visualizar tarefas de outros usuários
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Grupo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
