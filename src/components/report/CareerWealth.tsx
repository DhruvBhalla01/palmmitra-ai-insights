import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Target } from 'lucide-react';
import type { PeakPeriod } from './types';

interface CareerWealthProps {
  bestFields: string[];
  turningPointAge: string;
  wealthStyle: string;
  peakPeriods: PeakPeriod[];
}

const intensityColors: Record<string, { bg: string; dot: string }> = {
  building: { bg: 'bg-slate-200', dot: 'bg-slate-400' },
  rising: { bg: 'bg-blue-200', dot: 'bg-blue-500' },
  peak: { bg: 'bg-amber-300', dot: 'bg-amber-500' },
  sustaining: { bg: 'bg-green-200', dot: 'bg-green-500' },
  expanding: { bg: 'bg-purple-200', dot: 'bg-purple-500' },
};

export const CareerWealth = forwardRef<HTMLElement, CareerWealthProps>(
  function CareerWealth({ bestFields, turningPointAge, wealthStyle, peakPeriods }, ref) {
    return (
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-accent" />
          <span className="text-gradient-gold text-shadow-luxury">Career & Wealth</span> Direction
        </h2>

        <div className="glass gradient-border rounded-2xl p-6 md:p-8 space-y-6">
          {/* Best Fields */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">Potentially Suited Fields</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {bestFields.map((field, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="px-4 py-2 rounded-xl bg-accent/10 text-accent font-medium text-sm"
                >
                  {field}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Turning Point */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Potential Career Turning Point</h3>
              <p className="text-sm text-muted-foreground">
                Ages <span className="font-semibold text-primary">{turningPointAge}</span> may indicate a potential shift in your professional trajectory.
              </p>
            </div>
          </div>

          {/* Wealth Style */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Wealth Growth Pattern</h3>
              <p className="text-sm text-muted-foreground">{wealthStyle}</p>
            </div>
          </div>

          {/* Career Peak Timeline */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Career Peak Window</h3>
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-border rounded-full" />
              <div className="relative flex justify-between">
                {peakPeriods.map((period, index) => {
                  const colors = intensityColors[period.intensity] || intensityColors.building;
                  const isPeak = period.intensity === 'peak';

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${isPeak ? 'ring-4 ring-amber-500/30' : ''}`}>
                        <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                      </div>
                      <span className={`mt-2 text-xs font-semibold ${isPeak ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {period.year}
                      </span>
                      <span className={`text-[10px] capitalize ${isPeak ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                        {period.intensity}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic mt-4">
            <TrendingUp className="w-3.5 h-3.5 text-accent inline mr-1.5 mb-0.5" />
            These insights suggest potential patterns based on your palm. Your choices shape your destiny.
          </p>
        </div>
      </motion.section>
    );
  }
);
