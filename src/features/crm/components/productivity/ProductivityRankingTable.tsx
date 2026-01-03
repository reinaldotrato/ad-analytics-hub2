import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import type { SellerRanking } from '../../hooks/useTeamProductivity';

interface ProductivityRankingTableProps {
  ranking: SellerRanking[];
}

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 1:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 2:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-muted-foreground font-medium">{index + 1}º</span>;
  }
};

export function ProductivityRankingTable({ ranking }: ProductivityRankingTableProps) {
  if (ranking.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking de Produtividade
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">Nenhum vendedor encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Ranking de Produtividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Concluídas</TableHead>
              <TableHead className="text-center">Atrasadas</TableHead>
              <TableHead className="w-[200px]">Taxa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranking.map((seller, index) => (
              <TableRow key={seller.seller_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{seller.seller_name}</p>
                    <p className="text-xs text-muted-foreground">{seller.seller_email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{seller.total_tasks}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                    {seller.completed_tasks}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {seller.overdue_tasks > 0 ? (
                    <Badge variant="destructive">{seller.overdue_tasks}</Badge>
                  ) : (
                    <Badge variant="outline">0</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={seller.completion_rate} className="h-2" />
                    <span className="text-sm font-medium w-12">{seller.completion_rate}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
