import { forwardRef } from 'react';
import { m } from '@/lib/motion';
import { Gem, Clock, Sparkles } from 'lucide-react';
import type { SpiritualRemedy } from './types';

interface SpiritualRemediesSectionProps {
  remedies: SpiritualRemedy[];
}

export const SpiritualRemediesSection = forwardRef<HTMLElement, SpiritualRemediesSectionProps>(
  function SpiritualRemediesSection({ remedies }, ref) {
    return (
      <m.section
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-start gap-3 mb-8">
          <Gem className="w-6 h-6 md:w-8 md:h-8 text-accent flex-shrink-0 mt-1" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight text-balance">
            Spiritual <span className="text-gradient-gold text-shadow-luxury">Remedies</span> &amp; Guidance
          </h2>
        </div>

        <div className="glass gradient-border rounded-2xl p-6 md:p-8">
          <div className="space-y-4">
            {remedies.map((remedy, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-accent/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <span className="text-accent font-bold">{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{remedy.remedy}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      <Clock className="w-3 h-3" />
                      {remedy.timing}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
                    {remedy.benefit}
                  </p>
                </div>
              </m.div>
            ))}
          </div>

          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Gem className="w-4 h-4 text-accent" />
            Based on traditional Indian palmistry (Hast Rekha Shastra)
          </m.div>
        </div>
      </m.section>
    );
  }
);
