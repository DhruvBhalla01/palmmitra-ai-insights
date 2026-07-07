import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PremiumBackground } from '@/components/PremiumBackground';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the hash automatically; wait for the session.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        const rt = localStorage.getItem('ai_return_to');
        localStorage.removeItem('ai_return_to');
        navigate(rt || '/', { replace: true });
      }
    });
    // If already signed in on load
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const rt = localStorage.getItem('ai_return_to');
        localStorage.removeItem('ai_return_to');
        navigate(rt || '/', { replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <PremiumBackground />
      <div className="relative z-10 text-center">
        <div className="text-amber-200/90 text-lg tracking-wide">Signing you in…</div>
        <div className="mt-3 text-amber-100/50 text-sm">This takes just a moment.</div>
      </div>
    </div>
  );
}
