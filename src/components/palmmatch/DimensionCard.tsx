import { motion } from 'framer-motion';
import { LucideIcon, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompatibilityDimension } from './types';

interface DimensionCardProps {
  dimension: CompatibilityDimension;
  icon: LucideIcon;
  isUnlocked: boolean;
  isPreview?: boolean;
  onUnlockClick: () => void;
  delay?: number;
  teaser: string;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? '#4ade80' : score >= 65 ? 'hsl(42,87%,55%)' : '#f59e0b';
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        />
      </div>
      <span className="text-sm font-bold w-10 text-right tabular-nums" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

export function DimensionCard({
  dimension,
  icon: Icon,
  isUnlocked,
  isPreview = false,
  onUnlockClick,
  delay = 0,
  teaser,
}: DimensionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative h-full"
    >
      {isUnlocked || isPreview ? (
        <div className="glass-premium gradient-border rounded-2xl p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-serif font-bold text-foreground text-sm leading-tight flex-1">
              {dimension.title}
            </h3>
          </div>
          <ScoreBar score={dimension.score} />
          <p className="text-sm text-foreground/80 leading-relaxed mb-3 flex-1">{dimension.text}</p>
          <p className="text-xs text-accent font-medium italic border-t border-accent/10 pt-3">
            {dimension.guidance}
          </p>
        </div>
      ) : (
        <div className="glass-premium rounded-2xl h-full border border-accent/10 relative overflow-hidden min-h-[200px]">
          {/* Visible header */}
          <div className="p-5 pb-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-accent/60" />
              </div>
              <h3 className="font-serif font-semibold text-foreground/60 text-sm">{dimension.title}</h3>
            </div>
            {/* Fake blurred bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-accent/20 to-accent/5" />
              </div>
              <span className="text-sm font-bold text-foreground/20 w-10 text-right">??%</span>
            </div>
          </div>

          {/* Lock overlay — blurs everything below */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/55 backdrop-blur-[3px] rounded-2xl px-5 py-4 text-center">
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center mb-3 shadow-gold"
            >
              <Lock className="w-5 h-5 text-accent" />
            </motion.div>
            <p className="text-xs text-foreground/75 leading-relaxed mb-4 max-w-[190px]">{teaser}</p>
            <Button
              onClick={onUnlockClick}
              className="btn-gold rounded-xl px-5 py-2.5 text-xs gap-1.5 h-auto"
            >
              Reveal Score
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
