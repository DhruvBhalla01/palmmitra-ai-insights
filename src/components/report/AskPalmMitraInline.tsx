import { Sparkles, ArrowUpRight } from 'lucide-react';

interface Props {
  question: string;
  seed: string;
  onAsk: (seed: string, source: string) => void;
  source: string;
}

/**
 * Inline contextual CTA rendered inside report sections.
 * Renders nothing unless the report is unlocked (parent decides).
 */
export function AskPalmMitraInline({ question, seed, onAsk, source }: Props) {
  return (
    <div className="group relative my-8 overflow-hidden rounded-2xl">
      {/* Layered luxury surface */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--indigo-deep))] via-[hsl(var(--indigo-deep))] to-[hsl(240_45%_12%)]" />
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--gold)/0.18),transparent_55%),radial-gradient(circle_at_100%_100%,hsl(var(--gold)/0.10),transparent_50%)]" />
      {/* Hairline gold border */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[hsl(var(--gold)/0.28)]" />
      {/* Shimmer sweep on hover */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1400ms] ease-out bg-gradient-to-r from-transparent via-[hsl(var(--gold)/0.12)] to-transparent" />

      <button
        onClick={() => onAsk(seed, source)}
        className="relative w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5"
      >
        {/* Icon medallion */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-[hsl(var(--gold)/0.35)] blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--gold-light))] via-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.5),0_6px_20px_-6px_hsl(var(--gold)/0.6)]">
            <Sparkles className="w-5 h-5 text-[hsl(240_50%_15%)]" strokeWidth={2.25} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[hsl(var(--gold-light))]/90 font-semibold">
            <span className="h-px w-6 bg-gradient-to-r from-[hsl(var(--gold)/0.6)] to-transparent" />
            Continue with PalmMitra AI
          </div>
          <div className="mt-1.5 font-serif text-[17px] sm:text-lg leading-snug text-[hsl(40_33%_95%)]">
            {question}
          </div>
        </div>

        {/* CTA pill */}
        <div className="shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[hsl(240_50%_12%)] bg-gradient-to-b from-[hsl(var(--gold-light))] to-[hsl(var(--gold))] shadow-[0_10px_24px_-10px_hsl(var(--gold)/0.7),inset_0_1px_0_hsl(0_0%_100%/0.55)] transition-transform duration-300 group-hover:-translate-y-0.5">
          Ask PalmMitra AI
          <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </button>
    </div>
  );
}
