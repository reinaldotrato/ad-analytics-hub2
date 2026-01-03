import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  DollarSign, 
  Mail, 
  Phone, 
  User,
  Edit,
  Trash2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Deal } from '../../lib/types';

interface DealHeaderProps {
  deal: Deal;
}

export function DealHeader({ deal }: DealHeaderProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const sourceLabels: Record<string, string> = {
    meta_ads: 'Meta Ads',
    whatsapp: 'WhatsApp',
    manual: 'Manual',
    referral: 'Indicação',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/crm/pipeline">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{deal.name}</h1>
            {deal.funnel_stage && (
              <Badge
                style={{ 
                  backgroundColor: deal.funnel_stage.color + '20',
                  color: deal.funnel_stage.color,
                  borderColor: deal.funnel_stage.color 
                }}
                variant="outline"
              >
                {deal.funnel_stage.name}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Criado em {new Date(deal.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor do Deal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{formatCurrency(deal.value)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Probabilidade: {deal.probability}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contato Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deal.contact ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{deal.contact.name}</span>
                </div>
                {deal.contact.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{deal.contact.email}</span>
                  </div>
                )}
                {deal.contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{deal.contact.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum contato vinculado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deal.contact?.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{deal.contact.company.name}</span>
              </div>
            )}
            {deal.expected_close_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Previsão: {new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {deal.source && (
              <Badge variant="secondary" className="mt-1">
                Origem: {sourceLabels[deal.source] || deal.source}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
