import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getFeatures, updateFeatureStatus, AppFeature } from '@/services/permissionsService';
import { BarChart3, Kanban, Settings } from 'lucide-react';

export function FeaturesTab() {
  const queryClient = useQueryClient();

  const { data: features, isLoading } = useQuery({
    queryKey: ['app-features'],
    queryFn: getFeatures,
  });

  const updateMutation = useMutation({
    mutationFn: ({ featureId, isActive }: { featureId: string; isActive: boolean }) =>
      updateFeatureStatus(featureId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-features'] });
      toast.success('Funcionalidade atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar funcionalidade');
    },
  });

  const handleToggle = (feature: AppFeature) => {
    updateMutation.mutate({ featureId: feature.id, isActive: !feature.is_active });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dashboard':
        return <BarChart3 className="h-5 w-5" />;
      case 'crm':
        return <Kanban className="h-5 w-5" />;
      case 'system':
        return <Settings className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'dashboard':
        return 'Dashboard';
      case 'crm':
        return 'CRM';
      case 'system':
        return 'Sistema';
      default:
        return category;
    }
  };

  const featuresByCategory = features?.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, AppFeature[]>) || {};

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades do Sistema</CardTitle>
          <CardDescription>
            Habilite ou desabilite funcionalidades globalmente. 
            Funcionalidades desabilitadas não estarão disponíveis para nenhum grupo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                {getCategoryIcon(category)}
                <h3 className="font-semibold text-lg">{getCategoryLabel(category)}</h3>
              </div>
              <div className="grid gap-3">
                {categoryFeatures.map(feature => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feature.name}</span>
                        <Badge variant={feature.is_active ? 'default' : 'secondary'}>
                          {feature.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                      <code className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded mt-2 inline-block">
                        {feature.slug}
                      </code>
                    </div>
                    <Switch
                      checked={feature.is_active}
                      onCheckedChange={() => handleToggle(feature)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
