import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RdStationLead {
  id: string;
  client_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  rd_lead_id: string | null;
  conversion_source: string | null;
  rd_created_at: string | null;
  city: string | null;
  state: string | null;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats: {
    leadsProcessed: number;
    contactsCreated: number;
    dealsCreated: number;
    duplicatesSkipped: number;
    errors: number;
  };
  errors: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { 
      clientId, 
      startDate = '2025-12-01', 
      endDate = '2025-12-31',
      dryRun = false 
    } = body;

    console.log(`Starting RD Station → CRM sync for client: ${clientId || 'all'}`);
    console.log(`Period: ${startDate} to ${endDate}`);
    console.log(`Dry run: ${dryRun}`);

    const result: SyncResult = {
      success: true,
      message: '',
      stats: {
        leadsProcessed: 0,
        contactsCreated: 0,
        dealsCreated: 0,
        duplicatesSkipped: 0,
        errors: 0,
      },
      errors: [],
    };

    // Step 1: Get all clients with RD Station leads tables
    let clientIds: string[] = [];
    
    if (clientId) {
      clientIds = [clientId];
    } else {
      // Get all clients from client_table_registry that have rdstation_leads tables
      const { data: registries, error: regError } = await supabase
        .from('client_table_registry')
        .select('client_id, table_name')
        .eq('table_type', 'leads')
        .eq('channel', 'rdstation');

      if (regError) {
        console.error('Error fetching client registries:', regError);
        throw new Error(`Failed to fetch client registries: ${regError.message}`);
      }

      clientIds = [...new Set(registries?.map(r => r.client_id) || [])];
    }

    console.log(`Processing ${clientIds.length} clients`);

    // Process each client
    for (const cId of clientIds) {
      console.log(`\n--- Processing client: ${cId} ---`);

      try {
        // Get the leads table name for this client
        const { data: registry } = await supabase
          .from('client_table_registry')
          .select('table_name')
          .eq('client_id', cId)
          .eq('table_type', 'leads')
          .eq('channel', 'rdstation')
          .single();

        if (!registry) {
          console.log(`No RD Station leads table found for client ${cId}`);
          continue;
        }

        const leadsTableName = registry.table_name;
        console.log(`Using leads table: ${leadsTableName}`);

        // Step 2: Get the "Novo Lead" stage for this client (by name, not order)
        const { data: novoLeadStage, error: stageError } = await supabase
          .from('crm_funnel_stages')
          .select('id, name')
          .eq('client_id', cId)
          .ilike('name', 'Novo Lead')
          .single();

        if (stageError || !novoLeadStage) {
          console.log(`No "Novo Lead" stage (order 0) found for client ${cId}. Skipping.`);
          result.errors.push(`Client ${cId}: No "Novo Lead" stage found`);
          result.stats.errors++;
          continue;
        }

        console.log(`Novo Lead stage: ${novoLeadStage.id} (${novoLeadStage.name})`);

        // Step 3: Fetch leads from RD Station table for the specified period
        const { data: rdLeads, error: leadsError } = await supabase
          .from(leadsTableName)
          .select('*')
          .eq('client_id', cId)
          .gte('rd_created_at', startDate)
          .lte('rd_created_at', `${endDate}T23:59:59.999Z`);

        if (leadsError) {
          console.error(`Error fetching leads from ${leadsTableName}:`, leadsError);
          result.errors.push(`Client ${cId}: Failed to fetch leads - ${leadsError.message}`);
          result.stats.errors++;
          continue;
        }

        console.log(`Found ${rdLeads?.length || 0} leads in period`);

        if (!rdLeads || rdLeads.length === 0) {
          continue;
        }

        // Step 4: Get existing deals to check for duplicates
        const { data: existingDeals } = await supabase
          .from('crm_deals')
          .select('source_lead_id')
          .eq('client_id', cId)
          .not('source_lead_id', 'is', null);

        const existingLeadIds = new Set(existingDeals?.map(d => d.source_lead_id) || []);
        console.log(`Found ${existingLeadIds.size} existing deals with source_lead_id`);

        // Step 5: Get existing contacts by email
        const { data: existingContacts } = await supabase
          .from('crm_contacts')
          .select('id, email')
          .eq('client_id', cId);

        const contactsByEmail = new Map<string, string>();
        existingContacts?.forEach(c => {
          if (c.email) {
            contactsByEmail.set(c.email.toLowerCase(), c.id);
          }
        });

        // Step 6: Process each lead
        for (const lead of rdLeads as RdStationLead[]) {
          result.stats.leadsProcessed++;

          // Check for duplicate
          if (lead.rd_lead_id && existingLeadIds.has(lead.rd_lead_id)) {
            console.log(`Skipping duplicate lead: ${lead.rd_lead_id}`);
            result.stats.duplicatesSkipped++;
            continue;
          }

          if (dryRun) {
            console.log(`[DRY RUN] Would create contact/deal for: ${lead.name} (${lead.email})`);
            result.stats.contactsCreated++;
            result.stats.dealsCreated++;
            continue;
          }

          try {
            // Step 6a: Create or find contact
            let contactId: string | null = null;
            
            if (lead.email && contactsByEmail.has(lead.email.toLowerCase())) {
              contactId = contactsByEmail.get(lead.email.toLowerCase())!;
              console.log(`Using existing contact: ${contactId}`);
            } else if (lead.name || lead.email) {
              // Create new contact
              const { data: newContact, error: contactError } = await supabase
                .from('crm_contacts')
                .insert({
                  client_id: cId,
                  name: lead.name || lead.email || 'Lead sem nome',
                  email: lead.email,
                  phone: lead.phone,
                })
                .select('id')
                .single();

              if (contactError) {
                console.error(`Error creating contact:`, contactError);
                result.errors.push(`Failed to create contact for ${lead.email}: ${contactError.message}`);
                result.stats.errors++;
                continue;
              }

              contactId = newContact.id;
            if (lead.email && contactId) {
                contactsByEmail.set(lead.email.toLowerCase(), contactId);
              }
              result.stats.contactsCreated++;
              console.log(`Created contact: ${contactId}`);
            }

            // Step 6b: Create deal
            const dealName = lead.name 
              ? `Lead: ${lead.name}` 
              : lead.email 
                ? `Lead: ${lead.email}` 
                : 'Lead RD Station';

            const { data: newDeal, error: dealError } = await supabase
              .from('crm_deals')
              .insert({
                client_id: cId,
                name: dealName,
                value: 0,
                stage_id: novoLeadStage.id,
                contact_id: contactId,
                source: lead.conversion_source || 'RD Station',
                source_lead_id: lead.rd_lead_id,
                status: 'open',
                probability: 0,
              })
              .select('id')
              .single();

            if (dealError) {
              console.error(`Error creating deal:`, dealError);
              result.errors.push(`Failed to create deal for ${lead.email}: ${dealError.message}`);
              result.stats.errors++;
              continue;
            }

            result.stats.dealsCreated++;
            console.log(`Created deal: ${newDeal.id} - ${dealName}`);

            // Mark as processed to avoid duplicates in same run
            if (lead.rd_lead_id) {
              existingLeadIds.add(lead.rd_lead_id);
            }

          } catch (err) {
            console.error(`Error processing lead ${lead.id}:`, err);
            result.errors.push(`Lead ${lead.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            result.stats.errors++;
          }
        }

      } catch (err) {
        console.error(`Error processing client ${cId}:`, err);
        result.errors.push(`Client ${cId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        result.stats.errors++;
      }
    }

    // Final summary
    result.message = dryRun
      ? `[DRY RUN] Would sync ${result.stats.leadsProcessed} leads: ${result.stats.dealsCreated} deals to create, ${result.stats.duplicatesSkipped} duplicates`
      : `Synced ${result.stats.leadsProcessed} leads: ${result.stats.contactsCreated} contacts created, ${result.stats.dealsCreated} deals created, ${result.stats.duplicatesSkipped} duplicates skipped`;

    console.log('\n=== SYNC COMPLETE ===');
    console.log(result.message);
    console.log('Stats:', result.stats);

    if (result.stats.errors > 0) {
      result.success = false;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 207,
    });

  } catch (error) {
    console.error('Sync error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stats: { leadsProcessed: 0, contactsCreated: 0, dealsCreated: 0, duplicatesSkipped: 0, errors: 1 },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
