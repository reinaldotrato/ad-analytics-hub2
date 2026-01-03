import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { History, Target, User, Building2 } from 'lucide-react';
import { useGoals } from '../../hooks/useGoals';

export function GoalsHistoryTab() {
  const { goals, sellers, isLoading } = useGoals();

  const getSellerName = (sellerId?: string) => {
    if (!sellerId) return 'Empresa';
    return sellers.find(s => s.id === sellerId)?.name || 'Desconhecido';
  };

  const getPeriodLabel = (goal: typeof goals[0]) => {
    const start = format(new Date(goal.period_start), 'MMM/yyyy', { locale: ptBR });
    const end = format(new Date(goal.period_end), 'MMM/yyyy', { locale: ptBR });
    
    if (start === end) return start;
    return `${start} - ${end}`;
  };

  const isPastGoal = (goal: typeof goals[0]) => {
    return new Date(goal.period_end) < new Date();
  };

  const isCurrentGoal = (goal: typeof goals[0]) => {
    const now = new Date();
    return new Date(goal.period_start) <= now && new Date(goal.period_end) >= now;
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
      <div>
        <h2 className="text-lg font-semibold">Histórico de Metas</h2>
        <p className="text-sm text-muted-foreground">
          Visualize todas as metas definidas e seus resultados
        </p>
      </div>

      {goals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-5 w-5" />
              Todas as Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="text-center">Vendas</TableHead>
                  <TableHead className="text-center">Faturamento</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Oportunidades</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell className="font-medium">
                      {getPeriodLabel(goal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {goal.period_type === 'monthly' ? 'Mensal' :
                         goal.period_type === 'quarterly' ? 'Trimestral' : 'Anual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {goal.seller_id ? (
                          <>
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{getSellerName(goal.seller_id)}</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Empresa</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {goal.sales_quantity_goal}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(goal.sales_value_goal)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {goal.leads_goal}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {goal.opportunities_goal}
                    </TableCell>
                    <TableCell className="text-center">
                      {isCurrentGoal(goal) ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Em andamento
                        </Badge>
                      ) : isPastGoal(goal) ? (
                        <Badge variant="secondary">
                          Encerrada
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Futura
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum histórico</h3>
            <p className="text-sm text-muted-foreground text-center">
              O histórico de metas aparecerá aqui conforme você<br />
              criar novas metas nas outras abas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Legenda de taxas */}
      {goals.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Sobre as taxas de conversão</p>
              <p>
                As metas de Leads e Oportunidades são calculadas automaticamente com base nas 
                taxas de conversão históricas do momento em que a meta foi criada. Essas taxas 
                são salvas junto com a meta para referência futura.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
