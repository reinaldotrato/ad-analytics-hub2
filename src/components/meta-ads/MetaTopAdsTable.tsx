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
import { MetaAdMetrics } from '@/services/metaAdsService';
import { formatCurrency, formatNumber } from '@/services/metricsService';
import { ImageIcon, Trophy } from 'lucide-react';
import { MetricTooltip } from '@/components/dashboard/MetricTooltip';

interface MetaTopAdsTableProps {
  data: MetaAdMetrics[];
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

export const MetaTopAdsTable = memo(function MetaTopAdsTable({ data }: MetaTopAdsTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Nenhum anúncio encontrado para o período selecionado.
        </CardContent>
      </Card>
    );
  }

  // Calcular totais
  const totals = data.reduce(
    (acc, ad) => ({
      spend: acc.spend + ad.spend,
      reach: acc.reach + ad.reach,
      impressions: acc.impressions + ad.impressions,
      leads: acc.leads + ad.leads,
      messages: acc.messages + ad.messages,
      pageViews: acc.pageViews + ad.pageViews,
    }),
    { spend: 0, reach: 0, impressions: 0, leads: 0, messages: 0, pageViews: 0 }
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Top 10 Anúncios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="w-16">Thumb</TableHead>
                <TableHead>Anúncio</TableHead>
                <TableHead>Status</TableHead>
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
              {data.map((ad, index) => (
                <TableRow key={ad.adId} className="border-border/30">
                  <TableCell>
                    {ad.thumbnailUrl ? (
                      <img
                        src={ad.thumbnailUrl}
                        alt={ad.adName || 'Ad thumbnail'}
                        className="w-12 h-12 object-cover rounded-md border border-border/50"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted/20 rounded-md flex items-center justify-center border border-border/50">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <span
                          className={`text-sm font-bold ${
                            index === 0
                              ? 'text-yellow-400'
                              : index === 1
                              ? 'text-gray-300'
                              : 'text-orange-400'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      )}
                      <span className="font-medium text-foreground">
                        {ad.adName || 'Sem nome'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        statusColors[ad.status || 'ACTIVE'] || statusColors.ACTIVE
                      }`}
                    >
                      {statusLabels[ad.status || 'ACTIVE'] || ad.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(ad.spend)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(ad.reach)}</TableCell>
                  <TableCell className="text-right">{formatNumber(ad.impressions)}</TableCell>
                  <TableCell className="text-right">{formatNumber(ad.leads)}</TableCell>
                  <TableCell className="text-right">
                    {ad.leads > 0 ? formatCurrency(ad.spend / ad.leads) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(ad.messages)}</TableCell>
                  <TableCell className="text-right">
                    {ad.messages > 0 ? formatCurrency(ad.spend / ad.messages) : '-'}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(ad.pageViews)}</TableCell>
                  <TableCell className="text-right">
                    {ad.pageViews > 0
                      ? formatCurrency(ad.spend / ad.pageViews)
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {/* Linha de Totais */}
              <TableRow className="border-t-2 border-border bg-muted/30 font-semibold">
                <TableCell colSpan={3} className="text-foreground">
                  Total ({data.length} anúncios)
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
