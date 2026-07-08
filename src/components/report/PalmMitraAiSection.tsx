import { Sparkles, ArrowRight } from 'lucide-react';
import type { AiEntitlement } from '@/hooks/useAiEntitlement';

interface Props {
  onStart: () => void;
  entitlement?: AiEntitlement;
}

/**
 * End-of-report premium PalmMitra AI section.
 * Only rendered when the report is unlocked.
 */
export function PalmMitraAiSection({ onStart, entitlement }: Props) {
  const remaining = entitlement?.total_remaining ?? 3;
  const isElite = !!entitlement?.has_active_subscription;
  const microcopy = isElite
    ? 'PalmMitra AI Elite active — ask anything, anytime.'
    : remaining > 0
      ? `Includes ${remaining} complimentary AI question${remaining === 1 ? '' : 's'}.`
      : 'Continue with question packs — from ₹149.';

  return (
    <section className="mt-10 rounded-3xl border border-amber-500/25 bg-gradient-to-b from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-6 sm:p-10 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_-20%,rgba(251,191,36,0.25),transparent_60%)]" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-amber-300">
          <Sparkles className="w-3 h-3" /> Included with your report
        </div>
        <h2 className="mt-4 font-serif text-2xl sm:text-3xl md:text-4xl text-foreground">
          Still have questions?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Your Palm Report explains <span className="text-amber-400 font-medium">what</span> your palm reveals.
          PalmMitra AI helps you understand <span className="text-amber-400 font-medium">why</span> it matters and
          <span className="text-amber-400 font-medium"> how</span> to apply it to your life.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          {['Career', 'Business', 'Marriage', 'Relationships', 'Wealth', 'Health', 'Personal Growth', 'Future Decisions'].map(t => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-amber-400" /> {t}
            </span>
          ))}
        </div>

        <button
          onClick={onStart}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-black font-medium px-7 py-3.5 text-base hover:from-amber-200 hover:to-amber-400 transition-all shadow-[0_14px_50px_-14px_rgba(251,191,36,0.55)]"
        >
          Start PalmMitra AI
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="mt-3 text-xs text-muted-foreground">{microcopy}</p>
      </div>
    </section>
  );
}
