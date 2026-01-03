import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_CLIENT_ID = "de000000-0000-4000-a000-000000000001";
const DEMO_ACCOUNT_ID = "1234567890";

// Helper functions
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function getTimestampDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function generateUUID(): string {
  return crypto.randomUUID();
}

// Data generators
function generateMetaCampaigns() {
  const campaigns = [
    { name: "Campanha de Leads - Topo de Funil", objective: "LEAD_GENERATION" },
    { name: "Campanha de Conversão - Vendas", objective: "CONVERSIONS" },
    { name: "Remarketing - Carrinho Abandonado", objective: "CONVERSIONS" },
    { name: "Awareness - Branding", objective: "BRAND_AWARENESS" },
    { name: "Campanha de Mensagens - WhatsApp", objective: "MESSAGES" },
  ];

  const data = [];
  for (let day = 0; day < 30; day++) {
    for (let i = 0; i < campaigns.length; i++) {
      const spend = randomDecimal(50, 500);
      const impressions = randomBetween(5000, 50000);
      const reach = Math.floor(impressions * randomDecimal(0.6, 0.9));
      const results = randomBetween(5, 50);
      
      data.push({
        account_id: DEMO_ACCOUNT_ID,
        campaign_id: `campaign_${i + 1}`,
        campaign_name: campaigns[i].name,
        objective: campaigns[i].objective,
        status: "ACTIVE",
        effective_status: "ACTIVE",
        daily_budget: randomBetween(100, 1000),
        date_start: getDateDaysAgo(day),
        date_end: getDateDaysAgo(day),
        spend,
        reach,
        impressions,
        results,
        result_type: campaigns[i].objective === "LEAD_GENERATION" ? "lead" : "conversion",
        cost_per_result: parseFloat((spend / results).toFixed(2)),
        conversions: campaigns[i].objective === "CONVERSIONS" ? results : 0,
        leads: campaigns[i].objective === "LEAD_GENERATION" ? results : 0,
        messages: campaigns[i].objective === "MESSAGES" ? results : 0,
        created_time: getTimestampDaysAgo(60),
      });
    }
  }
  return data;
}

function generateMetaAdsets() {
  const adsets = [
    { name: "Público Lookalike 1%", optimization_goal: "CONVERSIONS" },
    { name: "Interesses - Marketing Digital", optimization_goal: "LEAD_GENERATION" },
    { name: "Remarketing 7 dias", optimization_goal: "CONVERSIONS" },
    { name: "Público Lookalike 3%", optimization_goal: "CONVERSIONS" },
    { name: "Interesses - Empreendedores", optimization_goal: "LEAD_GENERATION" },
    { name: "Remarketing 14 dias", optimization_goal: "CONVERSIONS" },
    { name: "Público Aberto - Vendas", optimization_goal: "CONVERSIONS" },
    { name: "Interesse - E-commerce", optimization_goal: "LEAD_GENERATION" },
    { name: "Custom Audience - Clientes", optimization_goal: "CONVERSIONS" },
    { name: "Lookalike Compradores", optimization_goal: "CONVERSIONS" },
    { name: "Interesse - Tecnologia", optimization_goal: "LEAD_GENERATION" },
    { name: "Remarketing 30 dias", optimization_goal: "CONVERSIONS" },
    { name: "Público Frio - Awareness", optimization_goal: "BRAND_AWARENESS" },
    { name: "Engajamento - Stories", optimization_goal: "MESSAGES" },
    { name: "Conversão - WhatsApp", optimization_goal: "MESSAGES" },
  ];

  const data = [];
  for (let day = 0; day < 30; day++) {
    for (let i = 0; i < adsets.length; i++) {
      const spend = randomDecimal(20, 200);
      const impressions = randomBetween(2000, 20000);
      const reach = Math.floor(impressions * randomDecimal(0.6, 0.9));
      const results = randomBetween(2, 25);
      
      data.push({
        account_id: DEMO_ACCOUNT_ID,
        campaign_id: `campaign_${(i % 5) + 1}`,
        adset_id: `adset_${i + 1}`,
        adset_name: adsets[i].name,
        optimization_goal: adsets[i].optimization_goal,
        status: "ACTIVE",
        effective_status: "ACTIVE",
        billing_event: "IMPRESSIONS",
        daily_budget: randomBetween(50, 500),
        date_start: getDateDaysAgo(day),
        date_end: getDateDaysAgo(day),
        spend,
        reach,
        impressions,
        results,
        result_type: adsets[i].optimization_goal === "LEAD_GENERATION" ? "lead" : "conversion",
        cost_per_result: parseFloat((spend / Math.max(results, 1)).toFixed(2)),
        conversions: results,
        leads: adsets[i].optimization_goal === "LEAD_GENERATION" ? results : 0,
        messages: adsets[i].optimization_goal === "MESSAGES" ? results : 0,
        created_time: getTimestampDaysAgo(45),
      });
    }
  }
  return data;
}

function generateMetaAds() {
  const ads = [
    { name: "Criativo Video - Depoimento Cliente", creative_type: "VIDEO" },
    { name: "Carousel Produtos Principais", creative_type: "CAROUSEL" },
    { name: "Imagem Estática - Oferta Especial", creative_type: "IMAGE" },
    { name: "Video Tutorial - Como Usar", creative_type: "VIDEO" },
    { name: "Carousel - Cases de Sucesso", creative_type: "CAROUSEL" },
    { name: "Imagem - Black Friday", creative_type: "IMAGE" },
    { name: "Video - Apresentação Empresa", creative_type: "VIDEO" },
    { name: "Carousel - Benefícios", creative_type: "CAROUSEL" },
    { name: "Imagem - Promoção Limitada", creative_type: "IMAGE" },
    { name: "Video - Unboxing Produto", creative_type: "VIDEO" },
    { name: "Carousel - Antes e Depois", creative_type: "CAROUSEL" },
    { name: "Imagem - Frete Grátis", creative_type: "IMAGE" },
    { name: "Video - Review Cliente", creative_type: "VIDEO" },
    { name: "Carousel - Top 5 Produtos", creative_type: "CAROUSEL" },
    { name: "Imagem - Desconto Primeira Compra", creative_type: "IMAGE" },
    { name: "Video Curto - Stories", creative_type: "VIDEO" },
    { name: "Carousel - Novidades", creative_type: "CAROUSEL" },
    { name: "Imagem - Garantia Satisfação", creative_type: "IMAGE" },
    { name: "Video - Behind the Scenes", creative_type: "VIDEO" },
    { name: "Carousel - Comparativo", creative_type: "CAROUSEL" },
    { name: "Imagem - Lançamento", creative_type: "IMAGE" },
    { name: "Video - FAQ Animado", creative_type: "VIDEO" },
    { name: "Carousel - Kits Especiais", creative_type: "CAROUSEL" },
    { name: "Imagem - Cupom Desconto", creative_type: "IMAGE" },
    { name: "Video - Processo Produção", creative_type: "VIDEO" },
    { name: "Carousel - Depoimentos", creative_type: "CAROUSEL" },
    { name: "Imagem - Última Chance", creative_type: "IMAGE" },
    { name: "Video - Parceria Influencer", creative_type: "VIDEO" },
    { name: "Carousel - Mix Produtos", creative_type: "CAROUSEL" },
    { name: "Imagem - Oferta Relâmpago", creative_type: "IMAGE" },
  ];

  const data = [];
  for (let day = 0; day < 30; day++) {
    for (let i = 0; i < ads.length; i++) {
      const spend = randomDecimal(10, 100);
      const impressions = randomBetween(1000, 10000);
      const reach = Math.floor(impressions * randomDecimal(0.6, 0.9));
      const results = randomBetween(1, 15);
      
      data.push({
        account_id: DEMO_ACCOUNT_ID,
        campaign_id: `campaign_${(i % 5) + 1}`,
        adset_id: `adset_${(i % 15) + 1}`,
        ad_id: `ad_${i + 1}`,
        ad_name: ads[i].name,
        status: "ACTIVE",
        effective_status: "ACTIVE",
        date_start: getDateDaysAgo(day),
        date_end: getDateDaysAgo(day),
        spend,
        reach,
        impressions,
        results,
        result_type: "conversion",
        cost_per_result: parseFloat((spend / Math.max(results, 1)).toFixed(2)),
        conversions: results,
        leads: randomBetween(0, 5),
        messages: randomBetween(0, 3),
        created_time: getTimestampDaysAgo(30),
        image_url: `https://picsum.photos/seed/${i}/400/400`,
        thumbnail_url: `https://picsum.photos/seed/${i}/200/200`,
      });
    }
  }
  return data;
}

function generateMetaCampaignBreakdowns() {
  const campaigns = [
    "Campanha de Leads - Topo de Funil",
    "Campanha de Conversão - Vendas",
    "Remarketing - Carrinho Abandonado",
    "Awareness - Branding",
    "Campanha de Mensagens - WhatsApp",
  ];
  
  const ages = ["18-24", "25-34", "35-44", "45-54", "55-64"];
  const genders = ["male", "female"];
  const platforms = ["facebook", "instagram"];
  const regions = ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Paraná", "Bahia"];

  const data = [];
  
  for (let day = 0; day < 30; day++) {
    for (let i = 0; i < campaigns.length; i++) {
      // Age breakdowns
      for (const age of ages) {
        const spend = randomDecimal(10, 100);
        const impressions = randomBetween(1000, 10000);
        const results = randomBetween(1, 15);
        
        data.push({
          account_id: DEMO_ACCOUNT_ID,
          campaign_id: `campaign_${i + 1}`,
          campaign_name: campaigns[i],
          date_start: getDateDaysAgo(day),
          date_end: getDateDaysAgo(day),
          age,
          gender: "",
          publisher_platform: "",
          platform_position: "",
          region: "",
          spend,
          reach: Math.floor(impressions * 0.7),
          impressions,
          results,
          cost_per_result: parseFloat((spend / Math.max(results, 1)).toFixed(2)),
          conversions: results,
        });
      }
      
      // Gender breakdowns
      for (const gender of genders) {
        const spend = randomDecimal(20, 200);
        const impressions = randomBetween(2000, 20000);
        const results = randomBetween(2, 25);
        
        data.push({
          account_id: DEMO_ACCOUNT_ID,
          campaign_id: `campaign_${i + 1}`,
          campaign_name: campaigns[i],
          date_start: getDateDaysAgo(day),
          date_end: getDateDaysAgo(day),
          age: "",
          gender,
          publisher_platform: "",
          platform_position: "",
          region: "",
          spend,
          reach: Math.floor(impressions * 0.7),
          impressions,
          results,
          cost_per_result: parseFloat((spend / Math.max(results, 1)).toFixed(2)),
          conversions: results,
        });
      }
      
      // Platform breakdowns
      for (const platform of platforms) {
        const spend = randomDecimal(25, 250);
        const impressions = randomBetween(2500, 25000);
        const results = randomBetween(2, 25);
        
        data.push({
          account_id: DEMO_ACCOUNT_ID,
          campaign_id: `campaign_${i + 1}`,
          campaign_name: campaigns[i],
          date_start: getDateDaysAgo(day),
          date_end: getDateDaysAgo(day),
          age: "",
          gender: "",
          publisher_platform: platform,
          platform_position: platform === "facebook" ? "feed" : "feed,story",
          region: "",
          spend,
          reach: Math.floor(impressions * 0.7),
          impressions,
          results,
          cost_per_result: parseFloat((spend / Math.max(results, 1)).toFixed(2)),
          conversions: results,
        });
      }
      
      // Region breakdowns
      for (const region of regions) {
        const spend = randomDecimal(10, 100);
        const impressions = randomBetween(1000, 10000);
        const results = randomBetween(1, 10);
        
        data.push({
          account_id: DEMO_ACCOUNT_ID,
          campaign_id: `campaign_${i + 1}`,
          campaign_name: campaigns[i],
          date_start: getDateDaysAgo(day),
          date_end: getDateDaysAgo(day),
          age: "",
          gender: "",
          publisher_platform: "",
          platform_position: "",
          region,
          spend,
          reach: Math.floor(impressions * 0.7),
          impressions,
          results,
          cost_per_result: parseFloat((spend / Math.max(results, 1)).toFixed(2)),
          conversions: results,
        });
      }
    }
  }
  
  return data;
}

function generateGoogleAdsMetrics() {
  const campaigns = [
    "Pesquisa - Institucional",
    "Pesquisa - Produtos",
    "Display - Remarketing",
    "Performance Max - Vendas",
    "YouTube - Awareness",
  ];

  const data = [];
  for (let day = 0; day < 30; day++) {
    for (const campaign of campaigns) {
      const cost = randomDecimal(30, 300);
      const impressions = randomBetween(3000, 30000);
      const clicks = randomBetween(100, 1000);
      const conversions = randomBetween(2, 30);
      
      data.push({
        client_id: DEMO_CLIENT_ID,
        date: getDateDaysAgo(day),
        source: "google_ads",
        campaign_name: campaign,
        adset_name: `Grupo ${campaign.split(" - ")[0]}`,
        ad_name: `Anúncio ${randomBetween(1, 5)}`,
        status: "ENABLED",
        cost,
        impressions,
        clicks,
        conversions,
        leads: campaign.includes("Institucional") ? randomBetween(1, 10) : 0,
        reach: Math.floor(impressions * 0.8),
        results: conversions,
        result_type: "conversion",
        revenue: conversions * randomDecimal(50, 200),
      });
    }
  }
  return data;
}

function generateGoogleKeywords() {
  const keywords = [
    { keyword: "comprar produto online", match_type: "EXACT" },
    { keyword: "melhor preço produto", match_type: "PHRASE" },
    { keyword: "empresa serviços", match_type: "BROAD" },
    { keyword: "loja virtual confiável", match_type: "EXACT" },
    { keyword: "produto qualidade premium", match_type: "PHRASE" },
    { keyword: "oferta especial", match_type: "BROAD" },
    { keyword: "desconto produtos", match_type: "EXACT" },
    { keyword: "entrega rápida", match_type: "PHRASE" },
    { keyword: "frete grátis", match_type: "BROAD" },
    { keyword: "promoção limitada", match_type: "EXACT" },
  ];

  const data = [];
  for (let day = 0; day < 30; day++) {
    for (const kw of keywords) {
      const cost = randomDecimal(5, 50);
      const impressions = randomBetween(500, 5000);
      const clicks = randomBetween(20, 200);
      
      data.push({
        client_id: DEMO_CLIENT_ID,
        date: getDateDaysAgo(day),
        keyword: kw.keyword,
        campaign_name: "Pesquisa - Produtos",
        match_type: kw.match_type,
        status: "active",
        impressions,
        clicks,
        cost,
        conversions: randomBetween(0, 10),
        quality_score: randomBetween(5, 10),
      });
    }
  }
  return data;
}

function generateRdStationLeads() {
  const firstNames = ["João", "Maria", "Pedro", "Ana", "Carlos", "Julia", "Rafael", "Fernanda", "Lucas", "Beatriz"];
  const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Lima", "Carvalho", "Ferreira", "Rodrigues"];
  const companies = ["Tech Solutions", "Inovação Digital", "StartupXYZ", "Empresa ABC", "Consultoria Premium", "Agência Digital", "E-commerce Pro", "Marketing 360", "Software House", "Growth Hacker"];
  const sources = ["google", "facebook", "instagram", "organic", "referral", "email"];
  const campaigns = ["Campanha Leads Frio", "Ebook Marketing Digital", "Webinar Vendas", "Landing Page Produtos", "Black Friday 2024"];
  const stages = ["Lead", "Lead Qualificado", "Oportunidade", "Cliente"];
  const cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Salvador", "Fortaleza", "Brasília"];
  const states = ["SP", "RJ", "MG", "PR", "RS", "BA", "CE", "DF"];

  const data = [];
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[randomBetween(0, firstNames.length - 1)];
    const lastName = lastNames[randomBetween(0, lastNames.length - 1)];
    const company = companies[randomBetween(0, companies.length - 1)];
    const cityIndex = randomBetween(0, cities.length - 1);
    const daysAgo = randomBetween(0, 60);
    
    data.push({
      client_id: DEMO_CLIENT_ID,
      rd_lead_id: `lead_${Date.now()}_${i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomBetween(1, 999)}@email.com`,
      phone: `(${randomBetween(11, 99)}) 9${randomBetween(1000, 9999)}-${randomBetween(1000, 9999)}`,
      company,
      job_title: ["Gerente", "Diretor", "Analista", "Coordenador", "CEO"][randomBetween(0, 4)],
      city: cities[cityIndex],
      state: states[cityIndex],
      country: "Brasil",
      conversion_source: sources[randomBetween(0, sources.length - 1)],
      conversion_medium: ["cpc", "organic", "social", "referral"][randomBetween(0, 3)],
      conversion_campaign: campaigns[randomBetween(0, campaigns.length - 1)],
      first_conversion_event: ["Formulário Contato", "Download Ebook", "Inscrição Webinar", "Solicitação Demo"][randomBetween(0, 3)],
      lifecycle_stage: stages[randomBetween(0, stages.length - 1)],
      lead_scoring: randomBetween(10, 100),
      rd_created_at: getTimestampDaysAgo(daysAgo),
      rd_updated_at: getTimestampDaysAgo(randomBetween(0, daysAgo)),
    });
  }
  return data;
}

function generateCrmMetrics() {
  const data = [];
  for (let day = 0; day < 30; day++) {
    const leads = randomBetween(5, 20);
    const opportunities = Math.floor(leads * randomDecimal(0.3, 0.6));
    const sales = Math.floor(opportunities * randomDecimal(0.2, 0.5));
    const revenue = sales * randomBetween(1000, 10000);
    
    data.push({
      client_id: DEMO_CLIENT_ID,
      date: getDateDaysAgo(day),
      source: "crm",
      leads,
      opportunities,
      sales,
      revenue,
    });
  }
  return data;
}

function generateDmCrmDeals() {
  const dealNames = [
    "Projeto Website Corporativo",
    "Consultoria Estratégica",
    "Implementação Sistema ERP",
    "Campanha Marketing Digital",
    "Desenvolvimento App Mobile",
  ];

  const stages = [
    { id: 1, name: "Novo", status: "open" },
    { id: 2, name: "Qualificação", status: "open" },
    { id: 3, name: "Proposta", status: "open" },
    { id: 4, name: "Negociação", status: "open" },
    { id: 5, name: "Ganho", status: "won" },
    { id: 6, name: "Perdido", status: "lost" },
  ];

  const origins = ["Inbound", "Outbound", "Indicação", "Parceiro", "Evento"];
  const lossReasons = ["Preço", "Concorrência", "Timing", "Sem orçamento", "Mudança de prioridade"];

  const data = [];
  for (let i = 0; i < dealNames.length; i++) {
    const stageIndex = randomBetween(0, stages.length - 1);
    const stage = stages[stageIndex];
    const daysAgo = randomBetween(1, 45);
    const price = randomBetween(1000, 50000);
    
    data.push({
      client_id: DEMO_CLIENT_ID,
      deal_id: i + 1,
      deal_name: dealNames[i],
      pipeline_id: 1,
      pipeline_name: "Pipeline Principal",
      stage_id: stage.id,
      stage_name: stage.name,
      status: stage.status,
      price,
      date_created: getDateDaysAgo(daysAgo),
      date_closed: stage.status !== "open" ? getDateDaysAgo(randomBetween(0, daysAgo - 1)) : null,
      responsible_id: randomBetween(1, 3),
      lost_reason_id: stage.status === "lost" ? randomBetween(1, 5) : null,
      lost_reason_name: stage.status === "lost" ? lossReasons[randomBetween(0, lossReasons.length - 1)] : null,
      origin: origins[randomBetween(0, origins.length - 1)],
      source: "rdstation",
      contacts_created_same_day: randomBetween(0, 2),
    });
  }
  return data;
}

function generateCrmFunnelStages(funnelId: string) {
  return [
    { client_id: DEMO_CLIENT_ID, funnel_id: funnelId, name: "Novo", order: 0, color: "#3B82F6", is_won: false, is_lost: false },
    { client_id: DEMO_CLIENT_ID, funnel_id: funnelId, name: "Qualificação", order: 1, color: "#8B5CF6", is_won: false, is_lost: false },
    { client_id: DEMO_CLIENT_ID, funnel_id: funnelId, name: "Proposta", order: 2, color: "#F59E0B", is_won: false, is_lost: false },
    { client_id: DEMO_CLIENT_ID, funnel_id: funnelId, name: "Negociação", order: 3, color: "#10B981", is_won: false, is_lost: false },
    { client_id: DEMO_CLIENT_ID, funnel_id: funnelId, name: "Ganho", order: 4, color: "#22C55E", is_won: true, is_lost: false },
    { client_id: DEMO_CLIENT_ID, funnel_id: funnelId, name: "Perdido", order: 5, color: "#EF4444", is_won: false, is_lost: true },
  ];
}

function generateCrmLossReasons() {
  return [
    { client_id: DEMO_CLIENT_ID, name: "Preço acima do mercado", description: "Cliente considerou o valor muito alto", is_active: true },
    { client_id: DEMO_CLIENT_ID, name: "Escolheu concorrente", description: "Optou por outra empresa", is_active: true },
    { client_id: DEMO_CLIENT_ID, name: "Sem orçamento", description: "Cliente sem verba disponível", is_active: true },
    { client_id: DEMO_CLIENT_ID, name: "Projeto cancelado", description: "Projeto foi descontinuado internamente", is_active: true },
    { client_id: DEMO_CLIENT_ID, name: "Timing inadequado", description: "Momento não é adequado para o cliente", is_active: true },
  ];
}

function generateCrmProducts() {
  return [
    { client_id: DEMO_CLIENT_ID, code: "PROD001", name: "Consultoria Estratégica", description: "Análise e planejamento estratégico", unit_price: 5000, category: "Consultoria", is_active: true },
    { client_id: DEMO_CLIENT_ID, code: "PROD002", name: "Desenvolvimento Web", description: "Criação de sites e sistemas web", unit_price: 15000, category: "Desenvolvimento", is_active: true },
    { client_id: DEMO_CLIENT_ID, code: "PROD003", name: "Marketing Digital", description: "Gestão completa de marketing digital", unit_price: 3000, category: "Marketing", is_active: true },
    { client_id: DEMO_CLIENT_ID, code: "PROD004", name: "Suporte Mensal", description: "Suporte técnico mensal", unit_price: 1500, category: "Suporte", is_active: true },
    { client_id: DEMO_CLIENT_ID, code: "PROD005", name: "Treinamento", description: "Capacitação de equipes", unit_price: 2500, category: "Educação", is_active: true },
  ];
}

function generateCrmCompanies() {
  return [
    { client_id: DEMO_CLIENT_ID, name: "TechCorp Brasil", industry: "Tecnologia", email: "contato@techcorp.com.br", phone: "(11) 3456-7890", city: "São Paulo", state: "SP", cnpj: "12.345.678/0001-90" },
    { client_id: DEMO_CLIENT_ID, name: "Inovação Digital Ltda", industry: "Marketing", email: "comercial@inovacaodigital.com", phone: "(21) 2345-6789", city: "Rio de Janeiro", state: "RJ", cnpj: "23.456.789/0001-01" },
    { client_id: DEMO_CLIENT_ID, name: "Consultoria Premier", industry: "Consultoria", email: "info@premier.com.br", phone: "(31) 3456-7891", city: "Belo Horizonte", state: "MG", cnpj: "34.567.890/0001-12" },
    { client_id: DEMO_CLIENT_ID, name: "E-commerce Solutions", industry: "E-commerce", email: "vendas@ecommerce.com", phone: "(41) 4567-8901", city: "Curitiba", state: "PR", cnpj: "45.678.901/0001-23" },
    { client_id: DEMO_CLIENT_ID, name: "StartUp XYZ", industry: "SaaS", email: "hello@startupxyz.io", phone: "(51) 5678-9012", city: "Porto Alegre", state: "RS", cnpj: "56.789.012/0001-34" },
    { client_id: DEMO_CLIENT_ID, name: "Agência Criativa", industry: "Publicidade", email: "contato@agenciacriativa.com", phone: "(71) 6789-0123", city: "Salvador", state: "BA", cnpj: "67.890.123/0001-45" },
    { client_id: DEMO_CLIENT_ID, name: "Indústria Nacional SA", industry: "Manufatura", email: "comercial@industrianacional.com.br", phone: "(85) 7890-1234", city: "Fortaleza", state: "CE", cnpj: "78.901.234/0001-56" },
    { client_id: DEMO_CLIENT_ID, name: "Logística Express", industry: "Logística", email: "operacoes@logexp.com.br", phone: "(61) 8901-2345", city: "Brasília", state: "DF", cnpj: "89.012.345/0001-67" },
  ];
}

function generateCrmContacts(companyIds: string[]) {
  const contacts = [
    { name: "Carlos Silva", position: "CEO", email: "carlos@techcorp.com.br", phone: "(11) 99999-0001" },
    { name: "Maria Santos", position: "Diretora Comercial", email: "maria@inovacaodigital.com", phone: "(21) 99999-0002" },
    { name: "Pedro Oliveira", position: "Gerente de Projetos", email: "pedro@premier.com.br", phone: "(31) 99999-0003" },
    { name: "Ana Costa", position: "Head de Marketing", email: "ana@ecommerce.com", phone: "(41) 99999-0004" },
    { name: "Rafael Lima", position: "CTO", email: "rafael@startupxyz.io", phone: "(51) 99999-0005" },
    { name: "Julia Ferreira", position: "Diretora Criativa", email: "julia@agenciacriativa.com", phone: "(71) 99999-0006" },
    { name: "Lucas Pereira", position: "Gerente Industrial", email: "lucas@industrianacional.com.br", phone: "(85) 99999-0007" },
    { name: "Beatriz Souza", position: "Coordenadora de Operações", email: "beatriz@logexp.com.br", phone: "(61) 99999-0008" },
    { name: "Fernando Rocha", position: "Analista de TI", email: "fernando@techcorp.com.br", phone: "(11) 99999-0009" },
    { name: "Camila Dias", position: "Executiva de Contas", email: "camila@inovacaodigital.com", phone: "(21) 99999-0010" },
  ];

  return contacts.map((c, i) => ({
    client_id: DEMO_CLIENT_ID,
    company_id: companyIds[i % companyIds.length],
    name: c.name,
    position: c.position,
    email: c.email,
    phone: c.phone,
    mobile_phone: c.phone.replace("9999", "8888"),
  }));
}

function generateCrmSellers() {
  return [
    { id: generateUUID(), client_id: DEMO_CLIENT_ID, name: "João Vendedor", email: "joao@demo.com", phone: "(11) 99999-1111", is_active: true },
    { id: generateUUID(), client_id: DEMO_CLIENT_ID, name: "Maria Comercial", email: "maria.comercial@demo.com", phone: "(11) 99999-2222", is_active: true },
    { id: generateUUID(), client_id: DEMO_CLIENT_ID, name: "Pedro Closer", email: "pedro.closer@demo.com", phone: "(11) 99999-3333", is_active: true },
  ];
}

function generateCrmFunnels() {
  return [
    { client_id: DEMO_CLIENT_ID, name: "Pipeline Principal", description: "Funil de vendas principal", is_default: true },
    { client_id: DEMO_CLIENT_ID, name: "Upsell Clientes", description: "Vendas adicionais para clientes existentes", is_default: false },
  ];
}

function generateCrmDeals(stageIds: string[], contactIds: string[], sellerIds: string[]) {
  const dealNames = [
    "Projeto Website Corporativo",
    "Consultoria Estratégica",
    "Implementação Sistema ERP",
    "Campanha Marketing Digital",
    "Desenvolvimento App Mobile",
    "Automação de Processos",
    "Redesign UX/UI",
    "Migração Cloud",
    "Análise de Dados BI",
    "Treinamento Equipe",
    "Suporte Premium Anual",
    "Integração APIs",
    "SEO e Performance",
    "Gestão de Tráfego",
    "Produção de Conteúdo",
    "Sistema de Vendas",
    "Aplicativo E-commerce",
    "Plataforma SaaS",
    "Dashboard Analytics",
    "Chatbot IA",
  ];

  const sources = ["Inbound", "Outbound", "Indicação", "Parceiro", "Evento", "Google Ads", "Facebook Ads", "LinkedIn"];
  const lossReasons = ["Preço acima do mercado", "Escolheu concorrente", "Sem orçamento", "Projeto cancelado", "Timing inadequado"];

  // Distribute deals across stages (excluding won/lost for most)
  const openStages = stageIds.slice(0, 4); // Novo, Qualificação, Proposta, Negociação
  const wonStage = stageIds[4]; // Ganho
  const lostStage = stageIds[5]; // Perdido

  const deals = [];
  for (let i = 0; i < dealNames.length; i++) {
    const daysAgo = randomBetween(1, 45);
    const value = randomBetween(2000, 50000);
    
    let stageId: string;
    let status = "open";
    let closedAt = null;
    let lostReason = null;
    
    if (i < 12) {
      // 12 deals in open stages
      stageId = openStages[i % openStages.length];
    } else if (i < 16) {
      // 4 deals won
      stageId = wonStage;
      status = "won";
      closedAt = getTimestampDaysAgo(randomBetween(1, 10));
    } else {
      // 4 deals lost
      stageId = lostStage;
      status = "lost";
      closedAt = getTimestampDaysAgo(randomBetween(1, 10));
      lostReason = lossReasons[randomBetween(0, lossReasons.length - 1)];
    }

    deals.push({
      client_id: DEMO_CLIENT_ID,
      name: dealNames[i],
      value,
      probability: randomBetween(10, 90),
      stage_id: stageId,
      contact_id: contactIds[i % contactIds.length],
      assigned_to_id: null, // Can't link to sellers without profiles in tryvia_analytics_profiles
      source: sources[randomBetween(0, sources.length - 1)],
      status,
      closed_at: closedAt,
      lost_reason: lostReason,
      expected_close_date: getDateDaysAgo(-randomBetween(5, 30)), // Future date
    });
  }
  return deals;
}

function generateCrmTasks(dealIds: string[]) {
  const taskTypes = [
    "Ligação de follow-up",
    "Reunião de apresentação",
    "Enviar proposta comercial",
    "Agendar demonstração",
    "Responder dúvidas técnicas",
    "Negociar condições",
    "Preparar contrato",
    "Reunião de alinhamento",
    "Enviar case de sucesso",
    "Confirmar dados cadastrais",
  ];

  const tasks = [];
  for (const dealId of dealIds) {
    const numTasks = randomBetween(2, 4);
    for (let i = 0; i < numTasks; i++) {
      const daysFromNow = randomBetween(-5, 10);
      const completed = daysFromNow < 0 && Math.random() > 0.3;
      
      tasks.push({
        client_id: DEMO_CLIENT_ID,
        deal_id: dealId,
        title: taskTypes[randomBetween(0, taskTypes.length - 1)],
        description: `Tarefa relacionada ao negócio`,
        due_date: getTimestampDaysAgo(-daysFromNow),
        completed,
        completed_at: completed ? getTimestampDaysAgo(randomBetween(0, 3)) : null,
      });
    }
  }
  return tasks;
}

function generateDashboardSummary() {
  return {
    leads_rd_station: 150,
    funil_leads: 120,
    funil_oportunidades: 45,
    funil_vendas: 18,
    taxa_lead_to_checkout: 37.5,
    taxa_checkout_to_sale: 40.0,
    taxa_lead_to_sale: 15.0,
    eduzz_receita_bruta: 89500,
    eduzz_receita_liquida: 76075,
    eduzz_vendas: 18,
    eduzz_tentativas: 45,
    rd_period: "2024-11-23 - 2024-12-23",
    last_updated: new Date().toISOString(),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log("Starting demo data seeding...");

    // ============= CLEAR EXISTING DEMO DATA =============
    console.log("Clearing existing demo data...");
    
    // Clear dm_* tables
    await supabaseAdmin.from("dm_meta_campaigns").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("dm_meta_campaigns_breakdowns").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("dm_meta_ads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("dm_meta_adsets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("dm_google_ad_metrics").delete().neq("id", 0);
    await supabaseAdmin.from("dm_google_keywords").delete().neq("id", 0);
    await supabaseAdmin.from("dm_rdstation_leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("dm_crm_deals").delete().neq("id", 0);
    await supabaseAdmin.from("dm_crm_metrics").delete().neq("id", 0);
    await supabaseAdmin.from("dm_dashboard_summary").delete().neq("leads_rd_station", -1);

    // Clear crm_* tables for demo client (in correct order for FK constraints)
    await supabaseAdmin.from("crm_tasks").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_timeline_events").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_deal_products").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_deals").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_contacts").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_companies").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_funnel_stages").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_funnels").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_products").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_loss_reasons").delete().eq("client_id", DEMO_CLIENT_ID);
    await supabaseAdmin.from("crm_sellers").delete().eq("client_id", DEMO_CLIENT_ID);

    // ============= CREATE CRM DATA (crm_* tables) =============
    console.log("Seeding CRM data...");

    // 1. Create Funnels
    const funnelsData = generateCrmFunnels();
    const { data: funnels, error: funnelsError } = await supabaseAdmin
      .from("crm_funnels")
      .insert(funnelsData)
      .select("id");
    if (funnelsError) console.error("Funnels error:", funnelsError);
    const funnelId = funnels?.[0]?.id;
    console.log("Created funnels:", funnels?.length);

    // 2. Create Funnel Stages
    const stagesData = generateCrmFunnelStages(funnelId);
    const { data: stages, error: stagesError } = await supabaseAdmin
      .from("crm_funnel_stages")
      .insert(stagesData)
      .select("id, name, order")
      .order("order");
    if (stagesError) console.error("Stages error:", stagesError);
    const stageIds = stages?.map(s => s.id) || [];
    console.log("Created stages:", stages?.length, stageIds);

    // 3. Create Loss Reasons
    const { error: lossReasonsError } = await supabaseAdmin
      .from("crm_loss_reasons")
      .insert(generateCrmLossReasons());
    if (lossReasonsError) console.error("Loss reasons error:", lossReasonsError);

    // 4. Create Products
    const { error: productsError } = await supabaseAdmin
      .from("crm_products")
      .insert(generateCrmProducts());
    if (productsError) console.error("Products error:", productsError);

    // 5. Create Companies
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from("crm_companies")
      .insert(generateCrmCompanies())
      .select("id");
    if (companiesError) console.error("Companies error:", companiesError);
    const companyIds = companies?.map(c => c.id) || [];
    console.log("Created companies:", companies?.length);

    // 6. Create Contacts
    const contactsData = generateCrmContacts(companyIds);
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from("crm_contacts")
      .insert(contactsData)
      .select("id");
    if (contactsError) console.error("Contacts error:", contactsError);
    const contactIds = contacts?.map(c => c.id) || [];
    console.log("Created contacts:", contacts?.length);

    // 7. Create Sellers
    const sellersData = generateCrmSellers();
    const { data: sellers, error: sellersError } = await supabaseAdmin
      .from("crm_sellers")
      .insert(sellersData)
      .select("id");
    if (sellersError) console.error("Sellers error:", sellersError);
    const sellerIds = sellers?.map(s => s.id) || [];
    console.log("Created sellers:", sellers?.length);

    // 8. Create Deals
    const dealsData = generateCrmDeals(stageIds, contactIds, sellerIds);
    const { data: deals, error: dealsError } = await supabaseAdmin
      .from("crm_deals")
      .insert(dealsData)
      .select("id");
    if (dealsError) console.error("Deals error:", dealsError);
    const dealIds = deals?.map(d => d.id) || [];
    console.log("Created deals:", deals?.length);

    // 9. Create Tasks
    const tasksData = generateCrmTasks(dealIds);
    const { error: tasksError } = await supabaseAdmin
      .from("crm_tasks")
      .insert(tasksData);
    if (tasksError) console.error("Tasks error:", tasksError);
    console.log("Created tasks:", tasksData.length);

    // ============= CREATE MARKETING DATA (dm_* tables) =============
    console.log("Seeding Meta Ads campaigns...");
    const metaCampaigns = generateMetaCampaigns();
    const { error: metaCampaignsError } = await supabaseAdmin
      .from("dm_meta_campaigns")
      .insert(metaCampaigns);
    if (metaCampaignsError) console.error("Meta campaigns error:", metaCampaignsError);

    console.log("Seeding Meta Ads adsets...");
    const metaAdsets = generateMetaAdsets();
    for (let i = 0; i < metaAdsets.length; i += 500) {
      const batch = metaAdsets.slice(i, i + 500);
      const { error } = await supabaseAdmin.from("dm_meta_adsets").insert(batch);
      if (error) console.error(`Adsets batch ${i} error:`, error);
    }

    console.log("Seeding Meta Ads...");
    const metaAds = generateMetaAds();
    for (let i = 0; i < metaAds.length; i += 500) {
      const batch = metaAds.slice(i, i + 500);
      const { error } = await supabaseAdmin.from("dm_meta_ads").insert(batch);
      if (error) console.error(`Ads batch ${i} error:`, error);
    }

    console.log("Seeding Meta Ads breakdowns...");
    const metaBreakdowns = generateMetaCampaignBreakdowns();
    for (let i = 0; i < metaBreakdowns.length; i += 500) {
      const batch = metaBreakdowns.slice(i, i + 500);
      const { error } = await supabaseAdmin.from("dm_meta_campaigns_breakdowns").insert(batch);
      if (error) console.error(`Breakdowns batch ${i} error:`, error);
    }

    console.log("Seeding Google Ads metrics...");
    const googleMetrics = generateGoogleAdsMetrics();
    const { error: googleMetricsError } = await supabaseAdmin
      .from("dm_google_ad_metrics")
      .insert(googleMetrics);
    if (googleMetricsError) console.error("Google metrics error:", googleMetricsError);

    console.log("Seeding Google Keywords...");
    const googleKeywords = generateGoogleKeywords();
    const { error: googleKeywordsError } = await supabaseAdmin
      .from("dm_google_keywords")
      .insert(googleKeywords);
    if (googleKeywordsError) console.error("Google keywords error:", googleKeywordsError);

    console.log("Seeding RD Station leads...");
    const rdLeads = generateRdStationLeads();
    const { error: rdLeadsError } = await supabaseAdmin
      .from("dm_rdstation_leads")
      .insert(rdLeads);
    if (rdLeadsError) console.error("RD leads error:", rdLeadsError);

    console.log("Seeding dm_crm_deals...");
    const dmCrmDeals = generateDmCrmDeals();
    const { error: dmCrmDealsError } = await supabaseAdmin
      .from("dm_crm_deals")
      .insert(dmCrmDeals);
    if (dmCrmDealsError) console.error("dm_crm_deals error:", dmCrmDealsError);

    console.log("Seeding CRM metrics...");
    const crmMetrics = generateCrmMetrics();
    const { error: crmMetricsError } = await supabaseAdmin
      .from("dm_crm_metrics")
      .insert(crmMetrics);
    if (crmMetricsError) console.error("CRM metrics error:", crmMetricsError);

    console.log("Seeding dashboard summary...");
    const { error: summaryError } = await supabaseAdmin
      .from("dm_dashboard_summary")
      .insert(generateDashboardSummary());
    if (summaryError) console.error("Summary error:", summaryError);

    console.log("Demo data seeding completed!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo data seeded successfully",
        counts: {
          crm_funnels: funnels?.length || 0,
          crm_stages: stages?.length || 0,
          crm_companies: companies?.length || 0,
          crm_contacts: contacts?.length || 0,
          crm_sellers: sellers?.length || 0,
          crm_deals: deals?.length || 0,
          crm_tasks: tasksData.length,
          meta_campaigns: metaCampaigns.length,
          meta_adsets: metaAdsets.length,
          meta_ads: metaAds.length,
          meta_breakdowns: metaBreakdowns.length,
          google_metrics: googleMetrics.length,
          google_keywords: googleKeywords.length,
          rd_leads: rdLeads.length,
          dm_crm_deals: dmCrmDeals.length,
          crm_metrics: crmMetrics.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error seeding demo data:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
