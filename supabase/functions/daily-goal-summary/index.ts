import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SellerProgress {
  seller_id: string;
  seller_name: string;
  seller_email: string;
  sales: number;
  value: number;
  goal: number;
  percentage: number;
}

const generateDailySummaryEmail = (
  sellerName: string,
  todaySales: number,
  monthSales: number,
  monthGoal: number,
  percentage: number,
  ranking: { name: string; percentage: number }[],
  daysRemaining: number
) => {
  const salesNeeded = Math.max(0, monthGoal - monthSales);
  const dailyNeeded = daysRemaining > 0 ? Math.ceil(salesNeeded / daysRemaining) : salesNeeded;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; color: white;">
        <h1 style="margin: 0; font-size: 22px;">📊 Resumo Diário de Vendas</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Bom dia, ${sellerName}!</p>
      </div>
      
      <div style="padding: 25px; background: #f9fafb; border-radius: 0 0 12px 12px;">
        <!-- Resumo do dia -->
        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Ontem você fez:</h3>
          <div style="text-align: center;">
            <div style="font-size: 48px; font-weight: bold; color: #3b82f6;">${todaySales}</div>
            <div style="color: #6b7280;">vendas</div>
          </div>
        </div>

        <!-- Progresso mensal -->
        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Progresso no mês:</h3>
          <div style="background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; width: ${Math.min(percentage, 100)}%; border-radius: 10px;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px;">
            <span style="color: #6b7280;">${monthSales} vendas</span>
            <span style="font-weight: bold; color: #3b82f6;">${percentage.toFixed(0)}%</span>
            <span style="color: #6b7280;">Meta: ${monthGoal}</span>
          </div>
        </div>

        <!-- Meta diária sugerida -->
        <div style="background: ${percentage >= 100 ? '#d1fae5' : '#fef3c7'}; border-radius: 8px; padding: 20px; margin-bottom: 15px; text-align: center;">
          ${percentage >= 100 
            ? `<div style="color: #059669; font-size: 18px;">🎉 <strong>Parabéns!</strong> Meta já atingida!</div>`
            : `<div style="color: #92400e;">
                <strong>Meta para os próximos ${daysRemaining} dias:</strong><br>
                <span style="font-size: 24px; font-weight: bold;">${dailyNeeded} vendas/dia</span>
              </div>`
          }
        </div>

        <!-- Ranking -->
        ${ranking.length > 0 ? `
          <div style="background: white; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #374151;">🏆 Ranking do mês:</h3>
            ${ranking.slice(0, 5).map((r, i) => `
              <div style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="width: 25px; font-weight: bold; color: ${i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#6b7280'};">
                  ${i + 1}º
                </span>
                <span style="flex: 1; color: #374151;">${r.name}</span>
                <span style="font-weight: bold; color: #3b82f6;">${r.percentage.toFixed(0)}%</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
          Este é um e-mail automático enviado todas as manhãs.
        </p>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar parâmetros (pode ser chamado para um client específico ou todos)
    const { client_id } = await req.json().catch(() => ({}));

    console.log("Processing daily summary for client:", client_id || "all");

    // Buscar metas ativas do mês atual
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const daysRemaining = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

    let goalsQuery = supabase
      .from('crm_goals')
      .select('*, crm_sellers!crm_goals_seller_id_fkey(id, name, email)')
      .gte('period_end', monthStart)
      .lte('period_start', monthEnd)
      .not('seller_id', 'is', null);

    if (client_id) {
      goalsQuery = goalsQuery.eq('client_id', client_id);
    }

    const { data: goals, error: goalsError } = await goalsQuery;

    if (goalsError) {
      console.error("Error fetching goals:", goalsError);
      throw goalsError;
    }

    if (!goals || goals.length === 0) {
      console.log("No seller goals found for this period");
      return new Response(
        JSON.stringify({ message: "No goals to process" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${goals.length} seller goals`);

    // Para cada meta, calcular progresso e enviar email
    const emailResults = [];

    for (const goal of goals) {
      const seller = goal.crm_sellers;
      if (!seller || !seller.email) continue;

      // Buscar stages ganhos
      const { data: wonStages } = await supabase
        .from('crm_funnel_stages')
        .select('id')
        .eq('client_id', goal.client_id)
        .eq('is_won', true);

      if (!wonStages || wonStages.length === 0) continue;

      const wonStageIds = wonStages.map(s => s.id);

      // Vendas de ontem (usando assigned_to_id = vendedor responsável)
      const { data: yesterdayDeals } = await supabase
        .from('crm_deals')
        .select('id, value')
        .eq('client_id', goal.client_id)
        .eq('assigned_to_id', seller.id)
        .in('stage_id', wonStageIds)
        .gte('closed_at', yesterday)
        .lt('closed_at', yesterday + 'T23:59:59');

      const todaySales = yesterdayDeals?.length || 0;

      // Vendas do mês (usando assigned_to_id = vendedor responsável)
      const { data: monthDeals } = await supabase
        .from('crm_deals')
        .select('id, value, assigned_to_id')
        .eq('client_id', goal.client_id)
        .in('stage_id', wonStageIds)
        .gte('closed_at', monthStart)
        .lte('closed_at', monthEnd + 'T23:59:59');

      const sellerMonthSales = monthDeals?.filter(d => d.assigned_to_id === seller.id).length || 0;
      const percentage = goal.sales_quantity_goal > 0 
        ? (sellerMonthSales / goal.sales_quantity_goal) * 100 
        : 0;

      // Ranking (simplificado) - usando assigned_to_id
      const sellerSalesMap = new Map<string, number>();
      monthDeals?.forEach(d => {
        if (d.assigned_to_id) {
          sellerSalesMap.set(d.assigned_to_id, (sellerSalesMap.get(d.assigned_to_id) || 0) + 1);
        }
      });

      // Buscar nomes dos vendedores para o ranking
      const sellerIds = Array.from(sellerSalesMap.keys());
      const { data: allSellers } = await supabase
        .from('crm_sellers')
        .select('id, name')
        .in('id', sellerIds);

      const ranking = Array.from(sellerSalesMap.entries())
        .map(([id, sales]) => {
          const sellerGoal = goals.find(g => g.seller_id === id);
          const sellerInfo = allSellers?.find(s => s.id === id);
          return {
            name: sellerInfo?.name || 'Vendedor',
            percentage: sellerGoal?.sales_quantity_goal 
              ? (sales / sellerGoal.sales_quantity_goal) * 100 
              : 0,
          };
        })
        .sort((a, b) => b.percentage - a.percentage);

      // Gerar e enviar email
      const emailHtml = generateDailySummaryEmail(
        seller.name,
        todaySales,
        sellerMonthSales,
        goal.sales_quantity_goal,
        percentage,
        ranking,
        daysRemaining
      );

      try {
        const { error: emailError } = await resend.emails.send({
          from: "CRM Vendas <onboarding@resend.dev>",
          to: [seller.email],
          subject: `📊 Resumo Diário - ${percentage.toFixed(0)}% da meta`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Error sending email to ${seller.email}:`, emailError);
          emailResults.push({ email: seller.email, success: false, error: emailError.message });
        } else {
          console.log(`Daily summary sent to ${seller.email}`);
          emailResults.push({ email: seller.email, success: true });

          // Registrar envio
          await supabase.from('crm_goal_notifications').insert({
            client_id: goal.client_id,
            seller_id: seller.id,
            goal_id: goal.id,
            notification_type: 'daily_summary',
            email_to: seller.email,
            metadata: { today_sales: todaySales, month_sales: sellerMonthSales, percentage },
          });
        }
      } catch (err) {
        console.error(`Error sending to ${seller.email}:`, err);
        emailResults.push({ email: seller.email, success: false, error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: goals.length,
        results: emailResults,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in daily-goal-summary:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
