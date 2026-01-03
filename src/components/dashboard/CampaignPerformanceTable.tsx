import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CampaignPerformanceTableProps {
  data?: any[];
  isLoading?: boolean;
}

export function CampaignPerformanceTable({ data = [], isLoading }: CampaignPerformanceTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance de Campanhas</CardTitle>
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
        <CardTitle>Performance de Campanhas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Conversões</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">ROAS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.campaign || row.campaign_name || 'N/A'}</TableCell>
                <TableCell>
                  <Badge
                    variant={(row.status === "active" || row.status === "ENABLED") ? "default" : "secondary"}
                  >
                    {(row.status === "active" || row.status === "ENABLED") ? "Ativo" : "Pausado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{row.leads || row.conversions || 0}</TableCell>
                <TableCell className="text-right">{row.conversions || 0}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.revenue || row.cost || 0)}</TableCell>
                <TableCell className="text-right">{(row.roas || 0).toFixed(2)}x</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
