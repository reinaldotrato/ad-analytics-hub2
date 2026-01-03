import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  client_id: string;
  seller_id?: string;
  notification_type: 'daily_achieved' | 'monthly_achieved' | 'goal_warning' | 'encouragement';
  seller_name: string;
  seller_email: string;
  goal_value: number;
  achieved_value: number;
  percentage: number;
}

const getEmailTemplate = (payload: NotificationPayload) => {
  const { notification_type, seller_name, goal_value, achieved_value, percentage } = payload;

  switch (notification_type) {
    case 'daily_achieved':
      return {
        subject: '🎯 Parabéns! Meta diária atingida!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; color: white;">
              <h1 style="margin: 0; font-size: 24px;">🎯 Meta Diária Batida!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="font-size: 18px; color: #374151;">Olá, <strong>${seller_name}</strong>!</p>
              <p style="color: #6b7280;">Parabéns por atingir sua meta do dia! Você vendeu:</p>
              <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 48px; font-weight: bold; color: #10b981;">${achieved_value}</div>
                <div style="color: #6b7280;">vendas (Meta: ${goal_value})</div>
                <div style="font-size: 24px; color: #10b981; margin-top: 10px;">${percentage.toFixed(0)}% atingido</div>
              </div>
              <p style="color: #6b7280;">Continue com esse ritmo incrível! 💪</p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                Este é um e-mail automático do seu CRM. Não responda.
              </p>
            </div>
          </div>
        `,
      };

    case 'monthly_achieved':
      return {
        subject: '🏆 INCRÍVEL! Meta mensal atingida!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🏆 META MENSAL BATIDA!</h1>
              <p style="font-size: 18px; margin-top: 10px;">Você é demais!</p>
            </div>
            <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="font-size: 18px; color: #374151;">Parabéns, <strong>${seller_name}</strong>!</p>
              <p style="color: #6b7280;">Você atingiu sua meta mensal de vendas! 🎉</p>
              <div style="text-align: center; padding: 25px; background: white; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
                <div style="font-size: 56px; font-weight: bold; color: #f59e0b;">${percentage.toFixed(0)}%</div>
                <div style="color: #6b7280; font-size: 18px;">da meta alcançada</div>
                <div style="color: #374151; margin-top: 15px;">
                  <strong>${achieved_value}</strong> vendas de ${goal_value}
                </div>
              </div>
              <p style="color: #6b7280; text-align: center;">
                Você merece uma celebração! 🎊<br>
                Continue brilhando no próximo mês!
              </p>
            </div>
          </div>
        `,
      };

    case 'goal_warning':
      return {
        subject: '⚠️ Atenção: Sua meta precisa de foco!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px; color: white;">
              <h1 style="margin: 0; font-size: 24px;">⚠️ Hora de Acelerar!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="font-size: 18px; color: #374151;">Olá, <strong>${seller_name}</strong>!</p>
              <p style="color: #6b7280;">
                Estamos na reta final do mês e sua meta ainda não foi atingida.
              </p>
              <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; border: 2px solid #ef4444;">
                <div style="font-size: 48px; font-weight: bold; color: #ef4444;">${percentage.toFixed(0)}%</div>
                <div style="color: #6b7280;">da meta atingida</div>
                <div style="color: #374151; margin-top: 10px;">
                  Faltam <strong>${goal_value - achieved_value}</strong> vendas
                </div>
              </div>
              <p style="color: #6b7280;">
                💪 <strong>Não desanime!</strong> Ainda dá tempo de virar o jogo!<br>
                Foque nos negócios mais quentes e vamos bater essa meta juntos!
              </p>
            </div>
          </div>
        `,
      };

    case 'encouragement':
      return {
        subject: '💪 Você consegue! Faltam poucos dias!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px; color: white;">
              <h1 style="margin: 0; font-size: 24px;">💪 Força Total!</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="font-size: 18px; color: #374151;">Olá, <strong>${seller_name}</strong>!</p>
              <p style="color: #6b7280;">
                Faltam poucos dias para o fim do mês. Você está em ${percentage.toFixed(0)}% da meta!
              </p>
              <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0;">
                <div style="color: #374151; font-size: 18px;">
                  Meta: <strong>${goal_value}</strong> vendas<br>
                  Realizado: <strong>${achieved_value}</strong> vendas<br>
                  Faltam: <strong>${goal_value - achieved_value}</strong> vendas
                </div>
              </div>
              <p style="color: #6b7280; text-align: center;">
                🚀 Acreditamos em você!<br>
                Cada ligação, cada follow-up conta. Vamos lá!
              </p>
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: 'Atualização de Meta - CRM',
        html: `<p>Mensagem de atualização de meta.</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: NotificationPayload = await req.json();
    
    console.log("Processing notification:", {
      type: payload.notification_type,
      seller: payload.seller_name,
      email: payload.seller_email,
    });

    // Verificar se já enviou notificação hoje (para evitar spam)
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('crm_goal_notifications')
      .select('id')
      .eq('client_id', payload.client_id)
      .eq('seller_id', payload.seller_id || null)
      .eq('notification_type', payload.notification_type)
      .gte('sent_at', today)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("Notification already sent today, skipping");
      return new Response(
        JSON.stringify({ message: "Notification already sent today" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar template de email
    const emailTemplate = getEmailTemplate(payload);

    // Enviar email
    const { error: emailError } = await resend.emails.send({
      from: "CRM Metas <onboarding@resend.dev>",
      to: [payload.seller_email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Email sent successfully to:", payload.seller_email);

    // Registrar notificação enviada
    const { error: insertError } = await supabase
      .from('crm_goal_notifications')
      .insert({
        client_id: payload.client_id,
        seller_id: payload.seller_id,
        notification_type: payload.notification_type,
        email_to: payload.seller_email,
        metadata: {
          goal_value: payload.goal_value,
          achieved_value: payload.achieved_value,
          percentage: payload.percentage,
        },
      });

    if (insertError) {
      console.error("Error logging notification:", insertError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-goal-notifications:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
