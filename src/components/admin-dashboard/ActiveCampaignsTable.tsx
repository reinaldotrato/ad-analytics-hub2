import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ActiveCampaign } from '@/hooks/useAdminGlobalData';

interface ActiveCampaignsTableProps {
  campaigns: ActiveCampaign[];
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

export function ActiveCampaignsTable({ campaigns }: ActiveCampaignsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Campanhas Ativas
          <Badge variant="secondary" className="ml-2">
            {campaigns.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead className="text-center">Canal</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
                <TableHead className="text-right">Resultados</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma campanha ativa no período
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign, index) => (
                  <TableRow key={`${campaign.clientName}-${campaign.campaignName}-${index}`}>
                    <TableCell className="font-medium">{campaign.clientName}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={campaign.campaignName}>
                      {campaign.campaignName}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={campaign.channel === 'meta' ? 'default' : 'secondary'}
                        className={campaign.channel === 'meta' ? 'bg-primary/20 text-primary' : ''}
                      >
                        {campaign.channel === 'meta' ? 'Meta' : 'Google'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(campaign.spend)}</TableCell>
                    <TableCell className="text-right">{formatNumber(campaign.results)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-success">Ativo</span>
                      </div>
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
