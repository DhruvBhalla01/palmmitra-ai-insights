import { motion } from 'framer-motion';
import { Gem, Clock, Sparkles } from 'lucide-react';
import type { SpiritualRemedy } from './types';

interface SpiritualRemediesSectionProps {
  remedies: SpiritualRemedy[];
}

export function SpiritualRemediesSection({ remedies }: SpiritualRemediesSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
        <span className="text-3xl">🕉</span>
        Spiritual Remedies & Guidance
      </h2>

      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="space-y-4">
          {remedies.map((remedy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-accent/5 transition-colors group"
            >
              {/* Number badge */}
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
            </motion.div>
          ))}
        </div>

        {/* Authenticity note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <Gem className="w-4 h-4 text-accent" />
          Based on traditional Indian palmistry (Hast Rekha Shastra)
        </motion.div>
      </div>
    </motion.section>
  );
}
