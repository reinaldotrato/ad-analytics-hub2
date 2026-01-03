import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  sellerName: string;
  companyName: string;
  inviteLink: string;
  roleName: string;
}

function generateInviteEmailHtml(params: InviteEmailRequest): string {
  const { sellerName, companyName, inviteLink, roleName } = params;
  
  // URL da logo negativa hospedada publicamente
  const logoUrl = "https://oorsclbnzfujgxzxfruj.supabase.co/storage/v1/object/public/assets/Horizontal%20Negativa.png";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1E293B; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
          
          <!-- Logo -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <img src="${logoUrl}" alt="Tryvia" width="180" style="display: inline-block; max-width: 180px; height: auto;">
            </td>
          </tr>
          
          <!-- Ícone -->
          <tr>
            <td style="padding: 20px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); border-radius: 50%; display: inline-block; line-height: 80px; font-size: 36px;">
                🎉
              </div>
            </td>
          </tr>
          
          <!-- Título -->
          <tr>
            <td style="padding: 20px 30px 10px; text-align: center;">
              <h1 style="color: #F8FAFC; font-size: 28px; font-weight: bold; margin: 0;">
                Bem-vindo ao Time!
              </h1>
            </td>
          </tr>
          
          <!-- Saudação -->
          <tr>
            <td style="padding: 10px 30px; text-align: center;">
              <p style="color: #E2E8F0; font-size: 18px; line-height: 28px; margin: 0;">
                Olá, <strong style="color: #3B82F6;">${sellerName}</strong>! 👋
              </p>
            </td>
          </tr>
          
          <!-- Mensagem Principal -->
          <tr>
            <td style="padding: 10px 30px 20px; text-align: center;">
              <p style="color: #94A3B8; font-size: 16px; line-height: 26px; margin: 0;">
                Você foi convidado para fazer parte do time de vendas da <strong style="color: #E2E8F0;">${companyName}</strong> como <strong style="color: #3B82F6;">${roleName}</strong>.
              </p>
            </td>
          </tr>
          
          <!-- Features -->
          <tr>
            <td style="padding: 10px 30px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(59, 130, 246, 0.1); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #CBD5E1; font-size: 14px; margin: 0 0 12px; text-align: center;">Com o Tryvia CRM você terá acesso a:</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; color: #94A3B8; font-size: 14px;">📊 Dashboard de vendas e métricas</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94A3B8; font-size: 14px;">📋 Gestão de oportunidades e negócios</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94A3B8; font-size: 14px;">✅ Tarefas e atividades organizadas</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #94A3B8; font-size: 14px;">📈 Acompanhamento de metas</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Botão CTA -->
          <tr>
            <td style="padding: 10px 30px 30px; text-align: center;">
              <a href="${inviteLink}" style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 16px 48px; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);">
                Aceitar Convite e Criar Senha
              </a>
            </td>
          </tr>
          
          <!-- Link alternativo -->
          <tr>
            <td style="padding: 0 30px 20px; text-align: center;">
              <p style="color: #64748B; font-size: 13px; margin: 0 0 8px;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="color: #3B82F6; font-size: 12px; word-break: break-all; margin: 0; background-color: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2);">
                ${inviteLink}
              </p>
            </td>
          </tr>
          
          <!-- Aviso de Expiração -->
          <tr>
            <td style="padding: 0 30px 20px; text-align: center;">
              <div style="background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 8px; padding: 12px 20px; display: inline-block;">
                <p style="color: #FB923C; font-size: 14px; margin: 0;">
                  ⏱️ Este link expira em 24 horas
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Disclaimer -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #475569; font-size: 13px; margin: 0;">
                Se você não esperava este convite, pode ignorar este email com segurança.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; padding: 24px 30px; text-align: center; border-top: 1px solid #334155;">
              <p style="color: #64748B; font-size: 13px; margin: 0;">
                © 2025 <strong style="color: #94A3B8;">Tryvia</strong> • Marketing e Tecnologia
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, sellerName, companyName, inviteLink, roleName }: InviteEmailRequest = await req.json();

    console.log(`Sending invite email to ${email} for ${sellerName}`);

    // Generate HTML email
    const html = generateInviteEmailHtml({ email, sellerName, companyName, inviteLink, roleName });

    const { error: emailError } = await resend.emails.send({
      from: "Tryvia CRM <onboarding@tryv.ia.br>",
      to: [email],
      subject: `🎉 Você foi convidado para o time de vendas - ${companyName}`,
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(
        JSON.stringify({ error: emailError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
