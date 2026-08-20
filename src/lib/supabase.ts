import { createClient } from '@supabase/supabase-js';

function getValidSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return 'https://placeholder-project.supabase.co';
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith('YOUR_') || trimmed.startsWith('<')) {
    return 'https://placeholder-project.supabase.co';
  }
  
  let formatted = trimmed;
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `https://${formatted}`;
  }
  
  try {
    const parsed = new URL(formatted);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    // Fall through to fallback
  }
  return 'https://placeholder-project.supabase.co';
}

function getValidSupabaseKey(rawKey?: string): string {
  if (!rawKey || typeof rawKey !== 'string') {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock_key';
  }
  const trimmed = rawKey.trim();
  if (!trimmed || trimmed.startsWith('YOUR_') || trimmed.startsWith('<')) {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock_key';
  }
  return trimmed;
}

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  getValidSupabaseUrl(import.meta.env.VITE_SUPABASE_URL) !== 'https://placeholder-project.supabase.co' &&
  getValidSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY) !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock_key'
);

export const supabaseUrl = getValidSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
export const supabaseAnonKey = getValidSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.warn('[Supabase] Operating with offline fallback client (missing or placeholder Supabase credentials)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: isSupabaseConfigured,
    persistSession: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
  },
});

export const createServerClient = () => {
  const serviceKey = getValidSupabaseKey(import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Type declarations for Vite's ImportMetaEnv
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string;
    readonly VITE_SUPABASE_FUNCTIONS_URL: string;
    readonly VITE_APP_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
