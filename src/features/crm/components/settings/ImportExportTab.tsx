import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload, FileSpreadsheet, FileText, AlertCircle, CheckCircle2, X, ArrowLeft, Briefcase, User, Building2 } from 'lucide-react';
import { useDealsSupabase, useCreateDeal, useFunnelStagesSupabase, useContacts, useCompanies, useCreateContact, useCreateCompany } from '@/hooks/useCrmData';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Field groups for Import - Deal, Contact, Company
const IMPORT_FIELD_GROUPS = {
  deal: {
    label: 'Negócio',
    icon: Briefcase,
    fields: [
      { key: 'deal_name', label: 'Nome do Lead', required: true },
      { key: 'deal_value', label: 'Valor', required: false },
      { key: 'deal_stage', label: 'Etapa do Funil', required: true },
      { key: 'deal_status', label: 'Status (Aberto/Ganho/Perdido)', required: false },
      { key: 'deal_expected_close', label: 'Data Prevista de Fechamento', required: false },
      { key: 'deal_closed_at', label: 'Data do Fechamento', required: false },
      { key: 'deal_source', label: 'Origem', required: false },
      { key: 'deal_days_inactive', label: 'Dias sem Interação', required: false },
      { key: 'deal_created_by', label: 'Criado por (Vendedor)', required: false },
      { key: 'deal_probability', label: 'Probabilidade (%)', required: false },
      { key: 'deal_lost_reason', label: 'Motivo da Perda', required: false },
    ]
  },
  contact: {
    label: 'Contato',
    icon: User,
    fields: [
      { key: 'contact_name', label: 'Nome do Contato', required: false },
      { key: 'contact_email', label: 'E-mail do Contato', required: false },
      { key: 'contact_phone', label: 'Telefone do Contato', required: false },
      { key: 'contact_mobile', label: 'Celular do Contato', required: false },
      { key: 'contact_position', label: 'Cargo do Contato', required: false },
    ]
  },
  company: {
    label: 'Empresa',
    icon: Building2,
    fields: [
      { key: 'company_name', label: 'Nome da Empresa', required: false },
      { key: 'company_cnpj', label: 'CNPJ da Empresa', required: false },
      { key: 'company_phone', label: 'Telefone da Empresa', required: false },
      { key: 'company_email', label: 'E-mail da Empresa', required: false },
      { key: 'company_address', label: 'Endereço da Empresa', required: false },
      { key: 'company_state', label: 'Estado da Empresa', required: false },
      { key: 'company_city', label: 'Cidade da Empresa', required: false },
    ]
  }
} as const;

// All fields flattened
const ALL_IMPORT_FIELDS = [
  ...IMPORT_FIELD_GROUPS.deal.fields,
  ...IMPORT_FIELD_GROUPS.contact.fields,
  ...IMPORT_FIELD_GROUPS.company.fields,
];

type ImportFieldKey = typeof ALL_IMPORT_FIELDS[number]['key'];

// Auto-mapping rules: CSV column name patterns → Import field
const AUTO_MAP_RULES: Record<string, ImportFieldKey> = {
  // Deal fields
  'nome': 'deal_name', 'name': 'deal_name', 'lead': 'deal_name', 'titulo': 'deal_name', 'title': 'deal_name',
  'valor': 'deal_value', 'value': 'deal_value', 'price': 'deal_value', 'preco': 'deal_value', 'preço': 'deal_value',
  'etapa': 'deal_stage', 'stage': 'deal_stage', 'stage_id': 'deal_stage', 'fase': 'deal_stage', 'estagio': 'deal_stage',
  'status': 'deal_status', 'situacao': 'deal_status', 'situação': 'deal_status',
  'data_prevista': 'deal_expected_close', 'expected_close_date': 'deal_expected_close', 'previsao': 'deal_expected_close',
  'data_fechamento': 'deal_closed_at', 'closed_at': 'deal_closed_at',
  'origem': 'deal_source', 'source': 'deal_source', 'canal': 'deal_source',
  'dias_sem_interacao': 'deal_days_inactive', 'days_inactive': 'deal_days_inactive',
  'criado_por': 'deal_created_by', 'created_by': 'deal_created_by', 'vendedor': 'deal_created_by',
  'probabilidade': 'deal_probability', 'probability': 'deal_probability',
  'motivo_perda': 'deal_lost_reason', 'lost_reason': 'deal_lost_reason',
  // Contact fields
  'contato': 'contact_name', 'contact': 'contact_name', 'nome_contato': 'contact_name',
  'email_contato': 'contact_email', 'contact_email': 'contact_email',
  'telefone_contato': 'contact_phone', 'contact_phone': 'contact_phone', 'fone_contato': 'contact_phone',
  'celular': 'contact_mobile', 'celular_contato': 'contact_mobile', 'mobile': 'contact_mobile',
  'cargo': 'contact_position', 'position': 'contact_position', 'cargo_contato': 'contact_position',
  // Company fields
  'empresa': 'company_name', 'company': 'company_name', 'nome_empresa': 'company_name', 'razao_social': 'company_name',
  'cnpj': 'company_cnpj', 'cnpj_empresa': 'company_cnpj',
  'telefone_empresa': 'company_phone', 'fone_empresa': 'company_phone',
  'email_empresa': 'company_email', 'company_email': 'company_email',
  'endereco': 'company_address', 'endereco_empresa': 'company_address', 'address': 'company_address',
  'estado': 'company_state', 'uf': 'company_state', 'state': 'company_state',
  'cidade': 'company_city', 'city': 'company_city',
};

const CSV_HEADERS = [
  'id', 'name', 'value', 'probability', 'expected_close_date',
  'stage_id', 'contact_id', 'assigned_to_id', 'source',
  'source_lead_id', 'lost_reason', 'created_at', 'updated_at', 'closed_at'
];

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

type ImportStep = 'upload' | 'mapping' | 'results';
type ColumnMapping = Record<string, ImportFieldKey | '__ignore__' | ''>;

interface ParsedCSV {
  headers: string[];
  rows: string[][];
  preview: Record<string, string>;
}

export function ImportExportTab() {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;
  
  const { data: deals, isLoading: isLoadingDeals } = useDealsSupabase();
  const { data: stages } = useFunnelStagesSupabase();
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();
  const createDeal = useCreateDeal();
  const createContact = useCreateContact();
  const createCompany = useCreateCompany();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch sellers from crm_sellers table
  const [sellers, setSellers] = useState<Array<{ id: string; name: string }>>([]);
  
  useMemo(() => {
    if (effectiveClientId) {
      supabase
        .from('crm_sellers')
        .select('id, name')
        .eq('client_id', effectiveClientId)
        .eq('is_active', true)
        .then(({ data }) => {
          if (data) setSellers(data);
        });
    }
  }, [effectiveClientId]);
  
  const [isExporting, setIsExporting] = useState(false);
  
  // Import state
  const [importStep, setImportStep] = useState<ImportStep>('upload');
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [hasHeader, setHasHeader] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Check if required fields are mapped
  const requiredFieldsMapped = useMemo(() => {
    const mappedFields = new Set(Object.values(columnMapping));
    return ALL_IMPORT_FIELDS.filter(f => f.required).every(f => mappedFields.has(f.key));
  }, [columnMapping]);

  // Get unmapped required fields for error message
  const unmappedRequiredFields = useMemo(() => {
    const mappedFields = new Set(Object.values(columnMapping));
    return ALL_IMPORT_FIELDS.filter(f => f.required && !mappedFields.has(f.key));
  }, [columnMapping]);

  // Auto-map columns based on header names
  const autoMapColumns = (headers: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};
    const usedFields = new Set<ImportFieldKey>();

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
      const matchedField = AUTO_MAP_RULES[normalizedHeader];
      
      if (matchedField && !usedFields.has(matchedField)) {
        mapping[header] = matchedField;
        usedFields.add(matchedField);
      } else {
        mapping[header] = '';
      }
    });

    return mapping;
  };

  // Stage synonyms for fuzzy matching
  const stageSynonyms: Record<string, string[]> = {
    'novo lead': ['novo', 'new', 'entrada', 'lead', 'novos'],
    'qualificação': ['qualificado', 'qualificar', 'qualified', 'qualification'],
    'proposta': ['proposal', 'cotação', 'orçamento', 'cotacao', 'orcamento'],
    'negociação': ['negociando', 'negotiation', 'em negociação', 'negociacao'],
    'fechado ganho': ['ganho', 'won', 'venda', 'vendido', 'fechado', 'sucesso', 'ganhos'],
    'fechado perdido': ['perdido', 'lost', 'perdeu', 'cancelado', 'perdidos'],
  };

  // Resolve stage by name or ID with fuzzy matching
  const resolveStage = (value: string): { id: string | null; error?: string } => {
    if (!value?.trim()) {
      const validStages = stages?.map(s => s.name).join(', ') || '';
      return { id: null, error: `valor vazio. Etapas válidas: ${validStages}` };
    }
    
    const trimmedValue = value.trim().toLowerCase();
    
    // 1. Exact match by ID
    const exactIdMatch = stages?.find(s => s.id === value.trim());
    if (exactIdMatch) return { id: exactIdMatch.id };
    
    // 2. Exact match by name (case-insensitive)
    const exactNameMatch = stages?.find(s => s.name.toLowerCase() === trimmedValue);
    if (exactNameMatch) return { id: exactNameMatch.id };
    
    // 3. Partial match (name contains value or value contains name)
    const partialMatch = stages?.find(s => 
      s.name.toLowerCase().includes(trimmedValue) || 
      trimmedValue.includes(s.name.toLowerCase())
    );
    if (partialMatch) return { id: partialMatch.id };
    
    // 4. Synonym matching
    for (const stage of stages || []) {
      const synonymList = stageSynonyms[stage.name.toLowerCase()] || [];
      if (synonymList.some(syn => trimmedValue.includes(syn) || syn.includes(trimmedValue))) {
        return { id: stage.id };
      }
    }
    
    // 5. No match found - return detailed error
    const validStages = stages?.map(s => s.name).join(', ') || '';
    return { id: null, error: `"${value.trim()}" não encontrada. Etapas válidas: ${validStages}` };
  };

  // Resolve seller by name or ID
  const resolveSeller = (value: string): string | null => {
    if (!value?.trim()) return null;
    const trimmedValue = value.trim();
    const exactMatch = sellers?.find(s => s.id === trimmedValue);
    if (exactMatch) return exactMatch.id;
    const nameMatch = sellers?.find(s => s.name.toLowerCase() === trimmedValue.toLowerCase());
    if (nameMatch) return nameMatch.id;
    return null;
  };

  // Parse status value
  const parseStatus = (value: string): string => {
    const lower = value?.toLowerCase().trim() || '';
    if (['ganho', 'won', 'vencido', 'fechado'].includes(lower)) return 'won';
    if (['perdido', 'lost', 'perdeu'].includes(lower)) return 'lost';
    return 'open';
  };

  const handleExport = () => {
    if (!deals || deals.length === 0) {
      toast.error('Nenhum deal para exportar');
      return;
    }

    setIsExporting(true);
    try {
      const headerRow = CSV_HEADERS.join(',');
      const dataRows = deals.map(deal => 
        CSV_HEADERS.map(header => {
          const value = deal[header as keyof typeof deal];
          return escapeCSVValue(value);
        }).join(',')
      );
      
      const csvContent = [headerRow, ...dataRows].join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `deals_export_${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`${deals.length} deals exportados com sucesso`);
    } catch (error) {
      toast.error('Erro ao exportar deals');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ALL_IMPORT_FIELDS.map(f => f.key.replace('deal_', '').replace('contact_', 'contato_').replace('company_', 'empresa_'));
    const csvContent = headers.join(',');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Template baixado');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);
    
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError('Por favor, selecione um arquivo no formato CSV (.csv). Formatos como .xlsx ou .xls não são suportados.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 1) {
          setFileError('O arquivo CSV está vazio.');
          return;
        }

        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => parseCSVLine(line));
        
        const preview: Record<string, string> = {};
        headers.forEach((header, idx) => {
          preview[header] = rows[0]?.[idx] || '';
        });

        setParsedCSV({ headers, rows, preview });
        setColumnMapping(autoMapColumns(headers));
        setImportStep('mapping');
      } catch (error) {
        setFileError('Erro ao processar o arquivo CSV. Verifique se o formato está correto.');
        console.error('CSV parse error:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (csvColumn: string, field: ImportFieldKey | '__ignore__' | '') => {
    setColumnMapping(prev => ({
      ...prev,
      [csvColumn]: field
    }));
  };

  const handleIgnoreColumn = (csvColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvColumn]: prev[csvColumn] === '__ignore__' ? '' : '__ignore__'
    }));
  };

  const handleImport = async () => {
    if (!parsedCSV || !effectiveClientId) return;

    setIsImporting(true);
    setImportErrors([]);
    setImportSuccess(null);
    setImportProgress(0);

    const errors: string[] = [];
    let successCount = 0;
    const dataRows = hasHeader ? parsedCSV.rows : [parsedCSV.headers, ...parsedCSV.rows];
    const headers = hasHeader ? parsedCSV.headers : parsedCSV.headers.map((_, i) => `Coluna ${i + 1}`);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowData: Record<string, string> = {};

      // Extract all mapped values
      headers.forEach((header, idx) => {
        const mapping = columnMapping[header];
        if (mapping && mapping !== '__ignore__') {
          rowData[mapping] = (row[idx] || '').trim();
        }
      });

      // Validate required fields
      if (!rowData.deal_name) {
        errors.push(`Linha ${i + 1}: Campo "Nome do Lead" é obrigatório`);
        continue;
      }
      
      const stageResult = resolveStage(rowData.deal_stage || '');
      if (!stageResult.id) {
        errors.push(`Linha ${i + 1}: Etapa do Funil ${stageResult.error}`);
        continue;
      }
      const stageId = stageResult.id;

      try {
        let companyId: string | undefined;
        let contactId: string | undefined;

        // 1. Create or find company if company data exists
        if (rowData.company_name) {
          // Try to find existing company by name
          const existingCompany = companies?.find(c => c.name.toLowerCase() === rowData.company_name.toLowerCase());
          if (existingCompany) {
            companyId = existingCompany.id;
          } else {
            // Create new company
            const newCompany = await createCompany.mutateAsync({
              name: rowData.company_name,
              cnpj: rowData.company_cnpj || undefined,
              phone: rowData.company_phone || undefined,
              email: rowData.company_email || undefined,
              address: rowData.company_address || undefined,
              state: rowData.company_state || undefined,
              city: rowData.company_city || undefined,
            });
            companyId = newCompany.id;
          }
        }

        // 2. Create or find contact if contact data exists
        if (rowData.contact_name) {
          // Try to find existing contact by name and email
          const existingContact = contacts?.find(c => 
            c.name.toLowerCase() === rowData.contact_name.toLowerCase() &&
            (!rowData.contact_email || c.email?.toLowerCase() === rowData.contact_email.toLowerCase())
          );
          if (existingContact) {
            contactId = existingContact.id;
          } else {
            // Create new contact
            const newContact = await createContact.mutateAsync({
              name: rowData.contact_name,
              email: rowData.contact_email || undefined,
              phone: rowData.contact_phone || undefined,
              mobile_phone: rowData.contact_mobile || undefined,
              position: rowData.contact_position || undefined,
              company_id: companyId,
            });
            contactId = newContact.id;
          }
        }

        // 3. Create deal
        await createDeal.mutateAsync({
          name: rowData.deal_name,
          value: parseFloat(rowData.deal_value) || 0,
          probability: parseInt(rowData.deal_probability) || 0,
          expected_close_date: rowData.deal_expected_close || null,
          stage_id: stageId,
          contact_id: contactId || null,
          assigned_to_id: resolveSeller(rowData.deal_created_by || '') || null,
          created_by_id: resolveSeller(rowData.deal_created_by || '') || null,
          source: rowData.deal_source || null,
          status: parseStatus(rowData.deal_status),
          days_without_interaction: parseInt(rowData.deal_days_inactive) || 0,
          lost_reason: rowData.deal_lost_reason || null,
          closed_at: rowData.deal_closed_at || null,
        });
        successCount++;
      } catch (error) {
        errors.push(`Linha ${i + 1}: Erro ao criar lead - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }

      setImportProgress(((i + 1) / dataRows.length) * 100);
    }

    setImportErrors(errors);
    setImportSuccess(successCount);
    setImportStep('results');
    setIsImporting(false);
  };

  const resetImport = () => {
    setImportStep('upload');
    setParsedCSV(null);
    setColumnMapping({});
    setHasHeader(true);
    setImportErrors([]);
    setImportSuccess(null);
    setImportProgress(0);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Get available fields (not already mapped)
  const getAvailableFields = (currentColumn: string) => {
    const usedFields = new Set(
      Object.entries(columnMapping)
        .filter(([col, field]) => col !== currentColumn && field && field !== '__ignore__')
        .map(([, field]) => field)
    );
    return ALL_IMPORT_FIELDS.filter(f => !usedFields.has(f.key));
  };

  // Get field group icon
  const getFieldGroupIcon = (fieldKey: string) => {
    if (fieldKey.startsWith('deal_')) return '📋';
    if (fieldKey.startsWith('contact_')) return '👤';
    if (fieldKey.startsWith('company_')) return '🏢';
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar/Exportar Leads
        </h2>
        <p className="text-sm text-muted-foreground">
          Importe leads com dados de Negócio, Contato e Empresa de um arquivo CSV
        </p>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Dados
          </CardTitle>
          <CardDescription>
            Exporte todos os seus leads para um arquivo CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleExport} 
              disabled={isExporting || isLoadingDeals || !deals?.length}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : `Exportar ${deals?.length || 0} leads`}
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <FileText className="h-4 w-4 mr-2" />
              Baixar Template CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar Dados
          </CardTitle>
          <CardDescription>
            Importe leads de um arquivo CSV com dados de Negócio, Contato e Empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Upload */}
          {importStep === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Arraste um arquivo CSV ou clique para selecionar
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="max-w-xs mx-auto"
                />
              </div>
              
              {fileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  O arquivo deve estar no formato CSV (.csv). Arquivos Excel (.xlsx, .xls) devem ser convertidos para CSV antes da importação.
                  A importação permite criar Negócios, Contatos e Empresas simultaneamente.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 2: Mapping */}
          {importStep === 'mapping' && parsedCSV && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={resetImport}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasHeader"
                      checked={hasHeader}
                      onCheckedChange={(checked) => setHasHeader(!!checked)}
                    />
                    <Label htmlFor="hasHeader" className="text-sm">
                      Primeira linha é cabeçalho
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 text-xs text-muted-foreground mb-2">
                <span className="inline-flex items-center gap-1">📋 Negócio</span>
                <span className="inline-flex items-center gap-1">👤 Contato</span>
                <span className="inline-flex items-center gap-1">🏢 Empresa</span>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Coluna do CSV</TableHead>
                      <TableHead className="w-[150px]">Pré-visualização</TableHead>
                      <TableHead>Campo no CRM</TableHead>
                      <TableHead className="w-[100px]">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedCSV.headers.map((header) => {
                      const currentMapping = columnMapping[header];
                      const isIgnored = currentMapping === '__ignore__';
                      const mappedField = ALL_IMPORT_FIELDS.find(f => f.key === currentMapping);
                      
                      return (
                        <TableRow key={header} className={isIgnored ? 'opacity-50' : ''}>
                          <TableCell className="font-medium">{header}</TableCell>
                          <TableCell className="text-muted-foreground text-sm truncate max-w-[150px]">
                            {parsedCSV.preview[header] || '-'}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={currentMapping || '__none__'}
                              onValueChange={(value) => handleMappingChange(header, value === '__none__' ? '' : value as ImportFieldKey)}
                              disabled={isIgnored}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecionar campo...">
                                  {mappedField ? `${getFieldGroupIcon(mappedField.key)} ${mappedField.label}` : 'Selecionar campo...'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Selecionar campo...</SelectItem>
                                
                                <SelectGroup>
                                  <SelectLabel>📋 Negócio</SelectLabel>
                                  {getAvailableFields(header)
                                    .filter(f => f.key.startsWith('deal_'))
                                    .map(field => (
                                      <SelectItem key={field.key} value={field.key}>
                                        {field.label} {field.required && '⭐'}
                                      </SelectItem>
                                    ))}
                                </SelectGroup>
                                
                                <SelectGroup>
                                  <SelectLabel>👤 Contato</SelectLabel>
                                  {getAvailableFields(header)
                                    .filter(f => f.key.startsWith('contact_'))
                                    .map(field => (
                                      <SelectItem key={field.key} value={field.key}>
                                        {field.label}
                                      </SelectItem>
                                    ))}
                                </SelectGroup>
                                
                                <SelectGroup>
                                  <SelectLabel>🏢 Empresa</SelectLabel>
                                  {getAvailableFields(header)
                                    .filter(f => f.key.startsWith('company_'))
                                    .map(field => (
                                      <SelectItem key={field.key} value={field.key}>
                                        {field.label}
                                      </SelectItem>
                                    ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={isIgnored ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => handleIgnoreColumn(header)}
                            >
                              {isIgnored ? 'Usar' : 'Ignorar'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {!requiredFieldsMapped && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Campos obrigatórios não mapeados: {unmappedRequiredFields.map(f => f.label).join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={resetImport}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!requiredFieldsMapped || isImporting}
                >
                  {isImporting ? (
                    <>
                      Importando... ({Math.round(importProgress)}%)
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar {parsedCSV.rows.length} linhas
                    </>
                  )}
                </Button>
              </div>

              {isImporting && (
                <Progress value={importProgress} className="w-full" />
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {importStep === 'results' && (
            <div className="space-y-4">
              {importSuccess !== null && importSuccess > 0 && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    {importSuccess} lead(s) importado(s) com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              {importErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">{importErrors.length} erro(s) encontrado(s):</div>
                    <ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                      {importErrors.map((error, idx) => (
                        <li key={idx} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button onClick={resetImport}>
                  <X className="h-4 w-4 mr-2" />
                  Nova Importação
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
