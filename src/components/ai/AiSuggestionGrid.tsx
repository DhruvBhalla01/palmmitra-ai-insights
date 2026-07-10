import { AI_SUGGESTIONS } from '@/config/ai-pricing';
import { m } from '@/lib/motion';
import { Briefcase, Heart, Coins, User, Users, Rocket, Activity, Compass } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  career: Briefcase,
  marriage: Heart,
  money: Coins,
  personality: User,
  family: Users,
  business: Rocket,
  health: Activity,
  purpose: Compass,
};

interface Props {
  onPick: (seed: string, key: string) => void;
  disabled?: boolean;
}

export function AiSuggestionGrid({ onPick, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {AI_SUGGESTIONS.map((s, i) => {
        const Icon = ICONS[s.key];
        return (
          <m.button
            key={s.key}
            onClick={() => !disabled && onPick(s.seed, s.key)}
            disabled={disabled}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={disabled ? undefined : { y: -1 }}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            className="group inline-flex items-center gap-2 rounded-full border border-[hsl(var(--gold)/0.25)] bg-[linear-gradient(135deg,hsl(var(--gold)/0.06),hsl(245_58%_10%/0.5))] px-4 py-2 text-sm text-foreground/85 transition-all backdrop-blur-sm
              hover:border-[hsl(var(--gold)/0.6)] hover:text-foreground hover:shadow-[0_6px_24px_-8px_hsl(var(--gold)/0.5)]
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {Icon && <Icon className="w-3.5 h-3.5 text-[hsl(var(--gold-light))] group-hover:text-[hsl(var(--gold))] transition-colors" strokeWidth={1.75} />}
            <span className="tracking-wide">{s.label}</span>
          </m.button>
        );
      })}
    </div>
  );
}
