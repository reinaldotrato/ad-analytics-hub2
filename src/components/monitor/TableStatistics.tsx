import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers } from "lucide-react";

interface TableStatisticsProps {
  stats: any[];
  isLoading: boolean;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num);
}

export function TableStatistics({ stats, isLoading }: TableStatisticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5" />
            Estatísticas das Tabelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by row count descending
  const sortedStats = [...stats].sort((a, b) => (b.row_count || 0) - (a.row_count || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5" />
          Estatísticas das Tabelas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tabela</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead className="text-right">Dead Tuples</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhuma estatística disponível
                  </TableCell>
                </TableRow>
              ) : (
                sortedStats.slice(0, 15).map((stat) => (
                  <TableRow key={stat.table_name}>
                    <TableCell className="font-mono text-xs">
                      {stat.table_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(stat.row_count || 0)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(stat.dead_tuples || 0)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
