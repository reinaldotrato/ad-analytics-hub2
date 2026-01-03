import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KeywordPerformanceTableProps {
  data?: any[];
  isLoading?: boolean;
}

export function KeywordPerformanceTable({ data = [], isLoading }: KeywordPerformanceTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance de Palavras-chave</CardTitle>
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
        <CardTitle>Performance de Palavras-chave</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Palavra-chave</TableHead>
              <TableHead className="text-right">Impressões</TableHead>
              <TableHead className="text-right">Cliques</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">Conversões</TableHead>
              <TableHead className="text-right">Custo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.keyword || row.keyword_text || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("pt-BR").format(row.impressions || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("pt-BR").format(row.clicks || 0)}
                </TableCell>
                <TableCell className="text-right">{(row.ctr || 0).toFixed(2)}%</TableCell>
                <TableCell className="text-right">{formatCurrency(row.cpc || 0)}</TableCell>
                <TableCell className="text-right">{row.conversions || 0}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.cost || 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
