import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, DollarSign } from 'lucide-react';
import type { LostOpportunity } from '../../lib/types';
import { LostEvolutionChart } from './LostEvolutionChart';
import { LostByReasonChart } from './LostByReasonChart';
import { LostBySellerChart } from './LostBySellerChart';

interface ReportsLostOpportunitiesTabProps {
  opportunities: LostOpportunity[];
}

export function ReportsLostOpportunitiesTab({ 
  opportunities,
}: ReportsLostOpportunitiesTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Orçamento Insuficiente':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Concorrência':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Timing Inadequado':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Mudança de Prioridades':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Falta de Resposta':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'Escopo Incompatível':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const totalLostValue = opportunities.reduce((sum, o) => sum + o.value, 0);

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Perdido</p>
                <p className="text-2xl font-semibold text-destructive">{formatCurrency(totalLostValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <TrendingDown className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades Perdidas</p>
                <p className="text-2xl font-semibold">{opportunities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart */}
      <LostEvolutionChart opportunities={opportunities} />

      {/* Bar Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LostByReasonChart opportunities={opportunities} />
        <LostBySellerChart opportunities={opportunities} />
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Oportunidades Perdidas</CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oportunidade</TableHead>
                  <TableHead>Motivo da Perda</TableHead>
                  <TableHead className="text-right">Data de Fechamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Vendedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((item) => (
                  <TableRow key={item.deal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.deal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.deal.contact?.name || 'Sem contato'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getReasonColor(item.reason)}>
                        {item.reason}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(item.closed_at)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {formatCurrency(item.value)}
                    </TableCell>
                    <TableCell>{item.seller_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Nenhuma oportunidade perdida no período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
