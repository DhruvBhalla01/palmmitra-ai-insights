import { motion } from 'framer-motion';
import { Lock, Sparkles, Eye, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import palmIconGold from '@/assets/palm-icon-gold.png';

const sampleInsights = [
  {
    icon: '🌿',
    title: 'Life Line Analysis',
    label: 'FREE',
    preview: 'Strong, deep vitality line with a notable branch at age 34–36 suggesting a major life shift — possibly a career change, relocation, or new relationship that redefines your path entirely.',
    locked: false,
    color: 'border-green-500/25 bg-green-500/5',
    iconBg: 'bg-green-500/10 text-green-500',
  },
  {
    icon: '💗',
    title: 'Heart Line Meaning',
    label: 'FREE',
    preview: 'A deep, curved heart line reveals intense emotional depth and loyalty. You love completely once committed. A significant relationship forms between ages 28 and 33.',
    locked: false,
    color: 'border-rose-500/25 bg-rose-500/5',
    iconBg: 'bg-rose-500/10 text-rose-500',
  },
  {
    icon: '⭐',
    title: 'Fate Line Direction',
    label: 'PREMIUM',
    preview: 'Career success predicted after age 28 with significant momentum building in 2026–2028. Your fate line forks near the mount of Saturn indicating a pivotal choice between two equally compelling paths...',
    locked: true,
    color: 'border-accent/20 bg-accent/4',
    iconBg: 'bg-accent/10 text-accent',
  },
  {
    icon: '🏔️',
    title: 'Mount of Jupiter',
    label: 'PREMIUM',
    preview: 'Leadership qualities present — ambition runs strong. The mount elevation indicates a rise to authority before age 40, particularly in fields where you can inspire and direct others toward a shared vision...',
    locked: true,
    color: 'border-primary/20 bg-primary/4',
    iconBg: 'bg-primary/10 text-primary',
  },
];

const reportStats = [
  { value: '2,000+', label: 'words' },
  { value: '15', label: 'markers read' },
  { value: '5', label: 'life sections' },
];

export function SampleReportTeaser() {
  return (
    <section className="py-24 md:py-32 relative" aria-labelledby="sample-heading">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <p className="sanskrit-accent mb-3">ॐ Drishtant</p>
          <h2 id="sample-heading" className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            This Is What{' '}
            <span className="text-gradient-gold">Your Report Reveals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not generic horoscope predictions. Specific insights from YOUR palm lines — unique to you like a fingerprint.
          </p>
        </AnimatedSection>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto relative"
        >
          {/* Glow behind card */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/8 blur-3xl rounded-full" aria-hidden="true" />

          <motion.div
            className="relative glass-premium rounded-3xl overflow-hidden border border-accent/20"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {/* Card header */}
            <div className="bg-gradient-indigo p-7 text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-12"
                aria-hidden="true"
                style={{
                  backgroundImage: `radial-gradient(circle at center, hsl(var(--gold) / 0.4) 1px, transparent 1px)`,
                  backgroundSize: '28px 28px',
                }}
              />
              <motion.div
                className="mb-3 relative z-10 flex justify-center"
                animate={{
                  filter: [
                    'drop-shadow(0 0 18px rgba(255,193,7,0.4))',
                    'drop-shadow(0 0 40px rgba(255,193,7,0.7))',
                    'drop-shadow(0 0 18px rgba(255,193,7,0.4))',
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <img src={palmIconGold} alt="Palm Reading Report" width={80} height={80} className="w-20 h-20 object-contain" />
              </motion.div>
              <h3 className="text-xl font-serif font-bold text-primary-foreground relative z-10">
                Sample Destiny Report
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1.5 text-primary-foreground/60 text-sm relative z-10">
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>AI-Powered · Hasta Samudrika Shastra</span>
              </div>

              {/* Stat chips */}
              <div className="flex items-center justify-center gap-4 mt-4 relative z-10">
                {reportStats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-serif font-bold text-gradient-gold leading-none">{s.value}</p>
                    <p className="text-[10px] text-primary-foreground/50 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Star rating */}
              <div className="flex items-center justify-center gap-1.5 mt-3 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" aria-hidden="true" />
                ))}
                <span className="text-xs text-primary-foreground/60 ml-1">4.9 · 2,100+ reviews</span>
              </div>
            </div>

            {/* Insight rows */}
            <div className="p-5 space-y-3 relative">
              {sampleInsights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.09 }}
                  className={`p-4 rounded-2xl border transition-colors relative overflow-hidden ${insight.color}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-serif font-bold text-foreground text-sm flex items-center gap-1.5">
                          {insight.locked ? (
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                          )}
                          {insight.title}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          insight.locked ? 'bg-accent/15 text-accent' : 'bg-green-500/15 text-green-500'
                        }`}>
                          {insight.label}
                        </span>
                      </div>
                      <p
                        className={`text-muted-foreground text-sm leading-relaxed ${
                          insight.locked ? 'blur-[4px] select-none' : ''
                        }`}
                        aria-hidden={insight.locked}
                      >
                        {insight.preview}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Gradient fade + CTA */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-card via-card/85 to-transparent flex items-end justify-center pb-5 pointer-events-none" aria-hidden="true">
                <div className="pointer-events-auto">
                  <Link to="/upload">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button className="btn-gold text-foreground font-semibold px-9 py-6 rounded-2xl gap-2 shadow-gold-lg">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        Unlock My Full Reading
                        <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Below-card trust */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            2 sections free · Full 2,000-word report unlocked at ₹99 · Downloadable PDF included
          </p>
        </motion.div>
      </div>
    </section>
  );
}
