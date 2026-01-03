import { memo } from 'react';
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
import { MetaCampaignMetrics } from '@/services/metaAdsService';
import { formatCurrency, formatNumber } from '@/services/metricsService';
import { Megaphone } from 'lucide-react';
import { MetricTooltip } from '@/components/dashboard/MetricTooltip';

interface MetaCampaignTableProps {
  data: MetaCampaignMetrics[];
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  PAUSED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  DELETED: 'bg-red-500/20 text-red-400 border-red-500/30',
  ARCHIVED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  UNKNOWN: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  DELETED: 'Removido',
  ARCHIVED: 'Arquivado',
  UNKNOWN: 'Desconhecido',
};

export const MetaCampaignTable = memo(function MetaCampaignTable({ data }: MetaCampaignTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Nenhuma campanha encontrada para o período selecionado.
        </CardContent>
      </Card>
    );
  }

  // Calcular totais
  const totals = data.reduce(
    (acc, campaign) => ({
      spend: acc.spend + campaign.spend,
      reach: acc.reach + campaign.reach,
      impressions: acc.impressions + campaign.impressions,
      leads: acc.leads + campaign.leads,
      messages: acc.messages + campaign.messages,
      pageViews: acc.pageViews + campaign.pageViews,
    }),
    { spend: 0, reach: 0, impressions: 0, leads: 0, messages: 0, pageViews: 0 }
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Megaphone className="h-5 w-5 text-purple-400" />
          Performance por Campanhas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Campanha</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
                <TableHead className="text-right">Alcance</TableHead>
                <TableHead className="text-right">Impressões</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    CPL
                    <MetricTooltip metric="CPL" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    Mensagens
                    <MetricTooltip metric="Mensagens" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    CPM
                    <MetricTooltip metric="CPM (Mensagem)" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    Views
                    <MetricTooltip metric="Views" />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    CPV
                    <MetricTooltip metric="CPV" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((campaign) => (
                <TableRow key={campaign.campaignId} className="border-border/30">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground">
                        {campaign.campaignName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`w-fit text-xs ${
                          statusColors[campaign.status || 'ACTIVE'] || statusColors.ACTIVE
                        }`}
                      >
                        {statusLabels[campaign.status || 'ACTIVE'] || campaign.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {campaign.objective || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(campaign.spend)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.reach)}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(campaign.impressions)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.leads)}</TableCell>
                  <TableCell className="text-right">
                    {campaign.leads > 0 ? formatCurrency(campaign.spend / campaign.leads) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.messages)}</TableCell>
                  <TableCell className="text-right">
                    {campaign.messages > 0 ? formatCurrency(campaign.spend / campaign.messages) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(campaign.pageViews)}</TableCell>
                  <TableCell className="text-right">
                    {campaign.pageViews > 0
                      ? formatCurrency(campaign.spend / campaign.pageViews)
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {/* Linha de Totais */}
              <TableRow className="border-t-2 border-border bg-muted/30 font-semibold">
                <TableCell colSpan={2} className="text-foreground">
                  Total ({data.length} campanhas)
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totals.spend)}</TableCell>
                <TableCell className="text-right">{formatNumber(totals.reach)}</TableCell>
                <TableCell className="text-right">{formatNumber(totals.impressions)}</TableCell>
                <TableCell className="text-right">{formatNumber(totals.leads)}</TableCell>
                <TableCell className="text-right">
                  {totals.leads > 0 ? formatCurrency(totals.spend / totals.leads) : '-'}
                </TableCell>
                <TableCell className="text-right">{formatNumber(totals.messages)}</TableCell>
                <TableCell className="text-right">
                  {totals.messages > 0 ? formatCurrency(totals.spend / totals.messages) : '-'}
                </TableCell>
                <TableCell className="text-right">{formatNumber(totals.pageViews)}</TableCell>
                <TableCell className="text-right">
                  {totals.pageViews > 0 ? formatCurrency(totals.spend / totals.pageViews) : '-'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
