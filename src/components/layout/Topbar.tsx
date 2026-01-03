import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LogOut, Moon, Sun, Building2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import { GlobalSearchCommand } from '@/components/GlobalSearchCommand';

interface Client {
  id: string;
  name: string;
}

export function Topbar() {
  const { user, role, signOut, selectedClientId, setSelectedClientId } = useAuth();
  const { theme, setTheme } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClientName, setCurrentClientName] = useState<string>('');

  // Fetch clients for admin dropdown
  useEffect(() => {
    const fetchClients = async () => {
      if (role === 'admin') {
        const { data } = await supabase
          .from('tryvia_analytics_clients')
          .select('id, name')
          .order('name');
        
        if (data) {
          setClients(data);
        }
      }
    };

    fetchClients();
  }, [role]);

  // Get current client name
  useEffect(() => {
    const fetchCurrentClient = async () => {
      if (selectedClientId) {
        const { data } = await supabase
          .from('tryvia_analytics_clients')
          .select('name')
          .eq('id', selectedClientId)
          .single();
        
        if (data) {
          setCurrentClientName(data.name);
        }
      }
    };

    fetchCurrentClient();
  }, [selectedClientId]);

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left side - Client selector or name */}
      <div className="flex items-center gap-4">
        {role === 'admin' ? (
          <Select value={selectedClientId || ''} onValueChange={handleClientChange}>
            <SelectTrigger className="w-[220px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{currentClientName || 'Carregando...'}</span>
          </div>
        )}
      </div>

      {/* Right side - Search, Theme, User */}
      <div className="flex items-center gap-4">
        <GlobalSearchCommand />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-0.5 leading-none">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
