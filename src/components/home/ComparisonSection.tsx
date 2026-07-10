import { m } from '@/lib/motion';
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
    priceNote: 'Free preview, full report ₹149 / $9.99',
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
    <section className="py-16 md:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-14">
          <p className="sanskrit-accent mb-3">ॐ Viveka Darshan</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Not All Readings Are <span className="text-gradient-gold">Created Equal</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See exactly why 12,400+ people chose PalmMitra AI over generic horoscopes and expensive offline palmists.
          </p>
        </AnimatedSection>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="w-full">
            {/* Column headers */}
            <div className="grid grid-cols-[1.3fr_1fr_1fr] md:grid-cols-4 gap-2 md:gap-3 mb-3 md:mb-4">
              <div /> {/* Row label spacer — aligns headers with row check columns */}
              {cols.map((col, colIdx) => (
                <div
                  key={col.name}
                  className={`rounded-xl md:rounded-2xl p-2.5 md:p-4 text-center transition-all ${
                    colIdx === 2 ? 'hidden md:block' : ''
                  } ${
                    col.highlight
                      ? 'bg-gradient-gold shadow-gold-lg'
                      : 'glass-premium border border-border/50'
                  }`}
                >
                  <p className={`font-serif font-bold text-[11px] leading-tight md:text-base ${col.highlight ? 'text-foreground' : 'text-foreground'}`}>
                    {col.name}
                  </p>
                  <p className={`text-[10px] leading-tight mt-0.5 hidden md:block ${col.highlight ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                    {col.subtext}
                  </p>
                  {col.highlight && (
                    <div className="mt-1.5 md:mt-2 flex justify-center">
                      <span className="text-[9px] md:text-[10px] font-bold bg-foreground/20 text-foreground px-1.5 md:px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Best
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-1.5 md:space-y-2">
              {rows.map((row, rowIdx) => (
                <m.div
                  key={row.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: rowIdx * 0.07 }}
                  className="grid grid-cols-[1.3fr_1fr_1fr] md:grid-cols-4 gap-2 md:gap-3 items-center"
                >
                  <p className="text-[12px] md:text-sm font-medium text-foreground pr-1 md:pr-2 leading-snug">{row.label}</p>
                  {cols.map((col, colIdx) => (
                    <div
                      key={col.name}
                      className={`rounded-lg md:rounded-xl p-2 md:p-3 flex items-center justify-center ${
                        colIdx === 2 ? 'hidden md:flex' : ''
                      } ${
                        col.highlight
                          ? 'bg-accent/8 border border-accent/20'
                          : 'bg-background/50 border border-border/30'
                      }`}
                    >
                      {col.checks[rowIdx] ? (
                        <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center ${col.highlight ? 'bg-accent/20' : 'bg-muted'}`}>
                          <Check className={`w-3.5 h-3.5 md:w-4 md:h-4 ${col.highlight ? 'text-accent' : 'text-muted-foreground'}`} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-muted/40 flex items-center justify-center">
                          <X className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  ))}
                </m.div>
              ))}
            </div>

            {/* Price row */}
            <div className="grid grid-cols-[1.3fr_1fr_1fr] md:grid-cols-4 gap-2 md:gap-3 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/30">
              <p className="text-[12px] md:text-sm font-semibold text-foreground">Price</p>
              {cols.map((col, colIdx) => (
                <div
                  key={col.name}
                  className={`rounded-lg md:rounded-xl p-2 md:p-3 text-center ${
                    colIdx === 2 ? 'hidden md:block' : ''
                  } ${col.highlight ? 'bg-accent/8 border border-accent/20' : 'bg-background/50 border border-border/30'}`}
                >
                  <p className={`font-bold text-[12px] md:text-sm ${col.highlight ? 'text-accent' : 'text-foreground'}`}>{col.price}</p>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5 leading-tight">{col.priceNote}</p>
                </div>
              ))}
            </div>

            {/* Mobile-only note about hidden column */}
            <p className="md:hidden text-center text-[11px] text-muted-foreground/70 mt-4 leading-relaxed">
              Compared vs generic horoscope apps · Full 3-way comparison on desktop
            </p>
          </div>
        </m.div>

        <AnimatedSection delay={0.4} className="text-center mt-12">
          <Link to="/upload">
            <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl gap-2 shadow-gold-lg">
                <Sparkles className="w-5 h-5" />
                Try PalmMitra Free
              </Button>
            </m.div>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">No credit card · Free preview · Results in 2 min</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
