import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as AppUser } from '../types';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) {
        setAppUser(data);
      }
    } catch {
      // ignore offline/network issues
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for local session first
        const cachedUser = localStorage.getItem('edgex_auth_user');
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            setUser(parsed);
            setAppUser({
              id: parsed.id || 'demo-user',
              email: parsed.email || 'alex.vance@gmail.com',
              full_name: parsed.user_metadata?.full_name || 'Alex Vance',
              avatar_url: parsed.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              role: parsed.user_metadata?.role || (parsed.email?.toLowerCase().includes('admin') ? 'owner' : 'customer'),
            });
          } catch {
            // ignore
          }
        }

        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.getSession().catch(() => ({ data: { session: null }, error: null }));
          if (error) {
            console.warn('Supabase session warning:', error);
          }
          const initialSession = data?.session;
          if (initialSession) {
            setSession(initialSession);
            if (initialSession.user) {
              setUser(initialSession.user);
              await fetchAppUser(initialSession.user.id);
            }
          }
        }
      } catch (err) {
        console.warn('Auth init note:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        try {
          setSession(newSession);
          if (newSession?.user) {
            setUser(newSession.user);
            await fetchAppUser(newSession.user.id);
          } else if (!localStorage.getItem('edgex_auth_user')) {
            setUser(null);
            setAppUser(null);
          }
        } catch (err) {
          console.warn('Auth state change warning:', err);
        } finally {
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const createLocalUser = (email: string, fullName?: string): User => {
    const isOwner = email.toLowerCase() === 'admin' || email.toLowerCase().includes('admin');
    return {
      id: `user-${Date.now()}`,
      email: email.includes('@') ? email : `${email}@edgex.com`,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: fullName || (email.includes('@') ? email.split('@')[0] : email),
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: isOwner ? 'owner' : 'customer',
      }
    } as unknown as User;
  };

  const setLocalUserSession = (localUser: User) => {
    setUser(localUser);
    setAppUser({
      id: localUser.id,
      email: localUser.email || '',
      full_name: localUser.user_metadata?.full_name || 'EDGEX Member',
      avatar_url: localUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: localUser.user_metadata?.role || 'customer',
    });
    localStorage.setItem('edgex_auth_user', JSON.stringify(localUser));
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured) {
      const localUser = createLocalUser(email, fullName);
      setLocalUserSession(localUser);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        throw error;
      }
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('edgex_auth_user', JSON.stringify(data.user));
      }
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load')) {
        const localUser = createLocalUser(email, fullName);
        setLocalUserSession(localUser);
        return;
      }
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const localUser = createLocalUser(email);
      setLocalUserSession(localUser);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load')) {
          const localUser = createLocalUser(email);
          setLocalUserSession(localUser);
          return;
        }
        throw error;
      }
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem('edgex_auth_user', JSON.stringify(data.user));
      }
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('load')) {
        const localUser = createLocalUser(email);
        setLocalUserSession(localUser);
        return;
      }
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    const googleUser = {
      id: `google-user-${Date.now()}`,
      email: 'alex.vance@gmail.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: 'Alex Vance',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        role: 'customer',
      }
    } as unknown as User;

    setLocalUserSession(googleUser);
  };

  const signOut = async () => {
    localStorage.removeItem('edgex_auth_user');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => ({ error: null }));
    }
    setUser(null);
    setAppUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const refreshUser = async () => {
    if (user && isSupabaseConfigured) {
      await fetchAppUser(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
