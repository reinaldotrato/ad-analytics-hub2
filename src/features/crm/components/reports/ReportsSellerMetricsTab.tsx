import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { SellerMetrics } from '../../lib/types';

interface ReportsSellerMetricsTabProps {
  metrics: SellerMetrics[];
}

export function ReportsSellerMetricsTab({ metrics }: ReportsSellerMetricsTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Sort by total value descending
  const sortedMetrics = [...metrics].sort((a, b) => b.total_value - a.total_value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas por Vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedMetrics.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Nenhum dado de vendedor disponível
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Oportunidades</TableHead>
                <TableHead className="text-right">Vendas Fechadas</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Taxa de Conversão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMetrics.map((item) => (
                <TableRow key={item.seller.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(item.seller.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.seller.name}</p>
                        <p className="text-sm text-muted-foreground">{item.seller.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.opportunities_count}</TableCell>
                  <TableCell className="text-right">{item.sales_count}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total_value)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={item.conversion_rate >= 50 ? 'text-green-500' : item.conversion_rate >= 30 ? 'text-yellow-500' : 'text-red-500'}>
                      {formatPercent(item.conversion_rate)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
