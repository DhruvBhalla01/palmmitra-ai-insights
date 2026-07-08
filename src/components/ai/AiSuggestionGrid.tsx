import { AI_SUGGESTIONS } from '@/config/ai-pricing';
import { motion } from 'framer-motion';

interface Props {
  onPick: (seed: string, key: string) => void;
  disabled?: boolean;
}

export function AiSuggestionGrid({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {AI_SUGGESTIONS.map((s, i) => (
        <motion.button
          key={s.key}
          onClick={() => !disabled && onPick(s.seed, s.key)}
          disabled={disabled}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.035, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          whileHover={disabled ? undefined : { y: -1 }}
          whileTap={disabled ? undefined : { scale: 0.97 }}
          className="group rounded-full border border-[hsl(var(--gold)/0.25)] bg-[hsl(var(--gold)/0.05)] px-4 py-2 text-sm text-foreground/85 transition-all
            hover:border-[hsl(var(--gold)/0.6)] hover:bg-[hsl(var(--gold)/0.12)] hover:text-foreground hover:shadow-[0_0_20px_-4px_hsl(var(--gold)/0.4)]
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {s.label}
        </motion.button>
      ))}
    </div>
  );
}
