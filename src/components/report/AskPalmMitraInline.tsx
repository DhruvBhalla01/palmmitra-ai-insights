import { MessageCircle } from 'lucide-react';

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
    <div className="my-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.03] to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/70">Continue with PalmMitra AI</div>
        <div className="mt-1 text-sm sm:text-base text-foreground/85 font-medium">{question}</div>
      </div>
      <button
        onClick={() => onAsk(seed, source)}
        className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-black px-4 py-2 text-sm font-medium hover:from-amber-200 hover:to-amber-400 transition-all shadow-[0_6px_20px_-6px_rgba(251,191,36,0.5)]"
      >
        <MessageCircle className="w-4 h-4" />
        Ask PalmMitra AI
      </button>
    </div>
  );
}
