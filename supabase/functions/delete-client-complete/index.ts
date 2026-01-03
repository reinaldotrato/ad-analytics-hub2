import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteClientRequest {
  clientId: string;
  action?: string;
}

interface DeletionSummary {
  tables: string[];
  users: { id: string; email: string }[];
  credentials: number;
  crmData: {
    deals: number;
    contacts: number;
    companies: number;
    tasks: number;
    funnels: number;
    products: number;
    stages: number;
    timeline_events: number;
    loss_reasons: number;
    sellers: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("User authentication error:", userError);
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("tryvia_analytics_user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      console.error("Error fetching user role:", roleError);
    }

    if (!roleData || roleData.role !== "admin") {
      console.error("User is not admin:", { userId: user.id, role: roleData?.role });
      return new Response(JSON.stringify({ error: "Apenas administradores podem excluir clientes" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { clientId, action } = await req.json() as DeleteClientRequest;

    if (!clientId) {
      console.error("No clientId provided");
      return new Response(JSON.stringify({ error: "clientId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`=== Starting client deletion process ===`);
    console.log(`Client ID: ${clientId}`);
    console.log(`Action: ${action || 'delete'}`);

    // Get client info
    const { data: client, error: clientError } = await supabaseAdmin
      .from("tryvia_analytics_clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError) {
      console.error("Error fetching client:", clientError);
    }

    if (!client) {
      console.error("Client not found:", clientId);
      return new Response(JSON.stringify({ error: "Cliente não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Client found: ${client.name}`);

    // Use RPC to get preview data (bypasses RLS)
    const { data: previewData, error: previewError } = await supabaseAdmin
      .rpc("get_client_deletion_preview", { p_client_id: clientId });

    if (previewError) {
      console.error("Error getting deletion preview via RPC:", previewError);
    }

    console.log(`Preview data from RPC:`, JSON.stringify(previewData));

    // Get users via RPC (bypasses RLS)
    const { data: usersData, error: usersError } = await supabaseAdmin
      .rpc("get_client_users_for_deletion", { p_client_id: clientId });

    if (usersError) {
      console.error("Error getting users via RPC:", usersError);
    }

    console.log(`Users from RPC:`, JSON.stringify(usersData));

    const users = usersData?.map((u: { user_id: string; user_email: string }) => ({ 
      id: u.user_id, 
      email: u.user_email || "N/A" 
    })) || [];

    console.log(`Found ${users.length} users to delete`);

    // Get tables via RPC (bypasses RLS)
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .rpc("get_client_tables_for_deletion", { p_client_id: clientId });

    if (tablesError) {
      console.error("Error getting tables via RPC:", tablesError);
    }

    console.log(`Tables from RPC:`, JSON.stringify(tablesData));

    const tableNames = tablesData?.map((t: { table_name: string }) => t.table_name) || [];
    console.log(`Found ${tableNames.length} tables to drop`);

    const summary: DeletionSummary = {
      tables: tableNames,
      users,
      credentials: previewData?.credentials || 0,
      crmData: {
        deals: previewData?.crm?.deals || 0,
        contacts: previewData?.crm?.contacts || 0,
        companies: previewData?.crm?.companies || 0,
        tasks: previewData?.crm?.tasks || 0,
        funnels: previewData?.crm?.funnels || 0,
        products: previewData?.crm?.products || 0,
        stages: previewData?.crm?.stages || 0,
        timeline_events: previewData?.crm?.timeline_events || 0,
        loss_reasons: previewData?.crm?.loss_reasons || 0,
        sellers: previewData?.crm?.sellers || 0,
      },
    };

    console.log(`Summary built:`, JSON.stringify(summary));

    // If action=preview, just return summary
    if (action === "preview") {
      console.log("Returning preview only");
      return new Response(JSON.stringify({ client, summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // EXECUTE DELETION
    console.log("=== Executing deletion ===");

    // 1. Drop dynamic tables
    for (const tableName of tableNames) {
      console.log(`Dropping table: ${tableName}`);
      const { error } = await supabaseAdmin.rpc("exec_sql", {
        sql: `DROP TABLE IF EXISTS public."${tableName}" CASCADE`,
      });
      if (error) {
        // Check if it's a view instead of a table
        console.log(`Trying to drop as view: ${tableName}`);
        const { error: viewError } = await supabaseAdmin.rpc("exec_sql", {
          sql: `DROP VIEW IF EXISTS public."${tableName}" CASCADE`,
        });
        if (viewError) {
          console.error(`Error dropping table/view ${tableName}:`, viewError);
        }
      }
    }
    console.log("Finished dropping tables");

    // 2. Delete from client_table_registry using RPC
    const { data: registryDeleted, error: registryError } = await supabaseAdmin
      .rpc("delete_client_table_registry", { p_client_id: clientId });
    
    if (registryError) {
      console.error("Error deleting from client_table_registry:", registryError);
    } else {
      console.log(`Deleted ${registryDeleted} entries from client_table_registry`);
    }

    // 3. Delete CRM data using RPC
    const { data: crmDeleted, error: crmError } = await supabaseAdmin
      .rpc("delete_client_crm_data", { p_client_id: clientId });
    
    if (crmError) {
      console.error("Error deleting CRM data:", crmError);
    } else {
      console.log("CRM data deleted:", JSON.stringify(crmDeleted));
    }

    // 4. Delete users using RPC
    const { data: usersDeleted, error: usersDeleteError } = await supabaseAdmin
      .rpc("delete_client_users", { p_client_id: clientId });
    
    if (usersDeleteError) {
      console.error("Error deleting users:", usersDeleteError);
    } else {
      console.log("Users deleted:", JSON.stringify(usersDeleted));
    }

    // 4b. Delete auth users (requires admin API)
    const deletedUserIds = usersDeleted?.user_ids || [];
    for (const userId of deletedUserIds) {
      if (userId) {
        console.log(`Deleting auth user: ${userId}`);
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteAuthError) {
          console.error(`Error deleting auth user ${userId}:`, deleteAuthError);
        }
      }
    }
    console.log("Finished deleting auth users");

    // 5. Delete credentials using RPC
    const { data: credentialsDeleted, error: credentialsError } = await supabaseAdmin
      .rpc("delete_client_credentials", { p_client_id: clientId });
    
    if (credentialsError) {
      console.error("Error deleting credentials:", credentialsError);
    } else {
      console.log(`Deleted ${credentialsDeleted} credentials`);
    }

    // 6. Delete client using RPC
    const { data: clientDeleted, error: clientDeleteError } = await supabaseAdmin
      .rpc("delete_client_record", { p_client_id: clientId });
    
    if (clientDeleteError) {
      console.error("Error deleting client:", clientDeleteError);
    } else {
      console.log(`Client deleted: ${clientDeleted}`);
    }

    console.log("=== Deletion complete ===");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cliente "${client.name}" excluído com sucesso`,
        summary,
        deletionDetails: {
          tables: tableNames.length,
          crmData: crmDeleted,
          users: usersDeleted,
          credentials: credentialsDeleted,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in delete-client-complete:", err);
    const errorMessage = err instanceof Error ? err.message : "Erro ao excluir cliente";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
