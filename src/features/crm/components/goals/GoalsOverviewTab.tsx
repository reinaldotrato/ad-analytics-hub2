import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Target, TrendingUp, AlertTriangle, Info, Calendar } from 'lucide-react';
import { GoalProgressCard } from './GoalProgressCard';
import { GoalFormDialog } from './GoalFormDialog';
import { GoalEvolutionChart } from './GoalEvolutionChart';
import { LostDealsChart } from './LostDealsChart';
import { DailyGoalCard } from './DailyGoalCard';
import { GoalAlertBanner } from './GoalAlertBanner';
import { SellerRankingTable } from './SellerRankingTable';
import { SectionHeader } from './SectionHeader';
import { useGoals } from '../../hooks/useGoals';
import { useGoalMetrics } from '../../hooks/useGoalMetrics';
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
import type { Goal } from '../../lib/types';

export function GoalsOverviewTab() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [deletingGoal, setDeletingGoal] = useState<Goal | undefined>();

  const {
    currentGeneralGoal,
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

  const { dailyData, todaySales, lostDeals, isLoading: metricsLoading } = useGoalMetrics();

  const generalProgress = goalProgress?.get('general');
  const monthProgress = currentGeneralGoal?.sales_value_goal 
    ? ((generalProgress?.value || 0) / currentGeneralGoal.sales_value_goal) * 100 
    : 0;

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

  // Preparar dados do ranking
  const sellerRankingData = sellers.map(seller => ({
    seller,
    goal: currentSellerGoals.find(g => g.seller_id === seller.id),
    progress: goalProgress?.get(seller.id) || { sales: 0, value: 0, leads: 0, opportunities: 0 },
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header compacto com período, alerta e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {currentGeneralGoal 
                ? `Meta ${currentGeneralGoal.period_type === 'monthly' ? 'Mensal' : currentGeneralGoal.period_type === 'quarterly' ? 'Trimestral' : 'Anual'}`
                : 'Metas da Empresa'
              }
            </h2>
            {currentGeneralGoal && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {format(new Date(currentGeneralGoal.period_start), "dd MMM", { locale: ptBR })} - {format(new Date(currentGeneralGoal.period_end), "dd MMM yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
          {currentGeneralGoal && <GoalAlertBanner goalProgress={monthProgress} variant="compact" />}
        </div>
        
        <div className="flex items-center gap-2">
          {currentGeneralGoal && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setEditingGoal(currentGeneralGoal);
                  setIsFormOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setDeletingGoal(currentGeneralGoal)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nova Meta
          </Button>
        </div>
      </div>

      {/* Meta atual ou estado vazio */}
      {currentGeneralGoal ? (
        <div className="space-y-8">
          {/* Seção 1: Desempenho do Mês */}
          <section>
            <SectionHeader title="Desempenho do Mês" icon={TrendingUp} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <DailyGoalCard
                monthlyGoal={currentGeneralGoal.sales_quantity_goal}
                todayValue={todaySales.count}
                monthValue={generalProgress?.sales || 0}
              />
              <GoalProgressCard
                title="Vendas"
                icon="sales"
                goal={currentGeneralGoal.sales_quantity_goal}
                current={generalProgress?.sales || 0}
              />
              <GoalProgressCard
                title="Faturamento"
                icon="value"
                goal={currentGeneralGoal.sales_value_goal}
                current={generalProgress?.value || 0}
                format="currency"
              />
              <GoalProgressCard
                title="Leads"
                icon="leads"
                goal={currentGeneralGoal.leads_goal}
                current={generalProgress?.leads || 0}
              />
              <GoalProgressCard
                title="Oportunidades"
                icon="opportunities"
                goal={currentGeneralGoal.opportunities_goal}
                current={generalProgress?.opportunities || 0}
              />
            </div>
          </section>

          {/* Seção 2: Evolução & Equipe */}
          <section>
            <SectionHeader title="Evolução & Equipe" icon={TrendingUp} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3">
                <GoalEvolutionChart
                  goal={currentGeneralGoal.sales_quantity_goal}
                  currentValue={generalProgress?.sales || 0}
                  dailyData={dailyData}
                  title="Evolução de Vendas"
                />
              </div>
              <div className="lg:col-span-2">
                <SellerRankingTable sellers={sellerRankingData} maxItems={5} />
              </div>
            </div>
          </section>

          {/* Seção 3: Análise de Perdas */}
          <section>
            <SectionHeader title="Análise de Perdas" icon={AlertTriangle} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LostDealsChart data={lostDeals} viewMode="bar" />
              
              {/* Card informativo discreto */}
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground space-y-2">
                      <p className="font-medium">Como as metas derivadas são calculadas?</p>
                      <p>
                        Com base nas taxas de conversão dos últimos 3 meses:
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span>Lead→Venda: <strong>{((currentGeneralGoal.lead_to_sale_rate || 0) * 100).toFixed(1)}%</strong></span>
                        <span>Oport.→Venda: <strong>{((currentGeneralGoal.opportunity_to_sale_rate || 0) * 100).toFixed(1)}%</strong></span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma meta definida</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Defina metas de vendas e o sistema calculará automaticamente<br />
              as metas de leads e oportunidades baseado no histórico.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Meta
            </Button>
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
