import { ClientCredential } from '@/services/clientsService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  rd_station: 'RD Station',
  moskit: 'Moskit CRM',
  google_analytics: 'Google Analytics',
  other: 'Outro',
};

interface CredentialsTableProps {
  credentials: ClientCredential[];
  onEdit: (credential: ClientCredential) => void;
  onDelete: (credential: ClientCredential) => void;
}

export function CredentialsTable({ credentials, onEdit, onDelete }: CredentialsTableProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const togglePasswordVisibility = (credentialId: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(credentialId)) {
        next.delete(credentialId);
      } else {
        next.add(credentialId);
      }
      return next;
    });
  };

  if (credentials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma credencial cadastrada
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Canal</TableHead>
            <TableHead>Nome da Conta</TableHead>
            <TableHead>Login</TableHead>
            <TableHead>Senha</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credentials.map((credential) => (
            <TableRow key={credential.id}>
              <TableCell>
                <Badge variant="secondary">
                  {CHANNEL_LABELS[credential.channel] || credential.channel}
                </Badge>
              </TableCell>
              <TableCell>{credential.channel_name || '-'}</TableCell>
              <TableCell className="font-mono text-sm">{credential.login || '-'}</TableCell>
              <TableCell>
                {credential.password_encrypted ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {visiblePasswords.has(credential.id)
                        ? credential.password_encrypted
                        : '••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => togglePasswordVisibility(credential.id)}
                    >
                      {visiblePasswords.has(credential.id) ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {credential.url ? (
                  <a
                    href={credential.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Acessar <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(credential)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(credential)}
                    title="Excluir"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
