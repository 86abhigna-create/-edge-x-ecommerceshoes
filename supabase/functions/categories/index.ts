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
    let user = null;
    let isAdmin = false;

    if (authHeader) {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
      user = authUser;
      if (user) {
        const { data: profile } = await supabaseClient
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        isAdmin = profile && ['admin', 'owner'].includes(profile.role);
      }
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/categories', '');
    const method = req.method;

    // GET /categories - List categories
    if (method === 'GET' && (path === '' || path === '/')) {
      const showAll = url.searchParams.get('all') === 'true';
      
      let query = supabaseClient
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!showAll || !isAdmin) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // GET /categories/:id - Get single category
    if (method === 'GET' && path.startsWith('/')) {
      const id = path.slice(1);
      
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(JSON.stringify({ error: 'Category not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        throw error;
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /categories - Create category (admin only)
    if (method === 'POST' && (path === '' || path === '/')) {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const body = await req.json();
      const { name, slug, description, image_url, sort_order } = body;

      const { data, error } = await supabaseClient
        .from('categories')
        .insert({ name, slug, description, image_url, sort_order })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT /categories/:id - Update category (admin only)
    if (method === 'PUT' && path.startsWith('/')) {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const id = path.slice(1);
      const body = await req.json();
      const { name, slug, description, image_url, sort_order, is_active } = body;

      const { data, error } = await supabaseClient
        .from('categories')
        .update({ name, slug, description, image_url, sort_order, is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /categories/:id - Delete category (admin only)
    if (method === 'DELETE' && path.startsWith('/')) {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const id = path.slice(1);
      const { error } = await supabaseClient.from('categories').delete().eq('id', id);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
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