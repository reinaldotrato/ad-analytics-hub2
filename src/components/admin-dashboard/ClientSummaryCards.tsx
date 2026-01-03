import { Building2, Users, Target, CheckCircle, DollarSign, TrendingUp, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { ClientMetrics } from '@/hooks/useAdminGlobalData';

interface ClientSummaryCardsProps {
  clients: ClientMetrics[];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`;
  }
  return `R$ ${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function ClientSummaryCards({ clients }: ClientSummaryCardsProps) {
  const navigate = useNavigate();
  const { setSelectedClientId } = useAuth();

  if (!clients || clients.length === 0) {
    return null;
  }

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
    navigate('/client-dashboard');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        Resumo por Cliente
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map((client) => {
          const totalSpend = client.googleSpend + client.metaSpend;
          const googlePercent = totalSpend > 0 ? (client.googleSpend / totalSpend) * 100 : 0;
          
          return (
            <Card 
              key={client.clientId} 
              className={cn(
                "transition-all cursor-pointer group",
                client.hasSyncedData 
                  ? "hover:shadow-lg hover:border-primary/50" 
                  : "opacity-70 border-dashed border-amber-500/30 hover:opacity-100"
              )}
              onClick={() => handleClientClick(client.clientId)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-base">
                    {client.logoUrl ? (
                      <img 
                        src={client.logoUrl} 
                        alt={client.clientName}
                        className="h-10 w-10 rounded-lg object-contain border bg-background p-1"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    {client.clientName}
                  </span>
                  <div className="flex items-center gap-2">
                    {!client.hasSyncedData && (
                      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse">
                        <Clock className="h-3 w-3 mr-1" />
                        Aguardando sincronização
                      </Badge>
                    )}
                    {client.hasSyncedData && client.googleCampaignsActive > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                        G: {client.googleCampaignsActive}
                      </Badge>
                    )}
                    {client.hasSyncedData && client.metaCampaignsActive > 0 && (
                      <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                        M: {client.metaCampaignsActive}
                      </Badge>
                    )}
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Gastos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Investimento Total</span>
                    <span className="font-semibold">{formatCurrency(totalSpend)}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress value={googlePercent} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Google: {formatCurrency(client.googleSpend)}</span>
                      <span>Meta: {formatCurrency(client.metaSpend)}</span>
                    </div>
                  </div>
                </div>

                {/* Funil */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Users className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{formatNumber(client.leads)}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Target className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                    <p className="text-lg font-bold">{formatNumber(client.opportunities)}</p>
                    <p className="text-xs text-muted-foreground">Oportunid.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <CheckCircle className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                    <p className="text-lg font-bold">{formatNumber(client.sales)}</p>
                    <p className="text-xs text-muted-foreground">Vendas</p>
                  </div>
                </div>

                {/* Receita */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Receita</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">{formatCurrency(client.revenue)}</span>
                </div>

                {/* Métricas Derivadas */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">CAL</p>
                    <p className="text-sm font-semibold">{formatCurrency(client.cal)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">CAV</p>
                    <p className="text-sm font-semibold">{formatCurrency(client.cav)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">ROAS</p>
                    <p className="text-sm font-semibold flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      {client.roas.toFixed(2)}x
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
