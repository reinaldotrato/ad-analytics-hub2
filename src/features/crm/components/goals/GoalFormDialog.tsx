import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, Users, Target } from 'lucide-react';
import type { Goal, ConversionRates, Seller } from '../../lib/types';

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal;
  sellers: Seller[];
  conversionRates?: ConversionRates;
  onSubmit: (data: GoalFormData) => Promise<void>;
  calculateDerivedGoals: (salesGoal: number, rates: ConversionRates) => { leadsGoal: number; opportunitiesGoal: number };
}

interface GoalFormData {
  seller_id?: string;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  sales_quantity_goal: number;
  sales_value_goal: number;
  leads_goal: number;
  opportunities_goal: number;
  lead_to_sale_rate: number;
  lead_to_opportunity_rate: number;
  opportunity_to_sale_rate: number;
}

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
  sellers,
  conversionRates,
  onSubmit,
  calculateDerivedGoals,
}: GoalFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [salesQuantityGoal, setSalesQuantityGoal] = useState(0);
  const [salesValueGoal, setSalesValueGoal] = useState(0);
  const [derivedGoals, setDerivedGoals] = useState({ leadsGoal: 0, opportunitiesGoal: 0 });

  const { register, handleSubmit, setValue, watch, reset } = useForm<GoalFormData>({
    defaultValues: {
      period_type: 'monthly',
      sales_quantity_goal: 0,
      sales_value_goal: 0,
      leads_goal: 0,
      opportunities_goal: 0,
    },
  });

  const selectedSellerId = watch('seller_id');

  useEffect(() => {
    if (goal) {
      reset({
        seller_id: goal.seller_id || undefined,
        period_type: goal.period_type,
        period_start: goal.period_start,
        period_end: goal.period_end,
        sales_quantity_goal: goal.sales_quantity_goal,
        sales_value_goal: goal.sales_value_goal,
        leads_goal: goal.leads_goal,
        opportunities_goal: goal.opportunities_goal,
        lead_to_sale_rate: goal.lead_to_sale_rate,
        lead_to_opportunity_rate: goal.lead_to_opportunity_rate,
        opportunity_to_sale_rate: goal.opportunity_to_sale_rate,
      });
      setPeriodType(goal.period_type);
      setSalesQuantityGoal(goal.sales_quantity_goal);
      setSalesValueGoal(goal.sales_value_goal);
      setDerivedGoals({ leadsGoal: goal.leads_goal, opportunitiesGoal: goal.opportunities_goal });
    } else {
      reset({
        period_type: 'monthly',
        sales_quantity_goal: 0,
        sales_value_goal: 0,
        leads_goal: 0,
        opportunities_goal: 0,
      });
      setPeriodType('monthly');
      setSalesQuantityGoal(0);
      setSalesValueGoal(0);
      setDerivedGoals({ leadsGoal: 0, opportunitiesGoal: 0 });
    }
  }, [goal, reset]);

  // Calcular datas do período automaticamente
  useEffect(() => {
    const now = new Date();
    let start: Date, end: Date;

    switch (periodType) {
      case 'quarterly':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case 'yearly':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    setValue('period_start', format(start, 'yyyy-MM-dd'));
    setValue('period_end', format(end, 'yyyy-MM-dd'));
    setValue('period_type', periodType);
  }, [periodType, setValue]);

  // Recalcular metas derivadas quando a meta de vendas muda
  useEffect(() => {
    if (conversionRates && salesQuantityGoal > 0) {
      const derived = calculateDerivedGoals(salesQuantityGoal, conversionRates);
      setDerivedGoals(derived);
      setValue('leads_goal', derived.leadsGoal);
      setValue('opportunities_goal', derived.opportunitiesGoal);
      setValue('lead_to_sale_rate', conversionRates.leadToSale);
      setValue('lead_to_opportunity_rate', conversionRates.leadToOpportunity);
      setValue('opportunity_to_sale_rate', conversionRates.opportunityToSale);
    }
  }, [salesQuantityGoal, conversionRates, calculateDerivedGoals, setValue]);

  const handleFormSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      // Calcular datas do período explicitamente para garantir que são enviadas
      const now = new Date();
      let start: Date, end: Date;

      switch (periodType) {
        case 'quarterly':
          start = startOfQuarter(now);
          end = endOfQuarter(now);
          break;
        case 'yearly':
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        default:
          start = startOfMonth(now);
          end = endOfMonth(now);
      }

      await onSubmit({
        ...data,
        period_type: periodType,
        period_start: format(start, 'yyyy-MM-dd'),
        period_end: format(end, 'yyyy-MM-dd'),
        sales_quantity_goal: salesQuantityGoal,
        sales_value_goal: salesValueGoal,
        leads_goal: derivedGoals.leadsGoal,
        opportunities_goal: derivedGoals.opportunitiesGoal,
        lead_to_sale_rate: conversionRates?.leadToSale || 0,
        lead_to_opportunity_rate: conversionRates?.leadToOpportunity || 0,
        opportunity_to_sale_rate: conversionRates?.opportunityToSale || 0,
        seller_id: data.seller_id === 'general' ? undefined : data.seller_id,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {goal ? 'Editar Meta' : 'Nova Meta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Período</Label>
              <Select 
                value={periodType} 
                onValueChange={(v) => setPeriodType(v as 'monthly' | 'quarterly' | 'yearly')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vendedor (opcional)</Label>
              <Select 
                value={selectedSellerId || 'general'} 
                onValueChange={(v) => setValue('seller_id', v === 'general' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Meta geral da empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Meta geral da empresa</SelectItem>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sales_quantity_goal">Meta de Vendas (Quantidade)</Label>
              <Input
                id="sales_quantity_goal"
                type="number"
                min="0"
                value={salesQuantityGoal}
                onChange={(e) => setSalesQuantityGoal(Number(e.target.value))}
                placeholder="Ex: 100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales_value_goal">Meta de Faturamento (R$)</Label>
              <Input
                id="sales_value_goal"
                type="number"
                min="0"
                step="0.01"
                value={salesValueGoal}
                onChange={(e) => setSalesValueGoal(Number(e.target.value))}
                placeholder="Ex: 100000"
              />
            </div>
          </div>

          {/* Card de Taxas Históricas */}
          {conversionRates && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Taxas de Conversão (últimos 3 meses)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Lead → Venda</div>
                  <div className="font-medium">{formatPercent(conversionRates.leadToSale)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Lead → Oportunidade</div>
                  <div className="font-medium">{formatPercent(conversionRates.leadToOpportunity)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Oportunidade → Venda</div>
                  <div className="font-medium">{formatPercent(conversionRates.opportunityToSale)}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card de Metas Calculadas */}
          {salesQuantityGoal > 0 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Metas Calculadas Automaticamente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Vendas</div>
                    <div className="font-bold">{salesQuantityGoal}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Leads necessários</div>
                    <div className="font-bold">{derivedGoals.leadsGoal}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Oportunidades</div>
                    <div className="font-bold">{derivedGoals.opportunitiesGoal}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : goal ? 'Atualizar' : 'Criar Meta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
