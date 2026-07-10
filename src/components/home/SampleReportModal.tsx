import { m, AnimatePresence } from '@/lib/motion';
import { X, Lock, ArrowRight, Sparkles, Star, Heart, Briefcase, TrendingUp, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

interface SampleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleSections = [
  {
    icon: Star,
    title: 'Life Line Analysis',
    tag: 'Vitality · Resilience',
    preview:
      'A deep, unbroken arc curving generously around the Mount of Venus — a marker of profound life force, physical endurance and an innate ability to recover from setbacks with grace.',
    unlocked: true,
  },
  {
    icon: Heart,
    title: 'Love & Relationships',
    tag: 'Bonds · Emotional Depth',
    preview:
      'Your heart line rises toward Jupiter with a soft fork — indicating a rare capacity for devoted love, and a defining bond forming in the years ahead that reshapes your emotional world.',
    unlocked: true,
  },
  {
    icon: Briefcase,
    title: 'Career & Success',
    tag: 'Fate · Recognition',
    preview:
      'A strong fate line ascending toward Saturn suggests a defining professional inflection between 2026–2028 — recognition, leadership and the beginning of long-form legacy work.',
    unlocked: false,
  },
  {
    icon: TrendingUp,
    title: 'Wealth Forecast',
    tag: 'Abundance · Flow',
    preview:
      'Multiple minor lines converging on the Mount of Mercury reveal diversified streams of prosperity — favouring ventures, ownership and compounding assets over fixed income.',
    unlocked: false,
  },
];

export function SampleReportModal({ isOpen, onClose }: SampleReportModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" />

          {/* Ambient gold glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(600px 400px at 50% 10%, hsl(var(--accent) / 0.18), transparent 60%), radial-gradient(500px 300px at 50% 100%, hsl(var(--primary) / 0.2), transparent 60%)',
            }}
          />

          {/* Modal */}
          <m.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient border shell */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl p-[1px]"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--accent) / 0.55), hsl(var(--accent) / 0.05) 40%, hsl(var(--primary) / 0.4))',
              }}
            >
              <div className="w-full h-full rounded-3xl bg-card/60" />
            </div>

            <div className="relative glass-premium rounded-3xl border border-accent/20 shadow-2xl max-h-[88vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 backdrop-blur-xl bg-card/70 border-b border-accent/15 px-6 py-5 rounded-t-3xl">
                {/* Hairline gold accent */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-6 right-6 h-px"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.6), transparent)',
                  }}
                />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25">
                        <Sparkles className="w-3 h-3 text-accent" />
                        <span className="text-[10px] uppercase tracking-[0.14em] text-accent font-semibold">
                          Sample Preview
                        </span>
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-tight">
                      Your Destiny{' '}
                      <span className="text-gradient-gold">Report</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent/70" />
                      2,000+ words · 15 markers read · Downloadable PDF
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-background/60 border border-accent/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Destiny highlight */}
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden rounded-2xl p-6 text-center bg-gradient-mystic border border-accent/20"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at center, hsl(var(--accent) / 0.5) 1px, transparent 1px)',
                      backgroundSize: '22px 22px',
                    }}
                  />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/15 border border-accent/30 mb-3">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <p className="font-serif text-lg sm:text-xl text-foreground italic leading-snug text-balance">
                      "Your strongest growth cycle begins mid-2026 and peaks in 2028."
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="h-px w-8 bg-accent/40" />
                      <p className="text-[11px] uppercase tracking-[0.18em] text-accent/80 font-medium">
                        AI Destiny Analysis
                      </p>
                      <div className="h-px w-8 bg-accent/40" />
                    </div>
                  </div>
                </m.div>

                {/* Report sections */}
                {sampleSections.map((section, index) => (
                  <m.div
                    key={section.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.08 }}
                    className={`group relative overflow-hidden rounded-2xl p-5 border transition-all ${
                      section.unlocked
                        ? 'bg-card/40 border-accent/20 hover:border-accent/40'
                        : 'bg-card/30 border-accent/10'
                    }`}
                  >
                    {/* Left accent bar */}
                    <div
                      aria-hidden="true"
                      className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${
                        section.unlocked ? 'bg-gradient-to-b from-accent to-accent/30' : 'bg-muted/40'
                      }`}
                    />
                    <div className="flex items-start gap-4 pl-2">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          section.unlocked
                            ? 'bg-accent/10 border-accent/25'
                            : 'bg-muted/30 border-muted/30'
                        }`}
                      >
                        <section.icon
                          className={`w-5 h-5 ${section.unlocked ? 'text-accent' : 'text-muted-foreground'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-serif font-bold text-foreground text-base flex items-center gap-2">
                            {section.title}
                          </h3>
                          {section.unlocked ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 border border-green-500/25">
                              FREE
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-accent/70 font-medium mb-2">
                          {section.tag}
                        </p>
                        <p
                          className={`text-sm leading-relaxed ${
                            section.unlocked
                              ? 'text-muted-foreground'
                              : 'text-muted-foreground/60 blur-[3px] select-none'
                          }`}
                        >
                          {section.preview}
                        </p>
                      </div>
                    </div>

                    {!section.unlocked && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card via-card/70 to-transparent pointer-events-none"
                      />
                    )}
                  </m.div>
                ))}

                {/* Trust row */}
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center justify-center gap-4 pt-1"
                >
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <span className="text-xs text-muted-foreground">4.9 · 2,100+ readings</span>
                  <div className="h-3 w-px bg-border" />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent/80" />
                    Private
                  </span>
                </m.div>

                {/* CTA */}
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2"
                >
                  <Link to="/upload" onClick={onClose}>
                    <Button className="btn-gold w-full text-foreground font-semibold text-base sm:text-lg py-6 sm:py-7 rounded-2xl shadow-gold-lg group">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Unlock My Full Reading
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Upload your palm · Full report delivered in under 60 seconds
                  </p>
                </m.div>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
