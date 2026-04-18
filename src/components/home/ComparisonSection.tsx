import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const rows = [
  { label: 'Personalised to YOUR palm' },
  { label: 'Specific years & dates revealed' },
  { label: 'Career + Love + Wealth in one report' },
  { label: 'Based on ancient Indian Shastra' },
  { label: 'Downloadable premium PDF' },
  { label: 'AI-powered computer vision analysis' },
];

const cols = [
  {
    name: 'Horoscope App',
    subtext: 'Generic · Birth-date based',
    highlight: false,
    checks: [false, false, false, false, false, false],
    price: 'Free',
    priceNote: 'Generic predictions',
  },
  {
    name: 'PalmMitra AI',
    subtext: 'YOUR palm · YOUR destiny',
    highlight: true,
    checks: [true, true, true, true, true, true],
    price: 'From ₹0',
    priceNote: 'Free preview, full report ₹99',
  },
  {
    name: 'Manual Palmist',
    subtext: 'Offline · Subjective',
    highlight: false,
    checks: [true, false, false, true, false, false],
    price: '₹500–₹5,000',
    priceNote: 'Per session, no PDF',
  },
];

export function ComparisonSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-14">
          <p className="sanskrit-accent mb-3">ॐ Viveka Darshan</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Why Choose <span className="text-gradient-gold">PalmMitra?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not all palm readings are equal. See why 12,400+ people chose AI over guesswork.
          </p>
        </AnimatedSection>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto overflow-x-auto"
        >
          <div className="min-w-[600px]">
            {/* Column headers */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div /> {/* Row label spacer */}
              {cols.map((col) => (
                <div
                  key={col.name}
                  className={`rounded-2xl p-4 text-center transition-all ${
                    col.highlight
                      ? 'bg-gradient-gold shadow-gold-lg'
                      : 'glass-premium border border-border/50'
                  }`}
                >
                  <p className={`font-serif font-bold text-sm md:text-base ${col.highlight ? 'text-foreground' : 'text-foreground'}`}>
                    {col.name}
                  </p>
                  <p className={`text-xs mt-0.5 ${col.highlight ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                    {col.subtext}
                  </p>
                  {col.highlight && (
                    <div className="mt-2 flex justify-center">
                      <span className="text-[10px] font-bold bg-foreground/20 text-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Best Choice
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {rows.map((row, rowIdx) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: rowIdx * 0.07 }}
                  className="grid grid-cols-4 gap-3 items-center"
                >
                  <p className="text-sm font-medium text-foreground pr-2">{row.label}</p>
                  {cols.map((col) => (
                    <div
                      key={col.name}
                      className={`rounded-xl p-3 flex items-center justify-center ${
                        col.highlight
                          ? 'bg-accent/8 border border-accent/20'
                          : 'bg-background/50 border border-border/30'
                      }`}
                    >
                      {col.checks[rowIdx] ? (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${col.highlight ? 'bg-accent/20' : 'bg-muted'}`}>
                          <Check className={`w-4 h-4 ${col.highlight ? 'text-accent' : 'text-muted-foreground'}`} />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center">
                          <X className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Price row */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/30">
              <p className="text-sm font-semibold text-foreground">Price</p>
              {cols.map((col) => (
                <div
                  key={col.name}
                  className={`rounded-xl p-3 text-center ${col.highlight ? 'bg-accent/8 border border-accent/20' : 'bg-background/50 border border-border/30'}`}
                >
                  <p className={`font-bold text-sm ${col.highlight ? 'text-accent' : 'text-foreground'}`}>{col.price}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{col.priceNote}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatedSection delay={0.4} className="text-center mt-12">
          <Link to="/upload">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl gap-2 shadow-gold-lg">
                <Sparkles className="w-5 h-5" />
                Try PalmMitra Free
              </Button>
            </motion.div>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">No credit card · Free preview · Results in 2 min</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
