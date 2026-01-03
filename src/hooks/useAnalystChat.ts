import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useAnalystChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou seu analista de marketing digital. Posso ajudar você a entender seus dados de performance, campanhas e métricas. O que gostaria de saber?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { clientId, user } = useAuth();

  const sessionId = useMemo(() => {
    const storageKey = `chat_session_${user?.id || 'anonymous'}`;
    let id = localStorage.getItem(storageKey);
    if (!id) {
      id = `${user?.id || 'anon'}_${Date.now()}`;
      localStorage.setItem(storageKey, id);
    }
    return id;
  }, [user?.id]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-analyst', {
        body: {
          message: text.trim(),
          session_id: sessionId,
          client_id: clientId,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data?.output || data?.response || data?.message || 'Desculpe, não consegui processar sua pergunta. Tente novamente.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, sessionId, isLoading]);

  const clearHistory = useCallback(() => {
    const storageKey = `chat_session_${user?.id || 'anonymous'}`;
    const newSessionId = `${user?.id || 'anon'}_${Date.now()}`;
    localStorage.setItem(storageKey, newSessionId);
    
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou seu analista de marketing digital. Posso ajudar você a entender seus dados de performance, campanhas e métricas. O que gostaria de saber?',
        timestamp: new Date(),
      },
    ]);
  }, [user?.id]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
  };
}
