-- Tabela para controle de notificações de metas enviadas
CREATE TABLE public.crm_goal_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.tryvia_analytics_clients(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.crm_sellers(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.crm_goals(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'daily_achieved', 'monthly_achieved', 'daily_summary', 'goal_warning', 'encouragement'
  email_to TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_crm_goal_notifications_client ON public.crm_goal_notifications(client_id);
CREATE INDEX idx_crm_goal_notifications_seller ON public.crm_goal_notifications(seller_id);
CREATE INDEX idx_crm_goal_notifications_type ON public.crm_goal_notifications(notification_type);
CREATE INDEX idx_crm_goal_notifications_sent ON public.crm_goal_notifications(sent_at);

-- Enable RLS
ALTER TABLE public.crm_goal_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view notifications of their client" 
ON public.crm_goal_notifications 
FOR SELECT 
USING (has_crm_client_access(auth.uid(), client_id));

CREATE POLICY "Service role can insert notifications" 
ON public.crm_goal_notifications 
FOR INSERT 
WITH CHECK (true);

-- Comentário na tabela
COMMENT ON TABLE public.crm_goal_notifications IS 'Controle de notificações de metas enviadas por e-mail';