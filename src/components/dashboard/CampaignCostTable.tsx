import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CampaignCostTableProps {
  data?: Array<{
    campaign: string;
    spend: number;
    impressions: number;
    clicks: number;
    cpc: number;
    ctr: number;
  }>;
  isLoading?: boolean;
}

export function CampaignCostTable({ data = [], isLoading }: CampaignCostTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custo por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custo por Campanha</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead className="text-right">Investimento</TableHead>
              <TableHead className="text-right">Impressões</TableHead>
              <TableHead className="text-right">Cliques</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.campaign}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.spend)}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("pt-BR").format(row.impressions)}
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("pt-BR").format(row.clicks)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(row.cpc)}</TableCell>
                <TableCell className="text-right">{row.ctr.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
