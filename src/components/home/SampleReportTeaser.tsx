import { motion } from 'framer-motion';
import { Lock, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import palmIconGold from '@/assets/palm-icon-gold.png';

const sampleInsights = [
  {
    title: 'Life Line Analysis',
    preview: 'Strong vitality with a notable branch at age 34–36 suggesting a major life shift — possibly a career change, relocation, or new relationship that redefines your path.',
    locked: false,
  },
  {
    title: 'Heart Line Meaning',
    preview: 'A deep, curved heart line reveals intense emotional depth and loyalty. You love completely once committed. A significant relationship forms between ages 28 and 33.',
    locked: false,
  },
  {
    title: 'Fate Line Direction',
    preview: 'Career success predicted after age 28 with significant momentum building in 2026–2028. Your fate line forks near the mount of Saturn indicating...',
    locked: true,
  },
  {
    title: 'Mount of Jupiter',
    preview: 'Leadership qualities present, ambition runs strong. The mount elevation indicates a rise to authority before age 40, particularly in fields where you can...',
    locked: true,
  },
];

export function SampleReportTeaser() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <p className="sanskrit-accent mb-3">ॐ Drishtant</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            See Exactly{' '}
            <span className="text-gradient-gold">What You'll Discover</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Life path clarity. Love timing. Career breakthroughs. Wealth windows.
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
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/8 blur-3xl rounded-full" />

          <motion.div
            className="relative glass-premium rounded-3xl overflow-hidden"
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
          >
            {/* Card header */}
            <div className="bg-gradient-indigo p-7 text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-15"
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
                    'drop-shadow(0 0 36px rgba(255,193,7,0.65))',
                    'drop-shadow(0 0 18px rgba(255,193,7,0.4))',
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <img src={palmIconGold} alt="Palm Reading" className="w-20 h-20 object-contain" />
              </motion.div>
              <h3 className="text-xl font-serif font-bold text-primary-foreground relative z-10">
                Sample Destiny Report
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1.5 text-primary-foreground/60 text-sm relative z-10">
                <Eye className="w-3.5 h-3.5" />
                <span>AI-Powered · Ancient Shastra</span>
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
                  className={`p-4 rounded-2xl transition-colors relative overflow-hidden ${
                    insight.locked
                      ? 'glass-premium border border-border/40'
                      : 'glass-premium border border-accent/20 hover:border-accent/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-foreground mb-1.5 flex items-center gap-2 text-sm">
                        {insight.locked ? (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                        )}
                        {insight.title}
                      </h4>
                      <p
                        className={`text-muted-foreground text-sm leading-relaxed ${
                          insight.locked ? 'blur-[3.5px] select-none' : ''
                        }`}
                      >
                        {insight.preview}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Gradient fade + CTA */}
              <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-card via-card/80 to-transparent flex items-end justify-center pb-5 pointer-events-none">
                <div className="pointer-events-auto">
                  <Link to="/upload">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button className="btn-gold text-foreground font-semibold px-9 py-6 rounded-2xl gap-2 shadow-gold-lg">
                        <Sparkles className="w-4 h-4" />
                        Unlock My Full Reading
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Below-card trust */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            2 sections shown free · Full report unlocked at ₹99 · PDF included
          </p>
        </motion.div>
      </div>
    </section>
  );
}
