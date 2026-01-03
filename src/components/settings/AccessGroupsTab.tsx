import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { 
  getAccessGroups, 
  getFeatures, 
  getGroupPermissions, 
  updateGroupPermission,
  deleteAccessGroup,
  AccessGroup,
  AppFeature
} from '@/services/permissionsService';
import { GroupFormDialog } from './GroupFormDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

export function AccessGroupsTab() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AccessGroup | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [deletingGroup, setDeletingGroup] = useState<AccessGroup | null>(null);

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ['access-groups'],
    queryFn: getAccessGroups,
  });

  const { data: features } = useQuery({
    queryKey: ['app-features'],
    queryFn: getFeatures,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccessGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-groups'] });
      toast.success('Grupo excluído com sucesso');
      setDeletingGroup(null);
    },
    onError: () => {
      toast.error('Erro ao excluir grupo');
    },
  });

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleEdit = (group: AccessGroup) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const handleDelete = (group: AccessGroup) => {
    if (group.is_system_default) {
      toast.error('Não é possível excluir grupos padrão do sistema');
      return;
    }
    setDeletingGroup(group);
  };

  const confirmDelete = () => {
    if (deletingGroup) {
      deleteMutation.mutate(deletingGroup.id);
    }
  };

  const featuresByCategory = features?.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, AppFeature[]>) || {};

  const categoryLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    crm: 'CRM',
    system: 'Sistema',
  };

  if (loadingGroups) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingGroup(null); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      {groups?.map(group => (
        <Card key={group.id}>
          <Collapsible open={expandedGroups.has(group.id)} onOpenChange={() => toggleGroup(group.id)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 cursor-pointer">
                  {expandedGroups.has(group.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {group.name}
                        {group.is_system_default && (
                          <Badge variant="secondary">Padrão</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mr-4">
                    <span>Ver todos os negócios: {group.can_see_all_deals ? 'Sim' : 'Não'}</span>
                    <span>Ver todas as tarefas: {group.can_see_all_tasks ? 'Sim' : 'Não'}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(group)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!group.is_system_default && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(group)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <GroupPermissionsMatrix groupId={group.id} features={features || []} featuresByCategory={featuresByCategory} categoryLabels={categoryLabels} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      <GroupFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        group={editingGroup}
        features={features || []}
      />

      <AlertDialog open={!!deletingGroup} onOpenChange={() => setDeletingGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo "{deletingGroup?.name}"? 
              Usuários associados a este grupo perderão suas permissões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface GroupPermissionsMatrixProps {
  groupId: string;
  features: AppFeature[];
  featuresByCategory: Record<string, AppFeature[]>;
  categoryLabels: Record<string, string>;
}

function GroupPermissionsMatrix({ groupId, features, featuresByCategory, categoryLabels }: GroupPermissionsMatrixProps) {
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['group-permissions', groupId],
    queryFn: () => getGroupPermissions(groupId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ featureId, isEnabled }: { featureId: string; isEnabled: boolean }) =>
      updateGroupPermission(groupId, featureId, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-permissions', groupId] });
    },
    onError: () => {
      toast.error('Erro ao atualizar permissão');
    },
  });

  const getPermissionStatus = (featureId: string): boolean => {
    const perm = permissions?.find(p => p.feature_id === featureId);
    return perm?.is_enabled ?? false;
  };

  const handleToggle = (featureId: string, currentValue: boolean) => {
    updateMutation.mutate({ featureId, isEnabled: !currentValue });
  };

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-6">
      {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
        <div key={category}>
          <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
            {categoryLabels[category] || category}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryFeatures.map(feature => {
              const isEnabled = getPermissionStatus(feature.id);
              return (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <span className="text-sm font-medium">{feature.name}</span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(feature.id, isEnabled)}
                    disabled={updateMutation.isPending}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
