import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Briefcase, User, Building2, Loader2 } from 'lucide-react';
import { useFunnelStages } from '../../hooks/useFunnelStages';
import { useContacts, useCompanies, useCreateContact, useCreateCompany, useFunnels } from '@/hooks/useCrmData';
import { toast } from 'sonner';

interface AddDealDialogProps {
  onAdd: (deal: {
    name: string;
    value: number;
    stage_id: string;
    contact_id?: string;
    client_id: string;
    probability: number;
    source?: string;
  }) => void;
  clientId: string;
}

const SOURCES = [
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'site', label: 'Site' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'manual', label: 'Manual' },
];

type ContactMode = 'existing' | 'new' | 'none';
type CompanyMode = 'existing' | 'new' | 'none';

export function AddDealDialog({ onAdd, clientId }: AddDealDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deal fields
  const [dealName, setDealName] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [selectedFunnelId, setSelectedFunnelId] = useState('');
  const [stageId, setStageId] = useState('');
  const [source, setSource] = useState('');

  // Contact fields
  const [contactMode, setContactMode] = useState<ContactMode>('new');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPosition, setContactPosition] = useState('');

  // Company fields
  const [companyMode, setCompanyMode] = useState<CompanyMode>('none');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Data hooks
  const { data: funnels = [], isLoading: funnelsLoading } = useFunnels();
  const { stages, isLoading: stagesLoading } = useFunnelStages(selectedFunnelId || undefined);
  const { data: contacts = [], isLoading: contactsLoading } = useContacts();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const createContact = useCreateContact();
  const createCompany = useCreateCompany();

  // Auto-selecionar funil padrão ao abrir
  useEffect(() => {
    if (open && funnels.length > 0 && !selectedFunnelId) {
      const defaultFunnel = funnels.find(f => f.is_default) || funnels[0];
      setSelectedFunnelId(defaultFunnel.id);
    }
  }, [open, funnels, selectedFunnelId]);

  // Limpar etapa quando funil mudar
  const handleFunnelChange = (funnelId: string) => {
    setSelectedFunnelId(funnelId);
    setStageId(''); // Limpa etapa ao trocar funil
  };

  const resetForm = () => {
    setDealName('');
    setDealValue('');
    setSelectedFunnelId('');
    setStageId('');
    setSource('');
    setContactMode('new');
    setSelectedContactId('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactPosition('');
    setCompanyMode('none');
    setSelectedCompanyId('');
    setCompanyName('');
    setCompanyIndustry('');
    setCompanyEmail('');
    setCompanyPhone('');
    setCompanyWebsite('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dealName || !stageId || !clientId) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (contactMode === 'new' && !contactName) {
      toast.error('Nome do contato é obrigatório');
      return;
    }

    if (companyMode === 'new' && !companyName) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCompanyId: string | undefined;
      let finalContactId: string | undefined;

      // 1. Create company if needed
      if (companyMode === 'new' && companyName) {
        const newCompany = await createCompany.mutateAsync({
          name: companyName,
          industry: companyIndustry || undefined,
          email: companyEmail || undefined,
          phone: companyPhone || undefined,
          website: companyWebsite || undefined,
        });
        finalCompanyId = newCompany.id;
      } else if (companyMode === 'existing' && selectedCompanyId) {
        finalCompanyId = selectedCompanyId;
      }

      // 2. Create contact if needed
      if (contactMode === 'new' && contactName) {
        const newContact = await createContact.mutateAsync({
          name: contactName,
          email: contactEmail || undefined,
          phone: contactPhone || undefined,
          position: contactPosition || undefined,
          company_id: finalCompanyId || undefined,
        });
        finalContactId = newContact.id;
      } else if (contactMode === 'existing' && selectedContactId) {
        finalContactId = selectedContactId;
      }

      // 3. Create the deal
      onAdd({
        name: dealName,
        value: parseFloat(dealValue) || 0,
        stage_id: stageId,
        contact_id: finalContactId,
        client_id: clientId,
        probability: 50,
        source: source || undefined,
      });

      toast.success('Negócio criado com sucesso!');
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Erro ao criar negócio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Negócio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Novo Negócio</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
            {/* Deal Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Briefcase className="h-4 w-4" />
                Dados do Negócio
              </div>
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="dealName">Nome do Negócio *</Label>
                  <Input
                    id="dealName"
                    value={dealName}
                    onChange={e => setDealName(e.target.value)}
                    placeholder="Ex: Projeto Website"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealValue">Valor (R$)</Label>
                  <Input
                    id="dealValue"
                    type="number"
                    value={dealValue}
                    onChange={e => setDealValue(e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Origem</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Funil *</Label>
                  <Select value={selectedFunnelId} onValueChange={handleFunnelChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder={funnelsLoading ? "Carregando..." : "Selecione um funil"} />
                    </SelectTrigger>
                    <SelectContent>
                      {funnels.map(funnel => (
                        <SelectItem key={funnel.id} value={funnel.id}>
                          {funnel.name}
                          {funnel.is_default && ' (Padrão)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Etapa do Funil *</Label>
                  <Select 
                    value={stageId} 
                    onValueChange={setStageId} 
                    required
                    disabled={!selectedFunnelId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedFunnelId 
                          ? "Selecione um funil primeiro" 
                          : stagesLoading 
                            ? "Carregando..." 
                            : "Selecione uma etapa"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {stages
                        .filter(s => !s.is_won && !s.is_lost)
                        .map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: stage.color }}
                              />
                              {stage.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <User className="h-4 w-4" />
                Contato
              </div>
              <Separator />

              <RadioGroup
                value={contactMode}
                onValueChange={(v) => setContactMode(v as ContactMode)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="contact-new" />
                  <Label htmlFor="contact-new" className="cursor-pointer">Criar novo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="contact-existing" />
                  <Label htmlFor="contact-existing" className="cursor-pointer">Selecionar existente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="contact-none" />
                  <Label htmlFor="contact-none" className="cursor-pointer">Nenhum</Label>
                </div>
              </RadioGroup>

              {contactMode === 'existing' && (
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger>
                    <SelectValue placeholder={contactsLoading ? "Carregando..." : "Selecione um contato"} />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {contactMode === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contactName">Nome *</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="Nome do contato"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">E-mail</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Telefone</Label>
                    <Input
                      id="contactPhone"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contactPosition">Cargo</Label>
                    <Input
                      id="contactPosition"
                      value={contactPosition}
                      onChange={e => setContactPosition(e.target.value)}
                      placeholder="Ex: Gerente de Marketing"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Company Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Building2 className="h-4 w-4" />
                Empresa (opcional)
              </div>
              <Separator />

              <RadioGroup
                value={companyMode}
                onValueChange={(v) => setCompanyMode(v as CompanyMode)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="company-none" />
                  <Label htmlFor="company-none" className="cursor-pointer">Nenhuma</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="company-new" />
                  <Label htmlFor="company-new" className="cursor-pointer">Criar nova</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="company-existing" />
                  <Label htmlFor="company-existing" className="cursor-pointer">Selecionar existente</Label>
                </div>
              </RadioGroup>

              {companyMode === 'existing' && (
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder={companiesLoading ? "Carregando..." : "Selecione uma empresa"} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {companyMode === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyIndustry">Setor</Label>
                    <Input
                      id="companyIndustry"
                      value={companyIndustry}
                      onChange={e => setCompanyIndustry(e.target.value)}
                      placeholder="Ex: Tecnologia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">E-mail</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyEmail}
                      onChange={e => setCompanyEmail(e.target.value)}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Telefone</Label>
                    <Input
                      id="companyPhone"
                      value={companyPhone}
                      onChange={e => setCompanyPhone(e.target.value)}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={companyWebsite}
                      onChange={e => setCompanyWebsite(e.target.value)}
                      placeholder="https://empresa.com"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!clientId || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Negócio'
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
