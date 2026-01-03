import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  path: string;
}

export function useGlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching } = useQuery<SearchResult[]>({
    queryKey: ['global-search', debouncedTerm, effectiveClientId],
    queryFn: async () => {
      if (!debouncedTerm || !effectiveClientId) return [];
      
      const { data, error } = await supabase.rpc('global_search', {
        search_term: debouncedTerm,
        client_id_param: effectiveClientId,
      });
      
      if (error) throw error;
      return data as SearchResult[];
    },
    enabled: debouncedTerm.length > 2 && !!effectiveClientId,
  });

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedTerm('');
  };

  return { 
    searchTerm, 
    setSearchTerm, 
    results: data ?? [], 
    isLoading: isLoading || isFetching,
    clearSearch,
  };
}
