import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ClientMetrics } from '@/hooks/useAdminGlobalData';

interface ClientPerformanceTableProps {
  clients: ClientMetrics[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function ClientPerformanceTable({ clients }: ClientPerformanceTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Performance por Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">Campanhas</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Oport.</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">CAL</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Nenhum cliente com dados no período
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.clientId}>
                    <TableCell className="font-medium">{client.clientName}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {client.googleCampaignsActive > 0 && (
                          <Badge variant="outline" className="text-xs">
                            G: {client.googleCampaignsActive}
                          </Badge>
                        )}
                        {client.metaCampaignsActive > 0 && (
                          <Badge variant="outline" className="text-xs bg-primary/10">
                            M: {client.metaCampaignsActive}
                          </Badge>
                        )}
                        {client.googleCampaignsActive === 0 && client.metaCampaignsActive === 0 && (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(client.googleSpend + client.metaSpend)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(client.leads)}</TableCell>
                    <TableCell className="text-right">{formatNumber(client.opportunities)}</TableCell>
                    <TableCell className="text-right">{formatNumber(client.sales)}</TableCell>
                    <TableCell className="text-right text-success">
                      {formatCurrency(client.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {client.cal > 0 ? formatCurrency(client.cal) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {client.roas > 0 ? (
                        <span className={client.roas >= 1 ? 'text-success' : 'text-destructive'}>
                          {client.roas.toFixed(2)}x
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
