import { ExternalLink, RefreshCw, Settings, CheckCircle2, AlertCircle, Clock, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientCredential } from '@/services/clientsService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IntegrationCardProps {
  credential: ClientCredential;
  onConfigure: () => void;
  onTest: () => void;
  isTesting?: boolean;
}

const CHANNEL_ICONS: Record<string, string> = {
  meta_ads: '📘',
  google_ads: '🔍',
  rd_station: '📊',
  moskit: '💼',
  google_analytics: '📈',
  other: '🔗',
};

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  rd_station: 'RD Station',
  moskit: 'Moskit CRM',
  google_analytics: 'Google Analytics',
  other: 'Outro',
};

// Labels contextuais para o campo de ID por canal
const CHANNEL_ID_LABELS: Record<string, string> = {
  meta_ads: 'Account ID',
  google_ads: 'Customer ID',
  rd_station: 'API Key',
  moskit: 'Token',
  google_analytics: 'Property ID',
  other: 'Login',
};

const getStatusConfig = (status: string | null, lastSyncAt: string | null) => {
  // Check if sync is stale (>24h)
  const isStale = lastSyncAt 
    ? (Date.now() - new Date(lastSyncAt).getTime()) > 24 * 60 * 60 * 1000 
    : false;

  if (status === 'connected' && !isStale) {
    return {
      color: 'bg-green-500',
      textColor: 'text-green-500',
      label: 'Conectado',
      Icon: CheckCircle2,
    };
  }
  if (status === 'connected' && isStale) {
    return {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      label: 'Sem sync recente',
      Icon: Clock,
    };
  }
  if (status === 'error') {
    return {
      color: 'bg-red-500',
      textColor: 'text-red-500',
      label: 'Erro',
      Icon: AlertCircle,
    };
  }
  return {
    color: 'bg-muted-foreground',
    textColor: 'text-muted-foreground',
    label: 'Pendente',
    Icon: Circle,
  };
};

export function IntegrationCard({ credential, onConfigure, onTest, isTesting }: IntegrationCardProps) {
  const statusConfig = getStatusConfig(credential.connection_status, credential.last_sync_at);
  const StatusIcon = statusConfig.Icon;

  const lastSyncText = credential.last_sync_at
    ? `Última sync: ${formatDistanceToNow(new Date(credential.last_sync_at), { addSuffix: true, locale: ptBR })}`
    : 'Nunca sincronizado';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{CHANNEL_ICONS[credential.channel] || '🔗'}</span>
            <div>
              <h3 className="font-semibold text-foreground">
                {CHANNEL_LABELS[credential.channel] || credential.channel}
              </h3>
              {credential.channel_name && (
                <p className="text-sm text-muted-foreground">{credential.channel_name}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className={`${statusConfig.textColor} border-current`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {credential.login && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{CHANNEL_ID_LABELS[credential.channel] || 'ID'}:</span> {credential.login}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{lastSyncText}</p>
          {credential.last_error_message && credential.connection_status === 'error' && (
            <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded">
              {credential.last_error_message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {credential.n8n_workflow_url && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <a href={credential.n8n_workflow_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir N8N
              </a>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTest}
            disabled={isTesting}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testando...' : 'Testar Conexão'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onConfigure}
          >
            <Settings className="w-4 h-4 mr-1" />
            Configurar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
