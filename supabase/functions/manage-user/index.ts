import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is admin or crm_admin
    const { data: roleData } = await supabaseAdmin
      .from('tryvia_analytics_user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .single();

    const canManageUsers = roleData?.role === 'admin';
    const canManageSellers = roleData?.role === 'admin' || roleData?.role === 'crm_admin';

    if (!roleData || (!canManageUsers && !canManageSellers)) {
      return new Response(
        JSON.stringify({ error: 'Permission denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...data } = await req.json();
    console.log(`Action: ${action}`, data);

    // Helper function to send custom invite email via Resend
    async function sendCustomInviteEmail(params: {
      email: string;
      sellerName: string;
      companyName: string;
      inviteLink: string;
      roleName: string;
    }) {
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-invite-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invite email');
      }

      return await response.json();
    }

    // Helper function to get client/company name
    async function getClientName(clientId: string): Promise<string> {
      const { data: client } = await supabaseAdmin
        .from('tryvia_analytics_clients')
        .select('name')
        .eq('id', clientId)
        .single();
      
      return client?.name || 'Sua Empresa';
    }

    switch (action) {
      case 'create': {
        if (!canManageUsers) {
          return new Response(
            JSON.stringify({ error: 'Only admins can create users' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { email, clientId, role, whatsapp } = data;

        // Send invitation email - profile and role will be created by database trigger
        // when user accepts the invite and completes signup
        console.log(`Inviting user: ${email}`);
        const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: {
            client_id: clientId,
            role: role,
            whatsapp: whatsapp,
          }
        });

        if (inviteError) {
          console.error('Error inviting user:', inviteError);
          return new Response(
            JSON.stringify({ error: inviteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const userId = authData.user.id;
        console.log(`User invited successfully, ID: ${userId}. Profile and role will be created when user accepts invite.`);

        return new Response(
          JSON.stringify({ success: true, userId, message: 'Convite enviado por email. O usuário aparecerá no sistema após aceitar o convite.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-seller': {
        if (!canManageSellers) {
          return new Response(
            JSON.stringify({ error: 'Permission denied to create sellers' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { email, name, phone, clientId, role } = data;

        // Validate role is a CRM role
        if (role !== 'crm_admin' && role !== 'crm_user' && role !== 'manager' && role !== 'seller') {
          return new Response(
            JSON.stringify({ error: 'Invalid seller role. Must be manager or seller' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check for duplicate email - prevent sending duplicate invites
        const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
        if (checkError) {
          console.error('Error checking existing users:', checkError);
          return new Response(
            JSON.stringify({ error: 'Erro ao verificar usuários existentes' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (existingUser) {
          console.log(`Found existing user with email ${email}, confirmed: ${!!existingUser.email_confirmed_at}`);
          if (existingUser.email_confirmed_at) {
            console.log('User already confirmed, returning error');
            return new Response(
              JSON.stringify({ error: 'Este e-mail já está cadastrado no sistema' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            console.log('User has pending invite, returning error');
            return new Response(
              JSON.stringify({ error: 'Já existe um convite pendente para este e-mail. Use a opção "Reenviar convite" na lista de convites pendentes.' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        console.log(`No existing user found with email ${email}, proceeding with invite`);

        console.log(`Inviting seller: ${email} with role ${role}`);
        
        // Generate invite link instead of sending default Supabase email
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'invite',
          email: email,
          options: {
            data: {
              client_id: clientId,
              role: role,
              is_seller: true,
              name: name,
              phone: phone,
            }
          }
        });

        if (linkError) {
          console.error('Error generating invite link:', linkError);
          return new Response(
            JSON.stringify({ error: linkError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const userId = linkData.user.id;
        const inviteLink = linkData.properties?.action_link;

        if (!inviteLink) {
          console.error('No invite link generated');
          return new Response(
            JSON.stringify({ error: 'Falha ao gerar link de convite' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Invite link generated for seller: ${email}`);

        // Get company name for the email
        const companyName = await getClientName(clientId);

        // Send custom email via Resend
        try {
          const roleLabel = (role === 'crm_admin' || role === 'manager') ? 'Gestor' : 'Vendedor';
          await sendCustomInviteEmail({
            email,
            sellerName: name || email.split('@')[0],
            companyName,
            inviteLink,
            roleName: roleLabel,
          });
          console.log(`Custom invite email sent to: ${email}`);
        } catch (emailError) {
          console.error('Error sending custom email:', emailError);
          // Return the link anyway so admin can share it manually
          return new Response(
            JSON.stringify({ 
              success: true, 
              userId, 
              message: 'Vendedor criado, mas houve erro ao enviar email. Use o link abaixo para convidar manualmente.',
              actionLink: inviteLink,
              emailError: emailError instanceof Error ? emailError.message : 'Erro desconhecido'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Seller invited successfully, ID: ${userId}. Profile, role, and seller record will be created when user accepts invite.`);

        return new Response(
          JSON.stringify({ success: true, userId, message: 'Convite enviado por email. O vendedor aparecerá no sistema após aceitar o convite.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list-pending-invites': {
        if (!canManageSellers) {
          return new Response(
            JSON.stringify({ error: 'Permission denied' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { clientId: listClientId } = data;
        
        if (!listClientId) {
          return new Response(
            JSON.stringify({ error: 'Client ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // List all users who have is_seller=true metadata and haven't confirmed email
        const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('Error listing users:', listError);
          return new Response(
            JSON.stringify({ error: listError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const pendingInvites = allUsers.users.filter(user => {
          const metadata = user.user_metadata || {};
          return (
            metadata.is_seller === true &&
            metadata.client_id === listClientId &&
            !user.email_confirmed_at
          );
        }).map(user => ({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          phone: user.user_metadata?.phone || null,
          role: user.user_metadata?.role || 'crm_user',
          created_at: user.created_at,
        }));

        return new Response(
          JSON.stringify({ success: true, pendingInvites }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cancel-invite': {
        if (!canManageSellers) {
          return new Response(
            JSON.stringify({ error: 'Permission denied' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { userId: cancelUserId } = data;

        if (!cancelUserId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete the unconfirmed user
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(cancelUserId);

        if (deleteError) {
          console.error('Error canceling invite:', deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Convite cancelado com sucesso' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        const { userId, email, whatsapp } = data;

        // Update profile
        const { error: profileError } = await supabaseAdmin
          .from('tryvia_analytics_profiles')
          .update({ email, whatsapp })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update auth email if changed
        if (email) {
          const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            email,
          });

          if (updateAuthError) {
            console.error('Error updating auth email:', updateAuthError);
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const { userId } = data;

        // Delete seller record if exists
        await supabaseAdmin
          .from('crm_sellers')
          .delete()
          .eq('id', userId);

        // Delete role first
        await supabaseAdmin
          .from('tryvia_analytics_user_roles')
          .delete()
          .eq('user_id', userId);

        // Delete profile
        await supabaseAdmin
          .from('tryvia_analytics_profiles')
          .delete()
          .eq('id', userId);

        // Delete auth user
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteAuthError) {
          console.error('Error deleting auth user:', deleteAuthError);
          return new Response(
            JSON.stringify({ error: deleteAuthError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reset-password': {
        if (!canManageUsers) {
          return new Response(
            JSON.stringify({ error: 'Only admins can reset passwords' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { email } = data;

        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Generating password reset link for: ${email}`);

        // Generate password reset link - this will send an email to the user
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
        });

        if (resetError) {
          console.error('Error generating reset link:', resetError);
          return new Response(
            JSON.stringify({ error: resetError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Password reset link generated for: ${email}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Link de redefinição de senha enviado por email',
            // Return the action link in case the admin wants to share it directly
            actionLink: resetData.properties?.action_link 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'resend-invite': {
        if (!canManageSellers) {
          return new Response(
            JSON.stringify({ error: 'Permission denied' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { email, name, clientId, role } = data;

        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Resending invite for: ${email}`);

        // Generate a new invite link for the user
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'invite',
          email: email,
        });

        if (inviteError) {
          console.error('Error resending invite:', inviteError);
          return new Response(
            JSON.stringify({ error: inviteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const inviteLink = inviteData.properties?.action_link;

        if (!inviteLink) {
          return new Response(
            JSON.stringify({ error: 'Falha ao gerar link de convite' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get company name for the email
        const companyName = clientId ? await getClientName(clientId) : 'Sua Empresa';

        // Send custom email via Resend
        try {
          await sendCustomInviteEmail({
            email,
            sellerName: name || email.split('@')[0],
            companyName,
            inviteLink,
            roleName: role === 'crm_admin' ? 'Administrador CRM' : 'Vendedor',
          });
          console.log(`Resend custom invite email sent to: ${email}`);
        } catch (emailError) {
          console.error('Error sending custom email on resend:', emailError);
          // Return the link anyway so admin can share it manually
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Novo link gerado, mas houve erro ao enviar email. Use o link abaixo.',
              actionLink: inviteLink,
              emailError: emailError instanceof Error ? emailError.message : 'Erro desconhecido'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Invite resent for: ${email}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Convite reenviado com sucesso',
            actionLink: inviteLink 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
