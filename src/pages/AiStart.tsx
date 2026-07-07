import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, MessageCircle, Infinity as InfinityIcon } from 'lucide-react';
import { PremiumBackground } from '@/components/PremiumBackground';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { AiSignInModal } from '@/components/ai/AiSignInModal';
import { useAuth } from '@/hooks/useAuth';
import { track } from '@/lib/analytics';

export default function AiStart() {
  const navigate = useNavigate();
  const { reportId = '' } = useParams();
  const { user, loading } = useAuth();
  const [signIn, setSignIn] = useState(false);

  const prefill = typeof window !== 'undefined'
    ? (JSON.parse(localStorage.getItem('palm_data') || '{}').email ?? '')
    : '';

  const start = () => {
    track('ai_started', { reportId, entry: 'transition' });
    if (!user) { setSignIn(true); return; }
    navigate(`/ai/${reportId}`);
  };

  return (
    <div className="min-h-screen relative bg-[#050302] text-amber-50 overflow-hidden">
      <PremiumBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 pt-16 sm:pt-24 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-amber-200">
              <Sparkles className="w-3 h-3" /> Your Palm Report is Complete
            </div>
            <h1 className="mt-6 font-serif text-4xl sm:text-6xl leading-[1.05] text-amber-100">
              Continue with <span className="bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">PalmMitra AI</span>
            </h1>
            <p className="mt-6 text-amber-100/70 text-lg max-w-xl mx-auto leading-relaxed">
              I already understand your palm analysis. Now ask me anything about your career, relationships, wealth, life, future, or personal growth.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-5 max-w-xl mx-auto">
              <Feature icon={<Brain className="w-5 h-5" />} title="Report-aware" copy="Knows your palm" />
              <Feature icon={<MessageCircle className="w-5 h-5" />} title="3 free questions" copy="Included in your report" />
              <Feature icon={<InfinityIcon className="w-5 h-5" />} title="Grows with you" copy="Guidance for life" />
            </div>

            <Button
              onClick={start}
              disabled={loading}
              size="lg"
              className="mt-12 h-14 px-10 text-base bg-gradient-to-b from-amber-300 to-amber-500 text-black hover:from-amber-200 hover:to-amber-400 font-medium shadow-[0_20px_60px_-15px_rgba(251,191,36,0.5)]"
            >
              Start My AI Guidance <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-4 text-xs text-amber-100/40">
              Free · No credit card · 3 complimentary AI questions
            </p>
          </motion.div>
        </div>
      </div>
      <AiSignInModal
        open={signIn}
        onOpenChange={setSignIn}
        returnTo={`/ai/${reportId}`}
        prefillEmail={prefill}
      />
    </div>
  );
}

function Feature({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-amber-500/15 bg-black/30 backdrop-blur-sm p-4">
      <div className="mx-auto w-9 h-9 rounded-full bg-amber-500/10 text-amber-300 flex items-center justify-center">{icon}</div>
      <div className="mt-2 text-sm font-medium text-amber-100">{title}</div>
      <div className="text-[11px] text-amber-100/50">{copy}</div>
    </div>
  );
}
