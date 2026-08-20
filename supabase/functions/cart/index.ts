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

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/cart', '');
    const method = req.method;

    // GET /cart - Get user's cart
    if (method === 'GET' && (path === '' || path === '/')) {
      const { data, error } = await supabaseClient
        .from('cart_items')
        .select(`
          *,
          product:products(
            id, name, price, discount_percent, image:product_images(url), 
            in_stock, variants:product_variants(color, size, stock)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /cart - Add item to cart
    if (method === 'POST' && (path === '' || path === '/')) {
      const body = await req.json();
      const { product_id, variant_id, quantity, selected_size, selected_color } = body;

      // Check if item already exists
      const { data: existing } = await supabaseClient
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product_id)
        .eq('selected_size', selected_size)
        .eq('selected_color', selected_color)
        .single();

      if (existing) {
        const { data, error } = await supabaseClient
          .from('cart_items')
          .update({ quantity: existing.quantity + (quantity || 1), updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const { data, error } = await supabaseClient
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id,
          variant_id,
          quantity: quantity || 1,
          selected_size,
          selected_color,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT /cart/:id - Update cart item quantity
    if (method === 'PUT' && path.startsWith('/')) {
      const id = path.slice(1);
      const body = await req.json();
      const { quantity } = body;

      if (quantity < 1) {
        const { error } = await supabaseClient
          .from('cart_items')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const { data, error } = await supabaseClient
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
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

    // DELETE /cart/:id - Remove item from cart
    if (method === 'DELETE' && path.startsWith('/')) {
      const id = path.slice(1);
      const { error } = await supabaseClient
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /cart - Clear cart
    if (method === 'DELETE' && (path === '' || path === '/')) {
      const { error } = await supabaseClient
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

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