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

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/products', '');
    const method = req.method;

    // GET /products - List products with filters
    if (method === 'GET' && (path === '' || path === '/')) {
      const searchParams = url.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      const sort = searchParams.get('sort') || 'created_at';
      const order = searchParams.get('order') || 'desc';
      const featured = searchParams.get('featured');
      const published = searchParams.get('published') !== 'false';

      let query = supabaseClient
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          images:product_images(url, alt_text, is_primary),
          variants:product_variants(color, size, stock)
        `, { count: 'exact' })
        .eq('published', published)
        .range((page - 1) * limit, page * limit - 1)
        .order(sort, { ascending: order === 'asc' });

      if (category) {
        query = query.eq('category.slug', category);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (featured === 'true') {
        query = query.eq('featured', true);
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

    // GET /products/:id - Get single product
    if (method === 'GET' && path.startsWith('/')) {
      const id = path.slice(1);
      
      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          images:product_images(url, alt_text, is_primary),
          variants:product_variants(color, size, stock)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(JSON.stringify({ error: 'Product not found' }), {
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

    // POST /products - Create product (admin only)
    if (method === 'POST' && (path === '' || path === '/')) {
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

      if (!profile || !['admin', 'owner'].includes(profile.role)) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const body = await req.json();
      const { images, variants, category_id, ...productData } = body;

      const { data: product, error } = await supabaseClient
        .from('products')
        .insert({ ...productData, category_id })
        .select()
        .single();

      if (error) throw error;

      // Insert images
      if (images && images.length > 0) {
        await supabaseClient.from('product_images').insert(
          images.map((img: any, index: number) => ({
            product_id: product.id,
            url: img.url,
            alt_text: img.alt_text,
            is_primary: index === 0 || img.is_primary,
            sort_order: index,
          }))
        );
      }

      // Insert variants
      if (variants && variants.length > 0) {
        await supabaseClient.from('product_variants').insert(
          variants.map((v: any) => ({
            product_id: product.id,
            color: v.color,
            size: v.size,
            stock: v.stock || 0,
          }))
        );
      }

      return new Response(JSON.stringify(product), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT /products/:id - Update product (admin only)
    if (method === 'PUT' && path.startsWith('/')) {
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

      if (!profile || !['admin', 'owner'].includes(profile.role)) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const id = path.slice(1);
      const body = await req.json();
      const { images, variants, category_id, ...productData } = body;

      const { data: product, error } = await supabaseClient
        .from('products')
        .update({ ...productData, category_id, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update images if provided
      if (images) {
        await supabaseClient.from('product_images').delete().eq('product_id', id);
        if (images.length > 0) {
          await supabaseClient.from('product_images').insert(
            images.map((img: any, index: number) => ({
              product_id: id,
              url: img.url,
              alt_text: img.alt_text,
              is_primary: index === 0 || img.is_primary,
              sort_order: index,
            }))
          );
        }
      }

      // Update variants if provided
      if (variants) {
        await supabaseClient.from('product_variants').delete().eq('product_id', id);
        if (variants.length > 0) {
          await supabaseClient.from('product_variants').insert(
            variants.map((v: any) => ({
              product_id: id,
              color: v.color,
              size: v.size,
              stock: v.stock || 0,
            }))
          );
        }
      }

      return new Response(JSON.stringify(product), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /products/:id - Delete product (admin only)
    if (method === 'DELETE' && path.startsWith('/')) {
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

      if (!profile || !['admin', 'owner'].includes(profile.role)) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const id = path.slice(1);
      const { error } = await supabaseClient.from('products').delete().eq('id', id);
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