import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Register listener FIRST (Supabase docs pattern)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    user,
    loading,
    async signInWithOtp(email: string, returnTo?: string) {
      if (returnTo) localStorage.setItem('ai_return_to', returnTo);
      // Carry the destination in the link itself so it works even when the
      // email opens in a different browser (e.g. Gmail's in-app browser).
      const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : '';
      return supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback${next}` },
      });
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };
}
