import { Sparkles, ArrowRight, ShieldCheck, Clock, Infinity as InfinityIcon } from 'lucide-react';
import type { AiEntitlement } from '@/hooks/useAiEntitlement';

interface Props {
  onStart: () => void;
  entitlement?: AiEntitlement;
}

const TOPICS = [
  'Career', 'Business', 'Marriage', 'Relationships',
  'Wealth', 'Health', 'Personal Growth', 'Future Decisions',
];

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
      ? `${remaining} complimentary question${remaining === 1 ? '' : 's'} included — no card required.`
      : 'Continue with question packs — from ₹149.';

  return (
    <section className="relative mt-12 overflow-hidden rounded-[28px]">
      {/* Deep-navy luxury base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240_55%_10%)] via-[hsl(var(--indigo-deep))] to-[hsl(240_50%_8%)]" />
      {/* Gold radiance */}
      <div className="absolute inset-0 opacity-90 bg-[radial-gradient(ellipse_at_50%_-10%,hsl(var(--gold)/0.28),transparent_55%),radial-gradient(ellipse_at_0%_100%,hsl(var(--gold)/0.10),transparent_50%),radial-gradient(ellipse_at_100%_100%,hsl(var(--gold)/0.08),transparent_50%)]" />
      {/* Hairline gold frame */}
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-[hsl(var(--gold)/0.32)]" />
      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.08)] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--gold-light))] font-semibold backdrop-blur-sm">
          <Sparkles className="w-3 h-3" /> Included with your report
        </div>

        {/* Headline */}
        <h2 className="mt-6 font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-tight text-[hsl(40_33%_96%)]">
          Your palm has spoken.
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[hsl(var(--gold-light))] via-[hsl(var(--gold))] to-[hsl(var(--gold-light))] bg-clip-text text-transparent">
            Now ask it anything.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-[15px] sm:text-base leading-relaxed text-[hsl(40_20%_82%)]">
          Your report reveals <span className="text-[hsl(var(--gold-light))] font-medium">what</span> your palm shows.
          PalmMitra AI reveals <span className="text-[hsl(var(--gold-light))] font-medium">why</span> it matters —
          and <span className="text-[hsl(var(--gold-light))] font-medium">exactly</span> what to do next.
        </p>

        {/* Topic grid */}
        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
          {TOPICS.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--gold)/0.22)] bg-[hsl(240_40%_18%/0.5)] px-3 py-1.5 text-xs text-[hsl(40_25%_85%)] backdrop-blur-sm"
            >
              <span className="h-1 w-1 rounded-full bg-[hsl(var(--gold))] shadow-[0_0_6px_hsl(var(--gold))]" />
              {t}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold text-[hsl(240_50%_12%)] bg-gradient-to-b from-[hsl(var(--gold-light))] via-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] shadow-[0_18px_50px_-14px_hsl(var(--gold)/0.75),inset_0_1px_0_hsl(0_0%_100%/0.55)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 rounded-full bg-[hsl(var(--gold))] opacity-40 blur-xl group-hover:opacity-60 transition-opacity -z-10" />
            {isElite ? 'Open PalmMitra AI Elite' : 'Ask Your First Question — Free'}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
          <p className="text-xs text-[hsl(40_20%_78%)]">{microcopy}</p>
        </div>

        {/* Trust row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[hsl(40_18%_72%)]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[hsl(var(--gold-light))]" />
            Private &amp; encrypted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[hsl(var(--gold-light))]" />
            Answers in seconds
          </span>
          <span className="inline-flex items-center gap-1.5">
            <InfinityIcon className="w-3.5 h-3.5 text-[hsl(var(--gold-light))]" />
            Trained on your reading
          </span>
        </div>
      </div>
    </section>
  );
}
