import { AI_SUGGESTIONS } from '@/config/ai-pricing';
import { motion } from 'framer-motion';

interface Props {
  onPick: (seed: string, key: string) => void;
  disabled?: boolean;
}

export function AiSuggestionGrid({ onPick, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {AI_SUGGESTIONS.map((s, i) => (
        <motion.button
          key={s.key}
          onClick={() => !disabled && onPick(s.seed, s.key)}
          disabled={disabled}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.35, ease: 'easeOut' }}
          whileHover={disabled ? undefined : { y: -2 }}
          whileTap={disabled ? undefined : { scale: 0.98 }}
          className="group relative rounded-2xl border border-amber-500/15 bg-gradient-to-b from-amber-500/[0.04] to-transparent p-4 sm:p-5 text-left transition-colors hover:border-amber-400/40 hover:bg-amber-500/[0.08] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/60">Ask about</div>
          <div className="mt-1 text-lg font-serif text-amber-100 group-hover:text-amber-50">{s.label}</div>
          <div className="mt-3 h-px w-8 bg-gradient-to-r from-amber-400/60 to-transparent" />
        </motion.button>
      ))}
    </div>
  );
}
