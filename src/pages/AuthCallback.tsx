import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PremiumBackground } from '@/components/PremiumBackground';
import { SEO } from '@/components/SEO';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const getReturnTo = () => {
      const param = new URLSearchParams(window.location.search).get('next');
      const stored = localStorage.getItem('ai_return_to');
      localStorage.removeItem('ai_return_to');
      const rt = param || stored;
      // Only allow same-site paths
      return rt && rt.startsWith('/') && !rt.startsWith('//') ? rt : '/';
    };
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      navigate(getReturnTo(), { replace: true });
    };
    // Supabase handles the hash automatically; wait for the session.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) go();
    });
    // If already signed in on load
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <SEO
        title="Signing in — PalmMitra"
        description="Completing your secure PalmMitra sign-in."
        path="/auth/callback"
        noindex
      />
      <PremiumBackground />
      <div className="relative z-10 text-center">
        <div className="text-amber-200/90 text-lg tracking-wide">Signing you in…</div>
        <div className="mt-3 text-amber-100/50 text-sm">This takes just a moment.</div>
      </div>
    </div>
  );
}
