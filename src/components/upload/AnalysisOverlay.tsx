import { m, AnimatePresence } from '@/lib/motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, Sparkles, ShieldCheck, Lock } from 'lucide-react';

interface AnalysisOverlayProps {
  open: boolean;
  imageUrl: string | null;
  isComplete: boolean;
  hasError: boolean;
  userName?: string;
}

const ANALYSIS_STEPS = [
  'Uploading palm image',
  'Enhancing image quality',
  'Detecting major life lines',
  'Mapping heart line',
  'Mapping head line',
  'Mapping fate line',
  'Identifying palm patterns',
  'Comparing with thousands of palm samples',
  'Running AI prediction model',
  'Generating personalized life insights',
  'Preparing your report',
];

const INSIGHTS = [
  'Every palm is uniquely yours — no two destinies are the same.',
  'Our AI analyzes 150+ palm characteristics in real time.',
  'Your report is being personalized to your life journey.',
  'Comparing with thousands of historical palm patterns…',
  'Generating actionable life guidance tailored to you.',
  'Ancient palmistry wisdom, decoded by modern AI.',
];

// Ease-out curve: fast start, slow finish, caps at 92% until complete
function computeProgress(elapsedMs: number): number {
  // ~28s to reach 92%
  const t = Math.min(elapsedMs / 28000, 1);
  const eased = 1 - Math.pow(1 - t, 2.4);
  return Math.min(eased * 92, 92);
}

export function AnalysisOverlay({ open, imageUrl, isComplete, hasError, userName }: AnalysisOverlayProps) {
  const startRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [insightIdx, setInsightIdx] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      startRef.current = performance.now();
      setProgress(0);
      setInsightIdx(0);
      setShowSuccess(false);
    }
  }, [open]);

  // Progress ticker
  useEffect(() => {
    if (!open || isComplete || hasError) return;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      setProgress(computeProgress(elapsed));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, isComplete, hasError]);

  // Snap to 100% on complete
  useEffect(() => {
    if (!open) return;
    if (isComplete) {
      setProgress(100);
      setShowSuccess(true);
    }
  }, [isComplete, open]);

  // Rotate insights
  useEffect(() => {
    if (!open) return;
    const int = setInterval(() => setInsightIdx((i) => (i + 1) % INSIGHTS.length), 3200);
    return () => clearInterval(int);
  }, [open]);

  // Derived active step from progress
  const activeStep = useMemo(() => {
    if (isComplete) return ANALYSIS_STEPS.length;
    const perStep = 92 / ANALYSIS_STEPS.length;
    return Math.min(ANALYSIS_STEPS.length - 1, Math.floor(progress / perStep));
  }, [progress, isComplete]);

  // Steps to render on mobile: current + last 2 completed
  const visibleSteps = useMemo(() => {
    const start = Math.max(0, activeStep - 2);
    const end = Math.min(ANALYSIS_STEPS.length, activeStep + 2);
    return ANALYSIS_STEPS.map((label, i) => ({ label, i })).slice(start, end);
  }, [activeStep]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0a0a12] overflow-y-auto"
        >
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
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
                  <span className="text-[11px] font-medium text-accent tracking-wide">AI ANALYSIS IN PROGRESS</span>
                </m.div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1.5">
                  {showSuccess
                    ? 'Your Palm Analysis is Ready'
                    : userName
                    ? `Reading ${userName}'s palm…`
                    : 'Reading your palm…'}
                </h1>
                <p className="text-sm text-white/50">
                  {showSuccess ? 'Taking you to your report' : 'Please stay on this screen'}
                </p>
              </div>

              {/* Palm image with scan */}
              <div className="relative mx-auto mb-6 w-full max-w-[240px] aspect-square rounded-3xl overflow-hidden border border-accent/25 bg-black/40 shadow-[0_20px_60px_-20px_hsl(42_87%_55%/0.4)]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Your palm"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
                    Palm image
                  </div>
                )}

                {/* Corner brackets */}
                {['top-2 left-2 border-t-2 border-l-2', 'top-2 right-2 border-t-2 border-r-2', 'bottom-2 left-2 border-b-2 border-l-2', 'bottom-2 right-2 border-b-2 border-r-2'].map((c) => (
                  <div key={c} className={`absolute w-4 h-4 border-accent ${c} rounded-sm`} />
                ))}

                {/* Scan line */}
                {!showSuccess && (
                  <m.div
                    initial={{ top: '-10%' }}
                    animate={{ top: ['-10%', '110%'] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-0 right-0 h-16 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent 0%, hsl(42 87% 55% / 0.35) 50%, transparent 100%)',
                      boxShadow: '0 0 40px hsl(42 87% 55% / 0.6)',
                    }}
                  />
                )}

                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay"
                  style={{
                    backgroundImage:
                      'linear-gradient(hsl(42 87% 55% / 0.25) 1px, transparent 1px), linear-gradient(90deg, hsl(42 87% 55% / 0.25) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Success overlay */}
                <AnimatePresence>
                  {showSuccess && (
                    <m.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-accent/30 backdrop-blur-sm"
                    >
                      <m.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-[0_0_60px_hsl(42_87%_55%/0.8)]"
                      >
                        <Check className="w-10 h-10 text-[#0a0a12]" strokeWidth={3} />
                      </m.div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="mb-2 flex items-center justify-between text-[11px] tracking-wide">
                <span className="text-white/50 uppercase">Analysis</span>
                <m.span
                  key={Math.floor(progress)}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-accent font-semibold tabular-nums"
                >
                  {Math.floor(progress)}%
                </m.span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden mb-6">
                <m.div
                  className="h-full rounded-full bg-gradient-to-r from-accent/70 via-accent to-accent/70 bg-[length:200%_100%]"
                  animate={{
                    width: `${progress}%`,
                    backgroundPosition: ['0% 0%', '200% 0%'],
                  }}
                  transition={{
                    width: { duration: 0.4, ease: 'easeOut' },
                    backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
                  }}
                />
              </div>

              {/* Steps */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 mb-5">
                <div className="space-y-2.5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {visibleSteps.map(({ label, i }) => {
                      const done = i < activeStep || isComplete;
                      const active = i === activeStep && !isComplete;
                      return (
                        <m.div
                          key={label}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: done ? 0.55 : 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {done ? (
                              <m.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                                className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-[#0a0a12]" strokeWidth={3.5} />
                              </m.div>
                            ) : active ? (
                              <Loader2 className="w-4 h-4 text-accent animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-white/25" />
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              active ? 'text-white font-medium' : done ? 'text-white/60' : 'text-white/40'
                            }`}
                          >
                            {label}
                          </span>
                        </m.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Rotating insight */}
              <div className="min-h-[48px] mb-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <m.p
                    key={insightIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                    className="text-center text-sm text-white/70 italic px-4"
                  >
                    "{INSIGHTS[insightIdx]}"
                  </m.p>
                </AnimatePresence>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-white/40">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-accent" />
                  Private & encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-accent" />
                  Photo never shared
                </span>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
