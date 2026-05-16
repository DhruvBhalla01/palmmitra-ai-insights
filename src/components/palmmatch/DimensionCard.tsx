import { motion } from 'framer-motion';
import { LucideIcon, Lock, ArrowRight, Star } from 'lucide-react';
import { CompatibilityDimension } from './types';

type DimensionKey = 'communication' | 'lifeGoals' | 'romance' | 'spiritualAlignment';

const DIMENSION_COLORS: Record<DimensionKey, {
  from: string; to: string; glow: string; border: string; bg: string; label: string;
}> = {
  communication: {
    from: 'hsl(200 85% 55%)', to: 'hsl(170 70% 50%)',
    glow: 'hsl(200 85% 55% / 0.3)', border: 'hsl(200 85% 55% / 0.35)',
    bg: 'hsl(200 85% 55% / 0.06)', label: 'Communication',
  },
  lifeGoals: {
    from: 'hsl(145 60% 50%)', to: 'hsl(42 87% 55%)',
    glow: 'hsl(145 60% 50% / 0.3)', border: 'hsl(145 60% 50% / 0.35)',
    bg: 'hsl(145 60% 50% / 0.06)', label: 'Life Goals',
  },
  romance: {
    from: 'hsl(320 70% 60%)', to: 'hsl(270 60% 65%)',
    glow: 'hsl(320 70% 60% / 0.3)', border: 'hsl(320 70% 60% / 0.35)',
    bg: 'hsl(320 70% 60% / 0.06)', label: 'Romance',
  },
  spiritualAlignment: {
    from: 'hsl(270 60% 55%)', to: 'hsl(245 58% 45%)',
    glow: 'hsl(270 60% 55% / 0.3)', border: 'hsl(270 60% 55% / 0.35)',
    bg: 'hsl(270 60% 55% / 0.06)', label: 'Spiritual',
  },
};

interface DimensionCardProps {
  dimension: CompatibilityDimension;
  icon: LucideIcon;
  dimensionKey: DimensionKey;
  isUnlocked: boolean;
  isPreview?: boolean;
  onUnlockClick: () => void;
  delay?: number;
  teaser: string;
}

function ScoreBar({ score, gradientFrom, gradientTo }: {
  score: number;
  gradientFrom?: string;
  gradientTo?: string;
}) {
  const defaultFrom = score >= 80 ? '#4ade80' : score >= 65 ? 'hsl(42,87%,55%)' : '#f59e0b';
  const defaultTo   = score >= 80 ? '#86efac' : score >= 65 ? 'hsl(42,90%,72%)' : '#fcd34d';
  const from = gradientFrom ?? defaultFrom;
  const to   = gradientTo   ?? defaultTo;

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </div>
      <span className="text-sm font-bold w-10 text-right tabular-nums" style={{ color: from }}>
        {score}%
      </span>
    </div>
  );
}

export function DimensionCard({
  dimension,
  icon: Icon,
  dimensionKey,
  isUnlocked,
  isPreview = false,
  onUnlockClick,
  delay = 0,
  teaser,
}: DimensionCardProps) {
  const colors = DIMENSION_COLORS[dimensionKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative h-full"
    >
      {isUnlocked || isPreview ? (
        /* ── Unlocked State — 3D hover + dimension colors ── */
        <motion.div
          whileHover={{ rotateX: 3, rotateY: -4, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ transformStyle: 'preserve-3d', perspective: 800 }}
          className="glass-premium rounded-2xl p-6 h-full flex flex-col relative overflow-hidden"
        >
          {/* Left accent bar in dimension color */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: `linear-gradient(180deg, ${colors.from}, ${colors.to})` }}
          />

          <div className="flex items-start gap-3 mb-3 pl-2">
            {/* Icon with dimension gradient + glow */}
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${colors.from}25, ${colors.to}12)`,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 0 16px ${colors.glow}`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: colors.from }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-foreground text-sm leading-tight">
                {dimension.title}
              </h3>
            </div>
          </div>

          <div className="pl-2">
            <ScoreBar score={dimension.score} gradientFrom={colors.from} gradientTo={colors.to} />
            <p className="text-sm text-foreground/80 leading-relaxed mb-3 flex-1">{dimension.text}</p>
            <div
              className="p-3 rounded-xl border"
              style={{
                background: colors.bg,
                borderColor: colors.border,
              }}
            >
              <p className="text-xs font-medium italic leading-relaxed" style={{ color: colors.from }}>
                ✦ {dimension.guidance}
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── Locked State — dimension color + gradient CTA ── */
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="relative h-full min-h-[240px] rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${colors.border}` }}
        >
          {/* Blurred content hint — dimension-tinted */}
          <div
            className="absolute inset-0 p-5 select-none pointer-events-none"
            style={{ filter: 'blur(5px)', opacity: 0.22, background: colors.bg }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: colors.bg }}>
                <Icon className="w-4 h-4" style={{ color: colors.from }} />
              </div>
              <h3 className="font-serif font-semibold text-foreground text-sm leading-tight">
                {dimension.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-3/5 rounded-full"
                     style={{ background: `linear-gradient(90deg, ${colors.from}60, ${colors.to}30)` }} />
              </div>
              <span className="text-sm font-bold w-10 text-right" style={{ color: `${colors.from}50` }}>??%</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-foreground/10 rounded w-full" />
              <div className="h-2 bg-foreground/10 rounded w-4/5" />
              <div className="h-2 bg-foreground/10 rounded w-3/5" />
            </div>
          </div>

          {/* Dimension-colored top gradient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${colors.from}20 0%, transparent 55%, hsl(var(--background) / 0.88) 100%)`,
            }}
          />

          {/* Lock overlay centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 py-5 text-center">
            {/* Pulsing lock icon with dimension color ring */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [`0 0 0px ${colors.glow}`, `0 0 28px ${colors.glow}`, `0 0 0px ${colors.glow}`],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="rounded-full flex items-center justify-center mb-3"
              style={{
                width: 58, height: 58,
                background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}10)`,
                border: `1.5px solid ${colors.border}`,
              }}
            >
              <Lock className="w-5 h-5" style={{ color: colors.from }} />
            </motion.div>

            <p
              className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1.5"
              style={{ color: colors.from }}
            >
              {colors.label}
            </p>

            <p className="text-xs text-foreground/80 leading-relaxed mb-4 max-w-[180px] italic">
              {teaser}
            </p>

            {/* Gradient CTA in dimension color */}
            <button
              onClick={onUnlockClick}
              className="relative overflow-hidden rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                boxShadow: `0 4px 20px ${colors.glow}`,
              }}
            >
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3" />
                Reveal Score
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            <p className="text-[9px] text-muted-foreground mt-2 uppercase tracking-wider">Unlock all 4 →</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
