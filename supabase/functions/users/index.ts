import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: profile } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile && ['admin', 'owner'].includes(profile.role);

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/users', '');
    const method = req.method;

    // GET /users/me - Get current user profile
    if (method === 'GET' && (path === '' || path === '/' || path === '/me')) {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // PUT /users/me - Update current user profile
    if (method === 'PUT' && (path === '' || path === '/' || path === '/me')) {
      const body = await req.json();
      const { full_name, phone, avatar_url } = body;

      const { data, error } = await supabaseClient
        .from('users')
        .update({ full_name, phone, avatar_url, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // GET /users/me/addresses - Get user addresses
    if (method === 'GET' && path === '/addresses') {
      const { data, error } = await supabaseClient
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /users/me/addresses - Add address
    if (method === 'POST' && path === '/addresses') {
      const body = await req.json();
      const { type, full_name, phone, street, apartment, city, state, zip, country, is_default } = body;

      // If this is default, unset other defaults
      if (is_default) {
        await supabaseClient
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', type || 'shipping');
      }

      const { data, error } = await supabaseClient
        .from('addresses')
        .insert({
          user_id: user.id,
          type: type || 'shipping',
          full_name,
          phone,
          street,
          apartment,
          city,
          state,
          zip,
          country: country || 'USA',
          is_default: is_default || false,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT /users/me/addresses/:id - Update address
    if (method === 'PUT' && path.startsWith('/addresses/')) {
      const id = path.slice('/addresses/'.length);
      const body = await req.json();
      const { is_default, ...updateData } = body;

      if (is_default) {
        await supabaseClient
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', updateData.type || 'shipping');
      }

      const { data, error } = await supabaseClient
        .from('addresses')
        .update({ ...updateData, is_default, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /users/me/addresses/:id - Delete address
    if (method === 'DELETE' && path.startsWith('/addresses/')) {
      const id = path.slice('/addresses/'.length);
      const { error } = await supabaseClient
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // GET /users/me/notifications - Get user notifications
    if (method === 'GET' && path === '/notifications') {
      const searchParams = url.searchParams;
      const unreadOnly = searchParams.get('unread') === 'true';
      const limit = parseInt(searchParams.get('limit') || '50');

      let query = supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // PUT /users/me/notifications/:id - Mark notification as read
    if (method === 'PUT' && path.startsWith('/notifications/')) {
      const id = path.slice('/notifications/'.length);
      const { error } = await supabaseClient
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // PUT /users/me/notifications - Mark all as read
    if (method === 'PUT' && path === '/notifications') {
      const { error } = await supabaseClient
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Admin: GET /users - List all users
    if (method === 'GET' && path === '/admin' && isAdmin) {
      const searchParams = url.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const role = searchParams.get('role');

      let query = supabaseClient
        .from('users')
        .select('*', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Admin: PUT /users/:id/role - Update user role
    if (method === 'PUT' && path.startsWith('/admin/') && isAdmin) {
      const id = path.slice('/admin/'.length);
      const body = await req.json();
      const { role } = body;

      if (!['customer', 'owner', 'admin'].includes(role)) {
        return new Response(JSON.stringify({ error: 'Invalid role' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { data, error } = await supabaseClient
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});