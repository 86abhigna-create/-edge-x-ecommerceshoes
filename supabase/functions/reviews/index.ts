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
    const path = url.pathname.replace('/functions/v1/reviews', '');
    const method = req.method;

    // GET /reviews - Get reviews for a product
    if (method === 'GET' && (path === '' || path === '/')) {
      const searchParams = url.searchParams;
      const productId = searchParams.get('product_id');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');

      if (!productId) {
        return new Response(JSON.stringify({ error: 'product_id required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      let query = supabaseClient
        .from('reviews')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('product_id', productId)
        .eq('status', 'Published')
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (isAdmin) {
        query = supabaseClient
          .from('reviews')
          .select(`
            *,
            user:users(id, full_name, avatar_url)
          `, { count: 'exact' })
          .eq('product_id', productId)
          .range((page - 1) * limit, page * limit - 1)
          .order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Get rating summary
      const { data: summary } = await supabaseClient
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('status', 'Published');

      const ratingSummary = summary?.reduce((acc, r) => {
        acc.total += 1;
        acc.sum += r.rating;
        acc.counts[r.rating] = (acc.counts[r.rating] || 0) + 1;
        return acc;
      }, { total: 0, sum: 0, counts: {} }) || { total: 0, sum: 0, counts: {} };

      return new Response(JSON.stringify({
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil((count || 0) / limit),
        },
        summary: {
          average: ratingSummary.total > 0 ? ratingSummary.sum / ratingSummary.total : 0,
          total: ratingSummary.total,
          distribution: ratingSummary.counts,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /reviews - Create review
    if (method === 'POST' && (path === '' || path === '/')) {
      const body = await req.json();
      const { product_id, order_id, rating, title, comment } = body;

      if (!product_id || !rating || rating < 1 || rating > 5) {
        return new Response(JSON.stringify({ error: 'Invalid rating' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Verify purchase
      const { data: orderItem } = await supabaseClient
        .from('order_items')
        .select('id')
        .eq('order_id', order_id)
        .eq('product_id', product_id)
        .single();

      const { data: order } = await supabaseClient
        .from('orders')
        .select('status, user_id')
        .eq('id', order_id)
        .single();

      if (!order || order.user_id !== user.id || order.status !== 'Delivered') {
        return new Response(JSON.stringify({ error: 'Can only review delivered orders' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Check if already reviewed
      const { data: existing } = await supabaseClient
        .from('reviews')
        .select('id')
        .eq('product_id', product_id)
        .eq('user_id', user.id)
        .eq('order_id', order_id)
        .single();

      if (existing) {
        return new Response(JSON.stringify({ error: 'Already reviewed this order' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { data, error } = await supabaseClient
        .from('reviews')
        .insert({
          product_id,
          user_id: user.id,
          order_id,
          rating,
          title,
          comment,
          is_verified_purchase: true,
          status: 'Published',
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT /reviews/:id - Update review
    if (method === 'PUT' && path.startsWith('/')) {
      const id = path.slice(1);
      const body = await req.json();
      const { rating, title, comment } = body;

      const { data, error } = await supabaseClient
        .from('reviews')
        .update({ rating, title, comment, updated_at: new Date().toISOString() })
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

    // DELETE /reviews/:id - Delete review
    if (method === 'DELETE' && path.startsWith('/')) {
      const id = path.slice(1);
      const { error } = await supabaseClient
        .from('reviews')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Admin: PUT /reviews/:id/status - Update review status
    if (method === 'PUT' && path.startsWith('/') && isAdmin) {
      const id = path.slice(1);
      const searchParams = url.searchParams;
      if (searchParams.get('action') === 'status') {
        const body = await req.json();
        const { status } = body;

        if (!['Published', 'Pending', 'Flagged', 'Rejected'].includes(status)) {
          return new Response(JSON.stringify({ error: 'Invalid status' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        const { data, error } = await supabaseClient
          .from('reviews')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
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