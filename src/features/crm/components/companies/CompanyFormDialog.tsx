import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CrmCompany } from '@/hooks/useCrmData';
import { BRAZILIAN_STATES, CITIES_BY_STATE, formatCNPJ, formatPhone } from '../../lib/brazilianStates';

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: CrmCompany | null;
  onSave: (company: Partial<CrmCompany>) => void;
}

export function CompanyFormDialog({ open, onOpenChange, company, onSave }: CompanyFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    website: '',
    cnpj: '',
    address: '',
    state: '',
    city: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        cnpj: company.cnpj || '',
        address: company.address || '',
        state: company.state || '',
        city: company.city || '',
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        email: '',
        phone: '',
        website: '',
        cnpj: '',
        address: '',
        state: '',
        city: '',
      });
    }
  }, [company, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: company?.id,
    });
    onOpenChange(false);
  };

  const handleCnpjChange = (value: string) => {
    setFormData({ ...formData, cnpj: formatCNPJ(value) });
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: formatPhone(value) });
  };

  const handleStateChange = (value: string) => {
    setFormData({ ...formData, state: value === '__none__' ? '' : value, city: '' });
  };

  const availableCities = formData.state ? CITIES_BY_STATE[formData.state] || [] : [];
  const isEditing = !!company;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da empresa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleCnpjChange(e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Indústria/Setor</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Ex: Tecnologia, Varejo, Saúde"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 3333-3333"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select
                value={formData.state || '__none__'}
                onValueChange={handleStateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Selecione...</SelectItem>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Select
                value={formData.city || '__none__'}
                onValueChange={(v) => setFormData({ ...formData, city: v === '__none__' ? '' : v })}
                disabled={!formData.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.state ? "Selecione a cidade" : "Selecione o estado primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Selecione...</SelectItem>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.empresa.com.br"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar' : 'Criar Empresa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
