import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as AppUser } from '../types';

export interface GoogleAccountDetails {
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: 'customer' | 'owner';
}

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (selectedAccount?: GoogleAccountDetails) => Promise<{ role: 'customer' | 'owner'; email: string; name: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const OWNER_EMAILS = ['neravatiabhigna@gmail.com', 'neravatiabhigna29@gmail.com'];
export const OWNER_PASSWORD = 'Bhuvi@2006';

export const isOwnerEmail = (email?: string) => {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.trim().toLowerCase());
};

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
    const isOwner = isOwnerEmail(email);
    return {
      id: isOwner ? 'owner-neravatiabhigna' : `user-${Date.now()}`,
      email: email.includes('@') ? email : `${email}@edgex.com`,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: isOwner ? 'Neravati Abhigna (Owner)' : (fullName || (email.includes('@') ? email.split('@')[0] : email)),
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
    const cleanEmail = email.trim().toLowerCase();
    const isOwner = isOwnerEmail(cleanEmail);

    if (isOwner && password !== OWNER_PASSWORD) {
      throw new Error(`Owner account registration requires authorized master credentials.`);
    }

    if (!isSupabaseConfigured) {
      const localUser = createLocalUser(email, isOwner ? 'Neravati Abhigna' : fullName);
      setLocalUserSession(localUser);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: isOwner ? 'Neravati Abhigna (Owner)' : fullName, role: isOwner ? 'owner' : 'customer' } },
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
        const localUser = createLocalUser(email, isOwner ? 'Neravati Abhigna' : fullName);
        setLocalUserSession(localUser);
        return;
      }
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isOwner = isOwnerEmail(cleanEmail);

    if (isOwner) {
      if (password !== OWNER_PASSWORD) {
        throw new Error('Invalid password for Owner account. Access denied.');
      }
      const localUser = createLocalUser(cleanEmail, 'Neravati Abhigna');
      setLocalUserSession(localUser);
      return;
    }

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

  const signInWithGoogle = async (selectedAccount?: GoogleAccountDetails): Promise<{ role: 'customer' | 'owner'; email: string; name: string }> => {
    const email = selectedAccount?.email?.trim() || 'neravatiabhigna29@gmail.com';
    const isOwner = isOwnerEmail(email);
    const role: 'customer' | 'owner' = isOwner ? 'owner' : (selectedAccount?.role || 'customer');
    const defaultName = isOwner ? 'Neravati Abhigna (Owner)' : (email.includes('@') ? email.split('@')[0] : 'Google User');
    const name = selectedAccount?.name || defaultName;
    const avatarUrl = selectedAccount?.avatarUrl || (isOwner 
      ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

    const googleUser = {
      id: isOwner ? 'owner-neravatiabhigna' : `google-user-${Date.now()}`,
      email: email,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: name,
        avatar_url: avatarUrl,
        provider: 'google',
        role: role,
      }
    } as unknown as User;

    setLocalUserSession(googleUser);
    return { role, email, name };
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
