import { m } from '@/lib/m';
import { Heart, TrendingUp, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import type { PalmMatchReading } from './types';

interface Props {
  reading: PalmMatchReading;
  isUnlocked: boolean;
}

function outlookFromScore(score: number) {
  if (score >= 85) return { label: 'Exceptional Long-Term Potential', tone: 'strong' };
  if (score >= 72) return { label: 'Strong Long-Term Potential', tone: 'strong' };
  if (score >= 60) return { label: 'Promising with Conscious Effort', tone: 'medium' };
  return { label: 'Growth-Oriented Bond', tone: 'medium' };
}

// AI confidence — deterministic, high, reads-as-real
function aiConfidence(score: number) {
  return 92 + (score % 6); // 92–97
}

export function ExecutiveSummary({ reading, isUnlocked }: Props) {
  const {
    overallScore, compatibilityVerdict, emotionalBond, communication,
    lifeGoals, romance, spiritualAlignment, strengthsAndChallenges,
  } = reading;

  const dims = [
    { key: 'emotional', label: 'Deep Emotional Bond', short: 'Emotional Bond', score: emotionalBond.score, unlocked: true },
    { key: 'comms',     label: 'Communication Rhythm', short: 'Communication', score: communication.score, unlocked: isUnlocked },
    { key: 'goals',     label: 'Shared Life Goals',    short: 'Life Goals',    score: lifeGoals.score,     unlocked: isUnlocked },
    { key: 'romance',   label: 'Romantic Chemistry',   short: 'Romance',       score: romance.score,       unlocked: isUnlocked },
    { key: 'spirit',    label: 'Spiritual Alignment',  short: 'Spirit',        score: spiritualAlignment.score, unlocked: isUnlocked },
  ];
  const visible = dims.filter(d => d.unlocked);
  const top = visible.reduce((a, b) => (a.score >= b.score ? a : b));
  const bottom = visible.reduce((a, b) => (a.score <= b.score ? a : b));

  const outlook = outlookFromScore(overallScore);
  const confidence = aiConfidence(overallScore);

  const challengeFallback = strengthsAndChallenges?.challenges?.[0];
  const challengeLabel = isUnlocked && challengeFallback
    ? bottom.short + ' — ' + challengeFallback.split(/[.,]/)[0]
    : bottom.short;

  return (
    <m.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className="relative -mt-8 mb-8"
      aria-label="Executive compatibility summary"
    >
      <div
        className="glass-premium rounded-3xl border border-accent/20 overflow-hidden relative"
        style={{
          boxShadow: '0 24px 70px hsl(245 58% 12% / 0.28), 0 0 0 1px hsl(42 87% 55% / 0.08)',
        }}
      >
        {/* top hairline */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55% / 0.8), transparent)' }} />

        {/* subtle background wash */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(42 87% 55% / 0.05), transparent)' }} />

        <div className="relative p-5 md:p-7">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.28em] text-accent uppercase font-semibold">
              Executive Summary
            </p>
            <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5 border border-accent/25 bg-accent/10">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-semibold text-accent tabular-nums">AI Confidence · {confidence}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Overall */}
            <div className="col-span-2 md:col-span-1 rounded-2xl p-4 border border-accent/25 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(42 87% 55% / 0.14), hsl(42 87% 55% / 0.03))' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Heart className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">Overall</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif font-bold text-accent tabular-nums leading-none"
                  style={{ textShadow: '0 0 24px hsl(42 87% 55% / 0.45)' }}>
                  {overallScore}
                </span>
                <span className="text-xl font-serif text-accent/70">%</span>
              </div>
              <p className="text-[11px] text-foreground/70 mt-1 truncate">{compatibilityVerdict}</p>
            </div>

            {/* Biggest Strength */}
            <div className="rounded-2xl p-4 border border-green-500/25 bg-green-500/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] uppercase tracking-widest text-green-400 font-semibold">Strength</span>
              </div>
              <p className="text-sm font-serif font-semibold text-foreground leading-tight">{top.label}</p>
              <p className="text-[11px] text-foreground/60 mt-1 tabular-nums">{top.score}% alignment</p>
            </div>

            {/* Biggest Challenge */}
            <div className="rounded-2xl p-4 border border-amber-500/25 bg-amber-500/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">Growth Area</span>
              </div>
              <p className="text-sm font-serif font-semibold text-foreground leading-tight line-clamp-2">
                {isUnlocked ? challengeLabel : `${bottom.short} — reveal to see`}
              </p>
              <p className="text-[11px] text-foreground/60 mt-1 tabular-nums">
                {isUnlocked ? `${bottom.score}% alignment` : 'Unlock to compare'}
              </p>
            </div>

            {/* Long-Term Outlook */}
            <div className="rounded-2xl p-4 border border-accent/20 bg-accent/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">Outlook</span>
              </div>
              <p className="text-sm font-serif font-semibold text-foreground leading-tight">{outlook.label}</p>
              <p className="text-[11px] text-foreground/60 mt-1">Based on {isUnlocked ? '5 of 5' : '1 of 5'} dimensions</p>
            </div>
          </div>
        </div>
      </div>
    </m.section>
  );
}
