import { supabase } from '@/integrations/supabase/client';
import { getClientTableName, getClientChannelTables } from './clientTableRegistry';

export interface MetaCampaignMetrics {
  campaignId: string;
  campaignName: string;
  objective: string | null;
  status: string | null;
  spend: number;
  reach: number;
  impressions: number;
  results: number;
  resultType: string | null;
  costPerResult: number | null;
  conversions: number;
  costPerConversion: number | null;
  leads: number;
  messages: number;
  pageViews: number;
}

export interface MetaAdMetrics {
  adId: string;
  adName: string | null;
  adsetName: string | null;
  campaignId: string;
  status: string | null;
  spend: number;
  reach: number;
  impressions: number;
  results: number;
  costPerResult: number | null;
  thumbnailUrl: string | null;
  pageViews: number;
  leads: number;
  messages: number;
}

export interface MetaPlatformPerformance {
  platform: string;
  position: string | null;
  spend: number;
  reach: number;
  impressions: number;
  results: number;
  avgCostPerResult: number | null;
  conversions: number;
}

export interface MetaDemographicPerformance {
  age: string;
  gender: string;
  spend: number;
  reach: number;
  impressions: number;
  results: number;
  conversions: number;
}

export interface MetaKpiTotals {
  totalSpend: number;
  totalReach: number;
  totalImpressions: number;
  totalResults: number;
  avgCostPerResult: number | null;
  totalLeads: number;
  totalMessages: number;
  totalPageViews: number;
  costPerLead: number | null;
  costPerMessage: number | null;
  costPerPageView: number | null;
}

export interface MetaDailyEvolution {
  date: string;
  spend: number;
  impressions: number;
  results: number;
  pageViews: number;
}

export interface MetaAgeBreakdown {
  age: string;
  spend: number;
  impressions: number;
  results: number;
  cpr: number;
}

export interface MetaGenderBreakdown {
  gender: string;
  genderLabel: string;
  spend: number;
  impressions: number;
  results: number;
  cpr: number;
}

export interface MetaRegionBreakdown {
  region: string;
  spend: number;
  impressions: number;
  results: number;
  cpr: number;
}

export interface MetaPlatformBreakdown {
  platform: string;
  platformLabel: string;
  spend: number;
  impressions: number;
  results: number;
  cpr: number;
}

export interface MetaPositionBreakdown {
  position: string;
  positionLabel: string;
  spend: number;
  impressions: number;
  results: number;
  cpr: number;
}

// Buscar campanhas agregadas usando tabela dinâmica
export async function getMetaCampaigns(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaCampaignMetrics[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns');
  if (!tableName) {
    console.warn('No Meta campaigns table found for client:', clientId);
    return [];
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select('campaign_id, campaign_name, objective, effective_status, status, spend, reach, impressions, results, result_type, conversions, leads, messages, page_views')
    .gte('date_start', startDate)
    .lte('date_end', endDate);

  if (error || !data) {
    console.error('Error fetching Meta campaigns:', error);
    return [];
  }

  // Aggregate by campaign_id
  const campaignMap = new Map<string, MetaCampaignMetrics>();

  (data as any[]).forEach((row) => {
    const existing = campaignMap.get(row.campaign_id);
    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.reach += Number(row.reach) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
      existing.conversions += Number(row.conversions) || 0;
      existing.leads += Number(row.leads) || 0;
      existing.messages += Number(row.messages) || 0;
      existing.pageViews += Number(row.page_views) || 0;
    } else {
      campaignMap.set(row.campaign_id, {
        campaignId: row.campaign_id,
        campaignName: row.campaign_name || 'Sem nome',
        objective: row.objective,
        status: row.effective_status || row.status,
        spend: Number(row.spend) || 0,
        reach: Number(row.reach) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        resultType: row.result_type,
        costPerResult: null,
        conversions: Number(row.conversions) || 0,
        costPerConversion: null,
        leads: Number(row.leads) || 0,
        messages: Number(row.messages) || 0,
        pageViews: Number(row.page_views) || 0,
      });
    }
  });

  return Array.from(campaignMap.values())
    .map((c) => ({
      ...c,
      costPerResult: c.results > 0 ? c.spend / c.results : null,
      costPerConversion: c.conversions > 0 ? c.spend / c.conversions : null,
    }))
    .sort((a, b) => b.spend - a.spend);
}

// Buscar top anúncios usando tabela dinâmica
export async function getMetaTopAds(
  clientId: string,
  startDate: string,
  endDate: string,
  limit = 10
): Promise<MetaAdMetrics[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'ads');
  if (!tableName) {
    console.warn('No Meta ads table found for client:', clientId);
    return [];
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select('ad_id, ad_name, campaign_id, effective_status, status, spend, reach, impressions, results, thumbnail_url, page_views, leads, messages')
    .gte('date_start', startDate)
    .lte('date_end', endDate);

  if (error || !data) {
    console.error('Error fetching Meta top ads:', error);
    return [];
  }

  // Aggregate by ad_id
  const adMap = new Map<string, MetaAdMetrics>();

  (data as any[]).forEach((row) => {
    const existing = adMap.get(row.ad_id);
    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.reach += Number(row.reach) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
      existing.pageViews += Number(row.page_views) || 0;
      existing.leads += Number(row.leads) || 0;
      existing.messages += Number(row.messages) || 0;
    } else {
      adMap.set(row.ad_id, {
        adId: row.ad_id,
        adName: row.ad_name,
        adsetName: null,
        campaignId: row.campaign_id,
        status: row.effective_status || row.status,
        spend: Number(row.spend) || 0,
        reach: Number(row.reach) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        costPerResult: null,
        thumbnailUrl: row.thumbnail_url,
        pageViews: Number(row.page_views) || 0,
        leads: Number(row.leads) || 0,
        messages: Number(row.messages) || 0,
      });
    }
  });

  return Array.from(adMap.values())
    .map((a) => ({
      ...a,
      costPerResult: a.results > 0 ? a.spend / a.results : null,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, limit);
}

export async function getMetaPlatformPerformance(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaPlatformPerformance[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'ads_breakdowns');
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName as any)
    .select('publisher_platform, spend, reach, impressions, results, conversions')
    .gte('date_start', startDate)
    .lte('date_end', endDate);

  if (error || !data) {
    console.error('Error fetching Meta platform performance:', error);
    return [];
  }

  const platformMap = new Map<string, MetaPlatformPerformance>();

  (data as any[]).forEach((row) => {
    const platform = row.publisher_platform || 'unknown';
    if (platform === '' || platform === 'unknown') return;
    
    const existing = platformMap.get(platform);

    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.reach += Number(row.reach) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
      existing.conversions += Number(row.conversions) || 0;
    } else {
      platformMap.set(platform, {
        platform,
        position: null,
        spend: Number(row.spend) || 0,
        reach: Number(row.reach) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        avgCostPerResult: null,
        conversions: Number(row.conversions) || 0,
      });
    }
  });

  return Array.from(platformMap.values()).map((p) => ({
    ...p,
    avgCostPerResult: p.results > 0 ? p.spend / p.results : null,
  }));
}

export async function getMetaDemographicPerformance(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaDemographicPerformance[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'ads_breakdowns');
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName as any)
    .select('age, gender, spend, reach, impressions, results, conversions')
    .gte('date_start', startDate)
    .lte('date_end', endDate);

  if (error || !data) {
    console.error('Error fetching Meta demographic performance:', error);
    return [];
  }

  const demographicMap = new Map<string, MetaDemographicPerformance>();

  (data as any[]).forEach((row) => {
    const age = row.age || 'unknown';
    const gender = row.gender || 'unknown';
    
    if (age === '' || gender === '') return;
    
    const key = `${age}-${gender}`;
    const existing = demographicMap.get(key);

    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.reach += Number(row.reach) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
      existing.conversions += Number(row.conversions) || 0;
    } else {
      demographicMap.set(key, {
        age,
        gender,
        spend: Number(row.spend) || 0,
        reach: Number(row.reach) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        conversions: Number(row.conversions) || 0,
      });
    }
  });

  return Array.from(demographicMap.values());
}

// Buscar KPIs totais usando tabela dinâmica
export async function getMetaKpiTotals(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaKpiTotals> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns');
  if (!tableName) {
    return {
      totalSpend: 0,
      totalReach: 0,
      totalImpressions: 0,
      totalResults: 0,
      avgCostPerResult: null,
      totalLeads: 0,
      totalMessages: 0,
      totalPageViews: 0,
      costPerLead: null,
      costPerMessage: null,
      costPerPageView: null,
    };
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select('spend, reach, impressions, results, leads, messages, page_views')
    .gte('date_start', startDate)
    .lte('date_end', endDate);

  if (error || !data) {
    console.error('Error fetching Meta KPI totals:', error);
    return {
      totalSpend: 0,
      totalReach: 0,
      totalImpressions: 0,
      totalResults: 0,
      avgCostPerResult: null,
      totalLeads: 0,
      totalMessages: 0,
      totalPageViews: 0,
      costPerLead: null,
      costPerMessage: null,
      costPerPageView: null,
    };
  }

  const totals = (data as any[]).reduce(
    (acc, row) => ({
      spend: acc.spend + (Number(row.spend) || 0),
      reach: acc.reach + (Number(row.reach) || 0),
      impressions: acc.impressions + (Number(row.impressions) || 0),
      results: acc.results + (Number(row.results) || 0),
      leads: acc.leads + (Number(row.leads) || 0),
      messages: acc.messages + (Number(row.messages) || 0),
      pageViews: acc.pageViews + (Number(row.page_views) || 0),
    }),
    { spend: 0, reach: 0, impressions: 0, results: 0, leads: 0, messages: 0, pageViews: 0 }
  );

  return {
    totalSpend: totals.spend,
    totalReach: totals.reach,
    totalImpressions: totals.impressions,
    totalResults: totals.results,
    avgCostPerResult: totals.results > 0 ? totals.spend / totals.results : null,
    totalLeads: totals.leads,
    totalMessages: totals.messages,
    totalPageViews: totals.pageViews,
    costPerLead: totals.leads > 0 ? totals.spend / totals.leads : null,
    costPerMessage: totals.messages > 0 ? totals.spend / totals.messages : null,
    costPerPageView: totals.pageViews > 0 ? totals.spend / totals.pageViews : null,
  };
}

// Buscar evolução diária usando tabela dinâmica
export async function getMetaDailyEvolution(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaDailyEvolution[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns');
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName as any)
    .select('date_start, spend, impressions, results, page_views')
    .gte('date_start', startDate)
    .lte('date_start', endDate)
    .order('date_start', { ascending: true });

  if (error || !data) {
    console.error('Error fetching Meta daily evolution:', error);
    return [];
  }

  const dailyMap = new Map<string, MetaDailyEvolution>();

  (data as any[]).forEach((row) => {
    const date = row.date_start;
    const existing = dailyMap.get(date);

    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
      existing.pageViews += Number(row.page_views) || 0;
    } else {
      dailyMap.set(date, {
        date,
        spend: Number(row.spend) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        pageViews: Number(row.page_views) || 0,
      });
    }
  });

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Buscar breakdown por plataforma
export async function getMetaPlatformBreakdown(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaPlatformBreakdown[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns_breakdowns');
  
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName as any)
    .select('publisher_platform, spend, impressions, results')
    .gte('date_start', startDate)
    .lte('date_start', endDate)
    .not('publisher_platform', 'is', null);

  if (error || !data) {
    console.error('Error fetching platform breakdown:', error);
    return [];
  }

  const platformLabels: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    audience_network: 'Audience Network',
    messenger: 'Messenger',
  };

  const platformMap = new Map<string, MetaPlatformBreakdown>();

  (data as any[]).forEach((row) => {
    const platform = row.publisher_platform || 'unknown';
    if (!platform || platform === '') return;

    const existing = platformMap.get(platform);
    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
    } else {
      platformMap.set(platform, {
        platform,
        platformLabel: platformLabels[platform] || platform,
        spend: Number(row.spend) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        cpr: 0,
      });
    }
  });

  return Array.from(platformMap.values())
    .map((p) => ({
      ...p,
      cpr: p.results > 0 ? p.spend / p.results : 0,
    }))
    .sort((a, b) => b.spend - a.spend);
}

// Buscar breakdown por idade
export async function getMetaAgeBreakdown(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaAgeBreakdown[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns_breakdowns');
  
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName as any)
    .select('age, spend, impressions, results')
    .gte('date_start', startDate)
    .lte('date_start', endDate)
    .not('age', 'is', null)
    .neq('age', '');

  if (error || !data) {
    console.error('Error fetching age breakdown:', error);
    return [];
  }

  const ageMap = new Map<string, MetaAgeBreakdown>();

  (data as any[]).forEach((row) => {
    const age = row.age;
    if (!age) return;

    const existing = ageMap.get(age);
    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
    } else {
      ageMap.set(age, {
        age,
        spend: Number(row.spend) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        cpr: 0,
      });
    }
  });

  return Array.from(ageMap.values())
    .map((a) => ({
      ...a,
      cpr: a.results > 0 ? a.spend / a.results : 0,
    }))
    .sort((a, b) => a.age.localeCompare(b.age));
}

// Buscar breakdown por região
export async function getMetaRegionBreakdown(
  clientId: string,
  startDate: string,
  endDate: string,
  limit = 10
): Promise<MetaRegionBreakdown[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns_breakdowns');
  
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName as any)
    .select('region, spend, impressions, results')
    .gte('date_start', startDate)
    .lte('date_start', endDate)
    .not('region', 'is', null)
    .neq('region', '');

  if (error || !data) {
    console.error('Error fetching region breakdown:', error);
    return [];
  }

  const regionMap = new Map<string, MetaRegionBreakdown>();

  (data as any[]).forEach((row) => {
    const region = row.region;
    if (!region) return;

    const existing = regionMap.get(region);
    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
    } else {
      regionMap.set(region, {
        region,
        spend: Number(row.spend) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        cpr: 0,
      });
    }
  });

  return Array.from(regionMap.values())
    .map((r) => ({
      ...r,
      cpr: r.results > 0 ? r.spend / r.results : 0,
    }))
    .sort((a, b) => b.results - a.results)
    .slice(0, limit);
}

// Buscar breakdown por gênero
export async function getMetaGenderBreakdown(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaGenderBreakdown[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns_breakdowns');
  
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName as any)
    .select('gender, spend, impressions, results')
    .gte('date_start', startDate)
    .lte('date_start', endDate)
    .not('gender', 'is', null)
    .neq('gender', '');

  if (error || !data) {
    console.error('Error fetching gender breakdown:', error);
    return [];
  }

  const genderLabels: Record<string, string> = {
    male: 'Masculino',
    female: 'Feminino',
    unknown: 'Não informado',
  };

  const genderMap = new Map<string, MetaGenderBreakdown>();

  (data as any[]).forEach((row) => {
    const gender = row.gender;
    if (!gender) return;

    const existing = genderMap.get(gender);
    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
    } else {
      genderMap.set(gender, {
        gender,
        genderLabel: genderLabels[gender] || gender,
        spend: Number(row.spend) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        cpr: 0,
      });
    }
  });

  return Array.from(genderMap.values())
    .map((g) => ({
      ...g,
      cpr: g.results > 0 ? g.spend / g.results : 0,
    }))
    .sort((a, b) => b.results - a.results);
}

// Buscar breakdown por posição do anúncio
export async function getMetaPositionBreakdown(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<MetaPositionBreakdown[]> {
  const tableName = await getClientTableName(clientId, 'meta_ads', 'campaigns_breakdowns');
  
  if (!tableName) return [];

  const { data, error } = await supabase
    .from(tableName as any)
    .select('platform_position, spend, impressions, results')
    .gte('date_start', startDate)
    .lte('date_start', endDate)
    .not('platform_position', 'is', null)
    .neq('platform_position', '');

  if (error || !data) {
    console.error('Error fetching position breakdown:', error);
    return [];
  }

  const positionLabels: Record<string, string> = {
    feed: 'Feed',
    story: 'Stories',
    reels: 'Reels',
    explore: 'Explorar',
    search: 'Pesquisa',
    marketplace: 'Marketplace',
    video_feeds: 'Vídeos',
    right_hand_column: 'Coluna Direita',
    instant_article: 'Artigo Instantâneo',
    instream_video: 'Vídeo In-Stream',
  };

  const positionMap = new Map<string, MetaPositionBreakdown>();

  (data as any[]).forEach((row) => {
    const position = row.platform_position;
    if (!position) return;

    const existing = positionMap.get(position);
    if (existing) {
      existing.spend += Number(row.spend) || 0;
      existing.impressions += Number(row.impressions) || 0;
      existing.results += Number(row.results) || 0;
    } else {
      positionMap.set(position, {
        position,
        positionLabel: positionLabels[position] || position,
        spend: Number(row.spend) || 0,
        impressions: Number(row.impressions) || 0,
        results: Number(row.results) || 0,
        cpr: 0,
      });
    }
  });

  return Array.from(positionMap.values())
    .map((p) => ({
      ...p,
      cpr: p.results > 0 ? p.spend / p.results : 0,
    }))
    .sort((a, b) => b.results - a.results);
}
