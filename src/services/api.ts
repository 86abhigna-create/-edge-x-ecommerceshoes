import { supabase, supabaseUrl, isSupabaseConfigured } from '../lib/supabase';
import type { Product, CartItem, Order, Review, Category, User, Address, NotificationItem, Coupon } from '../types';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || `${supabaseUrl}/functions/v1`;

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${FUNCTIONS_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Products API
export const productsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    featured?: boolean;
    published?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.featured) searchParams.set('featured', 'true');
    if (params?.published !== undefined) searchParams.set('published', params.published.toString());

    return fetchWithAuth(`/products?${searchParams.toString()}`);
  },

  get: async (id: string) => {
    return fetchWithAuth(`/products/${id}`);
  },

  create: async (product: Partial<Product> & { images?: any[]; variants?: any[] }) => {
    return fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: string, product: Partial<Product> & { images?: any[]; variants?: any[] }) => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Categories API
export const categoriesApi = {
  list: async (showAll = false) => {
    const params = showAll ? '?all=true' : '';
    return fetchWithAuth(`/categories${params}`);
  },

  get: async (id: string) => {
    return fetchWithAuth(`/categories/${id}`);
  },

  create: async (category: Partial<Category>) => {
    return fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  update: async (id: string, category: Partial<Category>) => {
    return fetchWithAuth(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cart API
export const cartApi = {
  get: async () => {
    return fetchWithAuth('/cart');
  },

  add: async (item: {
    product_id: string;
    variant_id?: string;
    quantity?: number;
    selected_size: string;
    selected_color?: string;
  }) => {
    return fetchWithAuth('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  update: async (id: string, quantity: number) => {
    return fetchWithAuth(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  remove: async (id: string) => {
    return fetchWithAuth(`/cart/${id}`, {
      method: 'DELETE',
    });
  },

  clear: async () => {
    return fetchWithAuth('/cart', {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersApi = {
  list: async (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    return fetchWithAuth(`/orders?${searchParams.toString()}`);
  },

  get: async (id: string) => {
    return fetchWithAuth(`/orders/${id}`);
  },

  create: async (order: {
    shipping_address: any;
    billing_address?: any;
    payment_method?: string;
    coupon_code?: string;
    notes?: string;
  }) => {
    return fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  updateStatus: async (id: string, data: {
    status: string;
    tracking_number?: string;
    carrier?: string;
    expected_delivery_date?: string;
    cancel_reason?: string;
  }) => {
    return fetchWithAuth(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Users/Profile API
export const usersApi = {
  getProfile: async () => {
    return fetchWithAuth('/users/me');
  },

  updateProfile: async (data: { full_name?: string; phone?: string; avatar_url?: string }) => {
    return fetchWithAuth('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Addresses
  getAddresses: async () => {
    return fetchWithAuth('/users/me/addresses');
  },

  addAddress: async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    return fetchWithAuth('/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  updateAddress: async (id: string, address: Partial<Address>) => {
    return fetchWithAuth(`/users/me/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  },

  deleteAddress: async (id: string) => {
    return fetchWithAuth(`/users/me/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications: async (unreadOnly = false, limit = 50) => {
    const params = new URLSearchParams();
    if (unreadOnly) params.set('unread', 'true');
    params.set('limit', limit.toString());
    return fetchWithAuth(`/users/me/notifications?${params.toString()}`);
  },

  markNotificationRead: async (id: string) => {
    return fetchWithAuth(`/users/me/notifications/${id}`, {
      method: 'PUT',
    });
  },

  markAllNotificationsRead: async () => {
    return fetchWithAuth('/users/me/notifications', {
      method: 'PUT',
    });
  },

  // Admin
  listUsers: async (params?: { page?: number; limit?: number; role?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.role) searchParams.set('role', params.role);
    return fetchWithAuth(`/users/admin?${searchParams.toString()}`);
  },

  updateUserRole: async (id: string, role: 'customer' | 'owner' | 'admin') => {
    return fetchWithAuth(`/users/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};

// Wishlist API
export const wishlistApi = {
  get: async () => {
    return fetchWithAuth('/wishlist');
  },

  add: async (productId: string) => {
    return fetchWithAuth('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  },

  remove: async (productId: string) => {
    return fetchWithAuth(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },

  clear: async () => {
    return fetchWithAuth('/wishlist', {
      method: 'DELETE',
    });
  },
};

// Reviews API
export const reviewsApi = {
  list: async (productId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('product_id', productId);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return fetchWithAuth(`/reviews?${searchParams.toString()}`);
  },

  create: async (review: {
    product_id: string;
    order_id: string;
    rating: number;
    title?: string;
    comment?: string;
  }) => {
    return fetchWithAuth('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  update: async (id: string, review: { rating?: number; title?: string; comment?: string }) => {
    return fetchWithAuth(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  updateStatus: async (id: string, status: 'Published' | 'Pending' | 'Flagged' | 'Rejected') => {
    return fetchWithAuth(`/reviews/${id}?action=status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Auth API
export const authApi = {
  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Storage API
export const storageApi = {
  uploadImage: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    return data;
  },

  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  deleteImage: async (bucket: string, paths: string[]) => {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
  },
};

// Settings API
export const settingsApi = {
  get: async (keys: string[]) => {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', keys);
    if (error) throw error;
    return data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
  },

  getPublic: async () => {
    return settingsApi.get([
      'site_name',
      'site_description',
      'currency',
      'tax_rate',
      'shipping_rate',
      'free_shipping_threshold',
    ]);
  },
};

export default {
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  orders: ordersApi,
  users: usersApi,
  wishlist: wishlistApi,
  reviews: reviewsApi,
  auth: authApi,
  storage: storageApi,
  settings: settingsApi,
};