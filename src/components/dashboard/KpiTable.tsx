import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface KpiTableProps {
  data?: Array<{
    metric: string;
    value: string | number;
    change?: number;
    target?: string | number;
  }>;
  isLoading?: boolean;
  title?: string;
}

export function KpiTable({ data = [], isLoading, title = "Métricas Detalhadas" }: KpiTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Variação</TableHead>
              <TableHead className="text-right">Meta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell className="text-right">{row.value}</TableCell>
                <TableCell className="text-right">
                  {row.change !== undefined && (
                    <span
                      className={
                        row.change > 0
                          ? "text-green-600"
                          : row.change < 0
                          ? "text-red-600"
                          : ""
                      }
                    >
                      {row.change > 0 ? "+" : ""}
                      {row.change.toFixed(1)}%
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">{row.target || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
