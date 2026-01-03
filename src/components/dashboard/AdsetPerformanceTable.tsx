import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdsetPerformanceTableProps {
  data?: Array<{
    adset: string;
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    cpl: number;
  }>;
  isLoading?: boolean;
}

export function AdsetPerformanceTable({ data = [], isLoading }: AdsetPerformanceTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance de Conjuntos</CardTitle>
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
        <CardTitle>Performance de Conjuntos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conjunto</TableHead>
              <TableHead className="text-right">Investimento</TableHead>
              <TableHead className="text-right">Impressões</TableHead>
              <TableHead className="text-right">Cliques</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">CPL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.adset}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.spend)}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("pt-BR").format(row.impressions)}
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("pt-BR").format(row.clicks)}
                </TableCell>
                <TableCell className="text-right">{row.leads}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.cpl)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
