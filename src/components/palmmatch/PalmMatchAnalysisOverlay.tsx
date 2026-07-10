import { m, AnimatePresence, useReducedMotion } from '@/lib/motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check, Loader2, Sparkles, Shield, Trash2, Cpu, Heart,
  MessageCircle, Infinity as InfinityIcon, Target, CheckCircle2,
} from 'lucide-react';

interface Props {
  open: boolean;
  isComplete: boolean;
  hasError: boolean;
  person1Name?: string;
  person2Name?: string;
  image1Url?: string | null;
  image2Url?: string | null;
}

const STAGES = [
  'Both palms securely verified',
  'Emotional compatibility identified',
  'Comparing communication patterns',
  'Mapping relationship strengths',
  'Predicting long-term compatibility',
  'Generating personalized guidance',
  'Finalizing your compatibility report',
];

const INSIGHTS = [
  'Analyzing emotional connection…',
  'Comparing life goals…',
  'Measuring communication compatibility…',
  'Detecting relationship patterns…',
  'Evaluating long-term harmony…',
  'Preparing personalized recommendations…',
];

const DIMENSIONS = [
  { icon: Heart, label: 'Emotional Bond', hint: 'Detected', color: 'hsl(340 82% 68%)' },
  { icon: MessageCircle, label: 'Communication', hint: 'Analyzing…', color: 'hsl(200 82% 68%)' },
  { icon: InfinityIcon, label: 'Spiritual Alignment', hint: 'Matching…', color: 'hsl(260 60% 72%)' },
  { icon: Target, label: 'Shared Life Goals', hint: 'Comparing…', color: 'hsl(42 87% 62%)' },
];

// Eased progress, caps at 94% until backend confirms
function computeProgress(elapsedMs: number) {
  const t = Math.min(elapsedMs / 30000, 1);
  const eased = 1 - Math.pow(1 - t, 2.4);
  return Math.min(eased * 94, 94);
}

function progressLabel(pct: number, done: boolean) {
  if (done) return 'Compatibility Analysis Complete';
  if (pct < 20) return 'Initializing AI';
  if (pct < 45) return 'Reading both palms';
  if (pct < 70) return 'Comparing patterns';
  if (pct < 90) return 'Almost Ready';
  return 'Finalizing Your Compatibility Report';
}

export function PalmMatchAnalysisOverlay({
  open, isComplete, hasError, person1Name, person2Name, image1Url, image2Url,
}: Props) {
  const reduceMotion = useReducedMotion();
  const startRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [insightIdx, setInsightIdx] = useState(0);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (open) {
      startRef.current = performance.now();
      setProgress(0);
      setInsightIdx(0);
      setShowDone(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || isComplete || hasError) return;
    let raf = 0;
    const tick = () => {
      setProgress(computeProgress(performance.now() - startRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, isComplete, hasError]);

  useEffect(() => {
    if (open && isComplete) {
      setProgress(100);
      setShowDone(true);
    }
  }, [isComplete, open]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setInsightIdx((i) => (i + 1) % INSIGHTS.length), 2600);
    return () => clearInterval(id);
  }, [open]);

  const activeStage = useMemo(() => {
    if (isComplete) return STAGES.length;
    const per = 94 / STAGES.length;
    return Math.min(STAGES.length - 1, Math.floor(progress / per));
  }, [progress, isComplete]);

  const visibleStages = useMemo(() => {
    const start = Math.max(0, activeStage - 2);
    const end = Math.min(STAGES.length, activeStage + 2);
    return STAGES.map((label, i) => ({ label, i })).slice(start, end);
  }, [activeStage]);

  const label = progressLabel(progress, showDone);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0a0a12] overflow-y-auto"
        >
          {/* Ambient background — reduced blur for perf */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl" />
            {/* Soft floating particles — skipped if reduced motion */}
            {!reduceMotion && [0, 1, 2].map((i) => (
              <m.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: [0, -30, -60],
                }}
                transition={{
                  duration: 4 + i * 0.4,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: 'easeOut',
                }}
                className="absolute w-1 h-1 rounded-full bg-accent/70"
                style={{
                  left: `${20 + i * 25}%`,
                  top: `${60 + (i % 3) * 8}%`,
                  willChange: 'transform, opacity',
                }}
              />
            ))}
          </div>

          <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md mx-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <m.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-3"
                >
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span className="text-[11px] font-medium text-accent tracking-wide">
                    AI COMPATIBILITY ENGINE
                  </span>
                </m.div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1.5">
                  {showDone
                    ? 'Compatibility Analysis Complete'
                    : person1Name && person2Name
                    ? `Reading ${person1Name} & ${person2Name}'s palms…`
                    : 'Reading both palms…'}
                </h1>
                <p className="text-sm text-white/50">
                  {showDone ? 'Preparing Your Personalized Report…' : 'Please stay on this screen'}
                </p>
              </div>

              {/* Twin palms w/ connecting glow */}
              <div className="relative mx-auto mb-6 w-full max-w-[320px]">
                <div className="flex items-center justify-between gap-3">
                  {[image1Url, image2Url].map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-[46%] aspect-square rounded-2xl overflow-hidden border border-accent/25 bg-black/40 shadow-[0_16px_40px_-20px_hsl(42_87%_55%/0.4)]"
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={idx === 0 ? person1Name || 'Palm 1' : person2Name || 'Palm 2'}
                          className="absolute inset-0 w-full h-full object-cover opacity-90"
                          loading="eager"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
                          Palm
                        </div>
                      )}
                      {['top-1.5 left-1.5 border-t-2 border-l-2', 'top-1.5 right-1.5 border-t-2 border-r-2', 'bottom-1.5 left-1.5 border-b-2 border-l-2', 'bottom-1.5 right-1.5 border-b-2 border-r-2'].map((c) => (
                        <div key={c} className={`absolute w-3 h-3 border-accent ${c} rounded-sm`} />
                      ))}
                      {!showDone && (
                        <m.div
                          initial={{ top: '-10%' }}
                          animate={{ top: ['-10%', '110%'] }}
                          transition={{
                            duration: 2.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: idx * 0.6,
                          }}
                          className="absolute left-0 right-0 h-10 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(180deg, transparent 0%, hsl(42 87% 55% / 0.35) 50%, transparent 100%)',
                            willChange: 'transform',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Central connection */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <m.div
                    animate={{ scale: showDone || reduceMotion ? 1 : [0.85, 1.05, 0.85], opacity: reduceMotion ? 1 : [0.6, 1, 0.6] }}
                    transition={{ duration: 2.2, repeat: showDone || reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
                    className="w-10 h-10 rounded-full bg-accent/25 border border-accent/50 flex items-center justify-center shadow-[0_0_30px_hsl(42_87%_55%/0.6)]"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {showDone ? (
                      <Check className="w-5 h-5 text-accent" strokeWidth={3} />
                    ) : (
                      <Heart className="w-5 h-5 text-accent" />
                    )}
                  </m.div>
                </div>
              </div>

              {/* Live discovery cards */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {DIMENSIONS.map((d, i) => {
                  const revealed = progress > i * 22;
                  const Icon = d.icon;
                  return (
                    <m.div
                      key={d.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: revealed ? 1 : 0.35, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 flex items-center gap-2"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${d.color}22`, color: d.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-white/85 truncate">{d.label}</div>
                        <div className="text-[10px] text-white/45 truncate">
                          {revealed ? (showDone ? 'Ready' : d.hint) : 'Queued'}
                        </div>
                      </div>
                    </m.div>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="mb-2 flex items-center justify-between text-[11px] tracking-wide">
                <span className="text-white/50 uppercase">Analysis</span>
                <span className="text-accent font-semibold">{label}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden mb-6">
                <m.div
                  className="h-full rounded-full bg-gradient-to-r from-accent/70 via-accent to-accent/70"
                  animate={{ width: `${progress}%` }}
                  transition={{ width: { duration: 0.4, ease: 'easeOut' } }}
                  style={{ willChange: 'width' }}
                />
              </div>

              {/* Stages */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 mb-5">
                <div className="space-y-2.5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {visibleStages.map(({ label: text, i }) => {
                      const done = i < activeStage || isComplete;
                      const active = i === activeStage && !isComplete;
                      return (
                        <m.div
                          key={text}

                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: done ? 0.6 : 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {done ? (
                              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                                <Check className="w-3 h-3 text-[#0a0a12]" strokeWidth={3.5} />
                              </div>
                            ) : active ? (
                              <Loader2 className="w-4 h-4 text-accent animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-white/25" />
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              active ? 'text-white font-medium' : done ? 'text-white/65' : 'text-white/40'
                            }`}
                          >
                            {text}
                          </span>
                        </m.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Rotating insight */}
              <div className="min-h-[44px] mb-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <m.p
                    key={insightIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                    className="text-center text-sm text-white/70 italic px-4"
                  >
                    {showDone ? 'Preparing Your Personalized Report…' : INSIGHTS[insightIdx]}
                  </m.p>
                </AnimatePresence>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-white/45">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-accent" />
                  Both palms encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Trash2 className="w-3 h-3 text-accent" />
                  Deleted after analysis
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-accent" />
                  300+ compatibility signals
                </span>
              </div>

              {showDone && (
                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-center gap-2 text-sm text-accent"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Opening your compatibility report…
                </m.div>
              )}
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
