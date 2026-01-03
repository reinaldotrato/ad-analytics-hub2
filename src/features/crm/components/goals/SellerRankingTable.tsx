import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import type { Seller, Goal } from '../../lib/types';

interface SellerRankingData {
  seller: Seller;
  goal?: Goal;
  progress: {
    sales: number;
    value: number;
    leads: number;
    opportunities: number;
  };
}

interface SellerRankingTableProps {
  sellers: SellerRankingData[];
  title?: string;
  maxItems?: number;
  startFromPosition?: number;
}

export function SellerRankingTable({ sellers, title = "Ranking de Vendedores", maxItems, startFromPosition = 0 }: SellerRankingTableProps) {
  // Ordenar por % de meta atingida (baseado em VALOR)
  const sortedSellers = [...sellers]
    .filter(s => s.goal && s.goal.sales_value_goal > 0)
    .sort((a, b) => {
      const aProgress = a.goal!.sales_value_goal > 0 
        ? (a.progress.value / a.goal!.sales_value_goal) * 100 
        : 0;
      const bProgress = b.goal!.sales_value_goal > 0 
        ? (b.progress.value / b.goal!.sales_value_goal) * 100 
        : 0;
      return bProgress - aProgress;
    })
    .slice(startFromPosition, maxItems ? startFromPosition + maxItems : undefined);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (sortedSellers.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Nenhum vendedor com meta definida</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedSellers.map((item, index) => {
          const position = startFromPosition + index + 1;
          const goal = item.goal!;
          const valueProgress = goal.sales_value_goal > 0
            ? Math.min((item.progress.value / goal.sales_value_goal) * 100, 100)
            : 0;
          const isOnTrack = valueProgress >= 50;

          return (
            <div 
              key={item.seller.id}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                {/* Posição com destaque para top 3 */}
                <span className={`text-sm font-bold w-6 text-center ${
                  position === 1 ? 'text-amber-500' : 
                  position === 2 ? 'text-zinc-400' : 
                  position === 3 ? 'text-amber-700' : 
                  'text-muted-foreground'
                }`}>
                  {position}º
                </span>

                {/* Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.seller.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{item.seller.name}</span>
                    <div className="flex items-center gap-1">
                      {isOnTrack ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-amber-500" />
                      )}
                      <span className={`text-xs font-bold ${isOnTrack ? 'text-green-500' : 'text-amber-500'}`}>
                        {valueProgress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={valueProgress} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatCurrency(item.progress.value)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
