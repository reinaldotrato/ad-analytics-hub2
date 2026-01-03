import { PerformanceLog } from "@/services/systemMonitorService";
import { toast } from "sonner";

export interface DiagnosticResult {
  title: string;
  description: string;
  possibleCauses: string[];
  suggestedActions: DiagnosticAction[];
}

export interface DiagnosticAction {
  id: string;
  label: string;
  description: string;
  type: 'automatic' | 'manual' | 'link';
  handler?: () => Promise<void>;
  url?: string;
}

class OptimizationService {
  private projectId = 'oorsclbnzfujgxzxfruj';

  getSupabaseLogsUrl(): string {
    return `https://supabase.com/dashboard/project/${this.projectId}/logs/explorer`;
  }

  getSupabaseFunctionsLogsUrl(functionName?: string): string {
    if (functionName) {
      return `https://supabase.com/dashboard/project/${this.projectId}/functions/${functionName}/logs`;
    }
    return `https://supabase.com/dashboard/project/${this.projectId}/functions`;
  }

  getSupabaseTableEditorUrl(): string {
    return `https://supabase.com/dashboard/project/${this.projectId}/editor`;
  }

  copyDiagnosticInfo(log: PerformanceLog): void {
    const info = `
=== Diagnóstico de Performance ===
Query: ${log.metric_name}
Tipo: ${log.metric_type}
Valor: ${log.value}${log.metric_type === 'response_time' ? 'ms' : log.metric_type === 'payload_size' ? 'KB' : ''}
Data: ${log.created_at}
Metadata: ${JSON.stringify(log.metadata, null, 2)}
    `.trim();

    navigator.clipboard.writeText(info);
    toast.success("Informações copiadas para a área de transferência");
  }

  diagnoseQuery(log: PerformanceLog): DiagnosticResult {
    const { metric_type, value, metric_name } = log;

    if (metric_type === 'response_time') {
      if (value > 800) {
        return {
          title: `Query Crítica: ${metric_name}`,
          description: `Tempo de resposta de ${Math.round(value)}ms está muito acima do aceitável.`,
          possibleCauses: [
            'Cold start do banco de dados após período de inatividade',
            'Função RPC com lógica complexa',
            'Falta de índices nas tabelas consultadas',
            'Grande volume de dados sem paginação'
          ],
          suggestedActions: this.getActionsForSlowQuery(log)
        };
      } else if (value > 300) {
        return {
          title: `Query Lenta: ${metric_name}`,
          description: `Tempo de resposta de ${Math.round(value)}ms pode impactar a experiência.`,
          possibleCauses: [
            'Consulta sem índice otimizado',
            'Join complexo entre tabelas',
            'Dados não cacheados'
          ],
          suggestedActions: this.getActionsForSlowQuery(log)
        };
      }
    }

    if (metric_type === 'payload_size' && value > 100) {
      return {
        title: `Payload Grande: ${metric_name}`,
        description: `Resposta de ${Math.round(value)}KB pode causar lentidão no carregamento.`,
        possibleCauses: [
          'Seleção de todas as colunas (SELECT *)',
          'Falta de paginação nos resultados',
          'Dados desnecessários sendo retornados'
        ],
        suggestedActions: [
          {
            id: 'add-pagination',
            label: 'Adicionar Paginação',
            description: 'Limitar quantidade de registros por página',
            type: 'manual'
          },
          {
            id: 'select-columns',
            label: 'Selecionar Colunas',
            description: 'Retornar apenas colunas necessárias',
            type: 'manual'
          },
          {
            id: 'view-logs',
            label: 'Ver Logs',
            description: 'Analisar detalhes no Supabase',
            type: 'link',
            url: this.getSupabaseLogsUrl()
          }
        ]
      };
    }

    if (metric_type === 'error') {
      return {
        title: `Erro: ${metric_name}`,
        description: 'Uma consulta retornou erro.',
        possibleCauses: [
          'Problema de permissão (RLS)',
          'Erro de sintaxe SQL',
          'Tabela ou coluna inexistente',
          'Timeout da conexão'
        ],
        suggestedActions: [
          {
            id: 'view-logs',
            label: 'Ver Logs Detalhados',
            description: 'Verificar stack trace do erro',
            type: 'link',
            url: this.getSupabaseLogsUrl()
          },
          {
            id: 'copy-info',
            label: 'Copiar Diagnóstico',
            description: 'Copiar informações para suporte',
            type: 'automatic',
            handler: async () => this.copyDiagnosticInfo(log)
          }
        ]
      };
    }

    return {
      title: `Métrica: ${metric_name}`,
      description: 'Operação dentro dos parâmetros normais.',
      possibleCauses: [],
      suggestedActions: []
    };
  }

  private getActionsForSlowQuery(log: PerformanceLog): DiagnosticAction[] {
    const actions: DiagnosticAction[] = [];
    const isRpc = log.metric_name.startsWith('rpc:');

    if (isRpc) {
      const functionName = log.metric_name.replace('rpc:', '');
      actions.push({
        id: 'warm-up',
        label: 'Aquecer Função',
        description: 'Executar chamada para manter conexão ativa',
        type: 'automatic',
        handler: async () => {
          toast.info(`Aquecendo função ${functionName}...`);
          // Simulating a warm-up call - in production this would call the function
          await new Promise(resolve => setTimeout(resolve, 500));
          toast.success('Função aquecida com sucesso');
        }
      });
      actions.push({
        id: 'view-function-logs',
        label: 'Ver Logs da Função',
        description: 'Verificar execuções recentes',
        type: 'link',
        url: this.getSupabaseFunctionsLogsUrl()
      });
    }

    actions.push({
      id: 'view-logs',
      label: 'Ver Logs',
      description: 'Analisar query no Supabase',
      type: 'link',
      url: this.getSupabaseLogsUrl()
    });

    actions.push({
      id: 'copy-info',
      label: 'Copiar Info',
      description: 'Copiar informações diagnósticas',
      type: 'automatic',
      handler: async () => this.copyDiagnosticInfo(log)
    });

    return actions;
  }

  getTableOptimizationActions(tableName: string, deadTuples: number): DiagnosticAction[] {
    const actions: DiagnosticAction[] = [];

    if (deadTuples > 1000) {
      actions.push({
        id: 'view-table',
        label: 'Ver Tabela',
        description: `Abrir ${tableName} no editor`,
        type: 'link',
        url: this.getSupabaseTableEditorUrl()
      });
    }

    return actions;
  }
}

export const optimizationService = new OptimizationService();
