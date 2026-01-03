import { useParams, useNavigate } from 'react-router-dom';
import { useDetailData, DetailEntityType } from '../hooks/useDetailData';
import DetailHeader from '../components/detail/DetailHeader';
import DetailLeftSidebar from '../components/detail/DetailLeftSidebar';
import DetailCenterPanel from '../components/detail/DetailCenterPanel';
import DetailRightPanel from '../components/detail/DetailRightPanel';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CrmDetailPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  
  const validTypes: DetailEntityType[] = ['deal', 'contact', 'company'];
  const entityType = validTypes.includes(type as DetailEntityType) 
    ? (type as DetailEntityType) 
    : 'deal';
  
  const { data, isLoading, error } = useDetailData(entityType, id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Registro não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O {entityType === 'deal' ? 'negócio' : entityType === 'contact' ? 'contato' : 'empresa'} solicitado não foi encontrado.
          </p>
          <Button
            onClick={() => navigate('/crm/pipeline')}
            variant="outline"
          >
            Voltar para o CRM
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com Abas */}
      <DetailHeader type={entityType} data={data} />

      {/* Conteúdo Principal (3 Colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
        {/* Coluna Esquerda */}
        <div className="lg:col-span-1">
          <DetailLeftSidebar type={entityType} data={data} />
        </div>

        {/* Coluna Central */}
        <div className="lg:col-span-1">
          <DetailCenterPanel type={entityType} data={data} />
        </div>

        {/* Coluna Direita */}
        <div className="lg:col-span-1">
          <DetailRightPanel type={entityType} data={data} />
        </div>
      </div>
    </div>
  );
}

export default CrmDetailPage;
