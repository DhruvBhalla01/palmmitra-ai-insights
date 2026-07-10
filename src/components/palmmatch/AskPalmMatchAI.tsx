import { useState } from 'react';
import { m } from '@/lib/m';
import { Sparkles, Send, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  person1Name: string;
  person2Name: string;
  isUnlocked: boolean;
  onUnlockClick: () => void;
}

const SUGGESTIONS = [
  'Who compromises more in this relationship?',
  'How can we improve communication?',
  'What does the palm say about our marriage timing?',
  'How do our families align?',
  'What is the best way to resolve conflicts?',
  'What does our long-term future look like?',
];

export function AskPalmMatchAI({ person1Name, person2Name, isUnlocked, onUnlockClick }: Props) {
  const [q, setQ] = useState('');
  const { toast } = useToast();

  const handleAsk = (question: string) => {
    if (!isUnlocked) {
      onUnlockClick();
      return;
    }
    toast({
      title: 'PalmMatch AI is preparing your answer',
      description: 'Your personalised reply will arrive by email within 2 hours.',
    });
    setQ('');
  };

  return (
    <m.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-10"
      aria-label="Ask PalmMatch AI"
    >
      <div
        className="glass-premium rounded-3xl border border-accent/20 relative overflow-hidden"
        style={{ boxShadow: '0 20px 60px hsl(245 58% 15% / 0.2)' }}
      >
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55% / 0.7), transparent)' }} />

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, hsl(42 87% 55% / 0.06), transparent)' }} />

        <div className="relative p-6 md:p-8">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-3">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-semibold text-accent tracking-widest uppercase">Continue The Conversation</span>
            </div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-1.5">
              Ask <span className="text-gradient-gold">PalmMatch AI</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Your personal relationship guide for {person1Name} & {person2Name}
            </p>
          </div>

          {/* Suggested questions */}
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {SUGGESTIONS.map((s, i) => (
              <m.button
                key={s}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleAsk(s)}
                className="text-[11px] md:text-xs px-3 py-1.5 rounded-full border border-accent/20 bg-accent/[0.04] text-foreground/80 hover:bg-accent/10 hover:border-accent/40 transition-colors"
              >
                {s}
              </m.button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!q.trim()) return;
              handleAsk(q.trim());
            }}
            className="relative max-w-lg mx-auto"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isUnlocked ? `Ask anything about ${person1Name} & ${person2Name}…` : 'Unlock to ask PalmMatch AI…'}
              disabled={!isUnlocked}
              className="w-full rounded-2xl bg-background/60 border border-accent/25 pl-4 pr-14 py-3.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent/60 disabled:opacity-70"
            />
            <button
              type="submit"
              aria-label={isUnlocked ? 'Send question' : 'Unlock to ask'}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl btn-gold flex items-center justify-center"
            >
              {isUnlocked ? <Send className="w-4 h-4 text-foreground" /> : <Lock className="w-4 h-4 text-foreground" />}
            </button>
          </form>

          {!isUnlocked && (
            <p className="text-[11px] text-center text-muted-foreground mt-3">
              PalmMatch AI is included with your full compatibility unlock.
            </p>
          )}
        </div>
      </div>
    </m.section>
  );
}
