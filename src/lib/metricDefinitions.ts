export const metricDefinitions: Record<string, string> = {
  // KPIs Gerais (Total)
  'Custo Total': 'Valor total investido em anúncios no período',
  'Leads': 'Pessoas que demonstraram interesse no seu produto ou serviço',
  'Vendas': 'Número de negócios fechados no período',
  'Receita': 'Valor total faturado com as vendas',
  'ROAS': 'Retorno sobre o investimento. Ex: 3x = para cada R$1, você faturou R$3',
  '% Conv.': 'Porcentagem de leads que se tornaram clientes',

  // Google Ads
  'Custo': 'Valor gasto com anúncios',
  'Impressões': 'Quantas vezes seu anúncio foi exibido',
  'Cliques': 'Quantas vezes clicaram no seu anúncio',
  'Conversões': 'Ações valiosas realizadas (compra, cadastro, etc.)',
  'CTR': 'Taxa de cliques. % das pessoas que viram e clicaram',
  'Custo de Conversão': 'Quanto você pagou, em média, por cada conversão',
  'CPC': 'Custo por clique. Quanto custa cada clique no anúncio',
  'Taxa Conv.': 'Porcentagem de cliques que viraram conversões',
  'Custo/Conv.': 'Valor médio pago por cada conversão',

  // Meta Ads
  'Alcance': 'Número de pessoas únicas que viram seu anúncio',
  'Resultados': 'Ações geradas pelo anúncio (cliques, cadastros, etc.)',
  'CPR': 'Custo por resultado. Quanto você paga por cada ação',
  'CAL': 'Custo de Aquisição de Lead. Quanto custa conquistar cada lead',
  'CPL': 'Custo por Lead. Quanto você paga por cada lead gerado',
  'CPM (Mensagem)': 'Custo por Mensagem. Quanto custa cada conversa iniciada',
  'CPV': 'Custo por Visualização. Quanto custa cada visita à página',
  'Mensagens': 'Conversas iniciadas via WhatsApp, Messenger ou Direct',
  'Views': 'Visualizações de página de destino (landing page)',

  // CRM
  'Oportunidades': 'Leads qualificados com potencial real de compra',
  'Ticket Médio': 'Valor médio de cada venda realizada',
  '% Conversão': 'Porcentagem de leads que viraram clientes',

  // KpiTable
  'Orçamento': 'Valor planejado para investir no período',
  'CAV': 'Custo de Aquisição de Venda. Quanto custa fechar cada venda',
  '% Inv.': 'Percentual da receita que foi investido em marketing',

  // Keywords
  'Índice Qualidade': 'Nota do Google (1-10) sobre relevância da palavra-chave',
};

export function getMetricDefinition(key: string): string {
  return metricDefinitions[key] || '';
}
