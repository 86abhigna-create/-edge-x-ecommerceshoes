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
    const path = url.pathname.replace('/functions/v1/orders', '');
    const method = req.method;

    // GET /orders - List user's orders (or all orders for admin)
    if (method === 'GET' && (path === '' || path === '/')) {
      const searchParams = url.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');

      let query = supabaseClient
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, image:product_images(url))
          )
        `, { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      if (status) {
        query = query.eq('status', status);
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

    // GET /orders/:id - Get single order
    if (method === 'GET' && path.startsWith('/')) {
      const id = path.slice(1);
      
      let query = supabaseClient
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, image:product_images(url))
          )
        `)
        .eq('id', id);

      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(JSON.stringify({ error: 'Order not found' }), {
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

    // POST /orders - Create order from cart
    if (method === 'POST' && (path === '' || path === '/')) {
      const body = await req.json();
      const { shipping_address, billing_address, payment_method, coupon_code, notes } = body;

      // Get user's cart
      const { data: cartItems, error: cartError } = await supabaseClient
        .from('cart_items')
        .select(`
          *,
          product:products(id, name, price, discount_percent, image:product_images(url), stock_count, in_stock),
          variant:product_variants(id, color, size, stock)
        `)
        .eq('user_id', user.id);

      if (cartError) throw cartError;
      if (!cartItems || cartItems.length === 0) {
        return new Response(JSON.stringify({ error: 'Cart is empty' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Get user's default address if not provided
      let finalShippingAddress = shipping_address;
      if (!finalShippingAddress) {
        const { data: defaultAddress } = await supabaseClient
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'shipping')
          .eq('is_default', true)
          .single();
        if (defaultAddress) {
          finalShippingAddress = {
            full_name: defaultAddress.full_name,
            phone: defaultAddress.phone,
            street: defaultAddress.street,
            apartment: defaultAddress.apartment,
            city: defaultAddress.city,
            state: defaultAddress.state,
            zip: defaultAddress.zip,
            country: defaultAddress.country,
          };
        }
      }

      if (!finalShippingAddress) {
        return new Response(JSON.stringify({ error: 'Shipping address required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of cartItems) {
        const price = item.product.price * (1 - (item.product.discount_percent || 0) / 100);
        const itemTotal = Math.round(price * item.quantity);
        subtotal += itemTotal;

        // Check stock
        const availableStock = item.variant?.stock ?? item.product.stock_count;
        if (availableStock < item.quantity) {
          return new Response(JSON.stringify({ 
            error: `Insufficient stock for ${item.product.name}` 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        orderItems.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_name: item.product.name,
          product_image: item.product.image?.[0]?.url,
          price: Math.round(price),
          quantity: item.quantity,
          selected_size: item.selected_size,
          selected_color: item.selected_color,
          total: itemTotal,
        });
      }

      // Apply coupon if provided
      let discountAmount = 0;
      if (coupon_code) {
        const { data: coupon } = await supabaseClient
          .from('coupons')
          .select('*')
          .eq('code', coupon_code)
          .eq('is_active', true)
          .lte('valid_from', new Date().toISOString())
          .or('valid_until.is.null,valid_until.gte.' + new Date().toISOString())
          .single();

        if (coupon) {
          const { count: usageCount } = await supabaseClient
            .from('coupon_usages')
            .select('*', { count: 'exact', head: true })
            .eq('coupon_id', coupon.id)
            .eq('user_id', user.id);

          if (usageCount && usageCount >= (coupon.per_user_limit || 1)) {
            return new Response(JSON.stringify({ error: 'Coupon usage limit exceeded' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            });
          }

          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * coupon.discount_value / 100);
            if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
              discountAmount = coupon.max_discount_amount;
            }
          } else {
            discountAmount = coupon.discount_value;
          }

          if (subtotal < (coupon.min_order_amount || 0)) {
            return new Response(JSON.stringify({ error: 'Minimum order amount not met' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            });
          }
        }
      }

      const taxRate = 0.08; // 8% tax
      const taxAmount = Math.round(subtotal * taxRate);
      const shippingAmount = subtotal > 10000 ? 0 : 1500; // Free shipping over $100
      const total = subtotal + taxAmount + shippingAmount - discountAmount;

      // Generate order number
      const { data: orderNumber } = await supabaseClient.rpc('generate_order_number');

      // Create order
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          discount_amount: discountAmount,
          total,
          payment_method: payment_method || 'card',
          shipping_address: finalShippingAddress,
          billing_address: billing_address || finalShippingAddress,
          notes,
          status: 'Order Placed',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabaseClient
        .from('order_items')
        .insert(orderItems.map(item => ({ ...item, order_id: order.id })));

      if (itemsError) throw itemsError;

      // Record coupon usage
      if (coupon_code && discountAmount > 0) {
        const { data: coupon } = await supabaseClient
          .from('coupons')
          .select('id')
          .eq('code', coupon_code)
          .single();

        if (coupon) {
          await supabaseClient.from('coupon_usages').insert({
            coupon_id: coupon.id,
            user_id: user.id,
            order_id: order.id,
            discount_amount: discountAmount,
          });

          await supabaseClient.rpc('increment_coupon_usage', { coupon_id: coupon.id });
        }
      }

      // Clear cart
      await supabaseClient.from('cart_items').delete().eq('user_id', user.id);

      // Create notification
      await supabaseClient.from('notifications').insert({
        user_id: user.id,
        type: 'order_created',
        title: 'Order Placed Successfully',
        message: `Your order ${orderNumber} has been placed.`,
        data: { order_id: order.id, order_number: orderNumber },
      });

      return new Response(JSON.stringify(order), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // PUT /orders/:id - Update order status (admin only)
    if (method === 'PUT' && path.startsWith('/')) {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }

      const id = path.slice(1);
      const body = await req.json();
      const { status, tracking_number, carrier, expected_delivery_date, cancel_reason } = body;

      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (tracking_number) updateData.tracking_number = tracking_number;
      if (carrier) updateData.carrier = carrier;
      if (expected_delivery_date) updateData.expected_delivery_date = expected_delivery_date;
      if (status === 'Delivered') updateData.delivered_at = new Date().toISOString();
      if (status === 'Cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancel_reason = cancel_reason;
      }

      const { data, error } = await supabaseClient
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create notification for user
      await supabaseClient.from('notifications').insert({
        user_id: data.user_id,
        type: 'order_status_update',
        title: 'Order Status Updated',
        message: `Your order ${data.order_number} is now ${status}.`,
        data: { order_id: data.id, status },
      });

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