import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies, type CrmContact } from '@/hooks/useCrmData';
import { formatPhone } from '../../lib/brazilianStates';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: CrmContact | null;
  onSave: (contact: Partial<CrmContact>) => void;
}

export function ContactFormDialog({ open, onOpenChange, contact, onSave }: ContactFormDialogProps) {
  const { data: companies = [] } = useCompanies();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mobile_phone: '',
    position: '',
    company_id: '',
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile_phone: contact.mobile_phone || '',
        position: contact.position || '',
        company_id: contact.company_id || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        mobile_phone: '',
        position: '',
        company_id: '',
      });
    }
  }, [contact, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: contact?.id,
      company_id: formData.company_id || undefined,
    });
    onOpenChange(false);
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: formatPhone(value) });
  };

  const handleMobileChange = (value: string) => {
    setFormData({ ...formData, mobile_phone: formatPhone(value) });
  };

  const isEditing = !!contact;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Contato' : 'Novo Contato'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Ex: Diretor de TI"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 3333-3333"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_phone">Celular</Label>
              <Input
                id="mobile_phone"
                value={formData.mobile_phone}
                onChange={(e) => handleMobileChange(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Select
              value={formData.company_id || '__none__'}
              onValueChange={(v) => setFormData({ ...formData, company_id: v === '__none__' ? '' : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma empresa</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar' : 'Criar Contato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
