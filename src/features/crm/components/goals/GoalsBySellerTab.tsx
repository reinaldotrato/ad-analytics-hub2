import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, Users, User } from 'lucide-react';
import { GoalFormDialog } from './GoalFormDialog';
import { SellerGoalAlertBanner } from './SellerGoalAlertBanner';
import { SellerPodium } from './SellerPodium';
import { SellerRankingTable } from './SellerRankingTable';
import { useGoals } from '../../hooks/useGoals';
import { toast } from 'sonner';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Goal } from '../../lib/types';

export function GoalsBySellerTab() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [deletingGoal, setDeletingGoal] = useState<Goal | undefined>();

  const {
    currentSellerGoals,
    sellers,
    conversionRates,
    goalProgress,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    calculateDerivedGoals,
  } = useGoals();

  const handleSubmit = async (data: Parameters<typeof createGoal>[0]) => {
    try {
      if (editingGoal) {
        await updateGoal({ id: editingGoal.id, ...data });
        toast.success('Meta atualizada com sucesso!');
      } else {
        await createGoal(data);
        toast.success('Meta criada com sucesso!');
      }
      setEditingGoal(undefined);
    } catch (error) {
      toast.error('Erro ao salvar meta');
    }
  };

  const handleDelete = async () => {
    if (!deletingGoal) return;
    try {
      await deleteGoal(deletingGoal.id);
      toast.success('Meta excluída com sucesso!');
      setDeletingGoal(undefined);
    } catch (error) {
      toast.error('Erro ao excluir meta');
    }
  };

  const getSellerName = (sellerId: string) => {
    return sellers.find(s => s.id === sellerId)?.name || 'Desconhecido';
  };

  const getSellerProgress = (sellerId: string) => {
    return goalProgress?.get(sellerId) || { sales: 0, value: 0, leads: 0, opportunities: 0 };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Metas por Vendedor</h2>
          <p className="text-sm text-muted-foreground">
            Defina metas individuais para cada vendedor
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Pódio e Ranking */}
      {currentSellerGoals.length > 0 && (() => {
        // Preparar dados para o pódio
        const rankingData = currentSellerGoals
          .map((goal) => {
            const seller = sellers.find(s => s.id === goal.seller_id);
            const progress = getSellerProgress(goal.seller_id || '');
            return {
              id: goal.seller_id || '',
              name: seller?.name || 'Vendedor',
              avatarUrl: seller?.avatar_url || undefined,
              value: progress.value,
              valueGoal: goal.sales_value_goal,
              progressPercent: goal.sales_value_goal > 0 
                ? (progress.value / goal.sales_value_goal) * 100 
                : 0,
              seller: seller!,
              goal,
              progress,
            };
          })
          .filter(d => d.seller && d.goal.sales_value_goal > 0)
          .sort((a, b) => b.progressPercent - a.progressPercent);

        const podiumSellers = rankingData.slice(0, 3);
        const remainingSellers = rankingData.slice(3).map(d => ({
          seller: d.seller,
          goal: d.goal,
          progress: d.progress,
        }));

        return (
          <>
            {/* Pódio Visual */}
            {podiumSellers.length > 0 && (
              <SellerPodium sellers={podiumSellers} />
            )}

            {/* Demais vendedores */}
            {remainingSellers.length > 0 && (
              <SellerRankingTable sellers={remainingSellers} startFromPosition={3} />
            )}

            {/* Alertas de gamificação */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {currentSellerGoals.map((goal) => {
                const seller = sellers.find(s => s.id === goal.seller_id);
                const progress = getSellerProgress(goal.seller_id || '');
                const valueProgress = goal.sales_value_goal > 0 
                  ? (progress.value / goal.sales_value_goal) * 100 
                  : 0;
                const remainingValue = Math.max(0, goal.sales_value_goal - progress.value);

                return (
                  <SellerGoalAlertBanner
                    key={`alert-${goal.id}`}
                    sellerName={seller?.name || 'Vendedor'}
                    goalProgress={valueProgress}
                    avatarUrl={seller?.avatar_url || undefined}
                    remainingValue={remainingValue}
                  />
                );
              })}
            </div>
          </>
        );
      })()}

      {currentSellerGoals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Metas do Período Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-center">Meta (R$)</TableHead>
                  <TableHead className="text-center">Atual (R$)</TableHead>
                  <TableHead className="text-center">Progresso</TableHead>
                  <TableHead className="text-center">Meta Leads</TableHead>
                  <TableHead className="text-center">Meta Oport.</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSellerGoals.map((goal) => {
                  const seller = sellers.find(s => s.id === goal.seller_id);
                  const progress = getSellerProgress(goal.seller_id || '');
                  const valueProgress = goal.sales_value_goal > 0 
                    ? Math.min((progress.value / goal.sales_value_goal) * 100, 100) 
                    : 0;

                  return (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={seller?.avatar_url} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{seller?.name || 'Desconhecido'}</div>
                            <div className="text-xs text-muted-foreground">{seller?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {formatCurrency(goal.sales_value_goal)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(progress.value)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={valueProgress} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {valueProgress.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {goal.leads_goal}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {goal.opportunities_goal}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingGoal(goal);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingGoal(goal)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma meta por vendedor</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Defina metas individuais para acompanhar o desempenho<br />
              de cada vendedor separadamente.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Meta para Vendedor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de vendedores sem meta */}
      {sellers.length > 0 && currentSellerGoals.length < sellers.length && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Vendedores sem meta definida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sellers
                .filter(s => !currentSellerGoals.some(g => g.seller_id === s.id))
                .map((seller) => (
                  <div 
                    key={seller.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full text-sm"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={seller.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {seller.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {seller.name}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de formulário */}
      <GoalFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingGoal(undefined);
        }}
        goal={editingGoal}
        sellers={sellers}
        conversionRates={conversionRates}
        onSubmit={handleSubmit}
        calculateDerivedGoals={calculateDerivedGoals}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deletingGoal} onOpenChange={() => setDeletingGoal(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A meta será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
