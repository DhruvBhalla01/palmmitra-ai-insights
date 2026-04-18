import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Brain, Compass, Sparkles } from 'lucide-react';
import type { MajorLine } from './types';

interface MajorLinesSectionProps {
  lines: {
    lifeLine: MajorLine;
    heartLine: MajorLine;
    headLine: MajorLine;
    fateLine: MajorLine;
    sunLine: MajorLine;
  };
}

const lineConfig = [
  { key: 'lifeLine', name: 'Life Line', subtitle: 'Energy & Vitality', icon: Activity, color: 'text-green-500', bgColor: 'bg-green-500', borderColor: 'border-green-500/20' },
  { key: 'heartLine', name: 'Heart Line', subtitle: 'Love & Emotions', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-500', borderColor: 'border-pink-500/20' },
  { key: 'headLine', name: 'Head Line', subtitle: 'Intelligence & Focus', icon: Brain, color: 'text-blue-500', bgColor: 'bg-blue-500', borderColor: 'border-blue-500/20' },
  { key: 'fateLine', name: 'Fate Line', subtitle: 'Career & Destiny', icon: Compass, color: 'text-purple-500', bgColor: 'bg-purple-500', borderColor: 'border-purple-500/20' },
  { key: 'sunLine', name: 'Sun Line', subtitle: 'Recognition & Success', icon: Sparkles, color: 'text-amber-500', bgColor: 'bg-amber-500', borderColor: 'border-amber-500/20' },
] as const;

const strengthToPercent: Record<string, number> = {
  'Very Strong': 95,
  'Strong': 80,
  'Moderate': 60,
  'Developing': 40,
  'Faint': 20,
};

export const MajorLinesSection = forwardRef<HTMLElement, MajorLinesSectionProps>(
  function MajorLinesSection({ lines }, ref) {
    return (
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8 text-accent" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Your Palm Lines <span className="text-gradient-gold text-shadow-luxury">Speak</span>
          </h2>
        </div>
        <p className="sanskrit-accent mb-2 ml-11">ॐ Rekha Vigyan · Ancient Line Science</p>
        <p className="text-xs text-muted-foreground mb-8 ml-11">
          These readings reflect traditional interpretations and may suggest potential patterns.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lineConfig.map(({ key, name, subtitle, icon: Icon, color, bgColor, borderColor }, index) => {
            const line = lines[key];
            const strengthPercent = strengthToPercent[line.strength] || 50;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`glass-premium gradient-border rounded-2xl p-6 border ${borderColor} hover:border-accent/40 transition-all duration-300 group cursor-default`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl ${bgColor}/10 flex items-center justify-center relative`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`w-7 h-7 ${color}`} />
                    <div className={`absolute inset-0 rounded-2xl ${bgColor}/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </motion.div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground text-lg">{name}</h3>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                  </div>
                </div>

                {/* Strength Meter */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground font-medium">Strength</span>
                    <span className={`text-xs font-bold ${color} px-2 py-0.5 rounded-full ${bgColor}/10`}>
                      {line.strength}
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${strengthPercent}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${bgColor} rounded-full relative`}
                    >
                      <div className="absolute inset-0 shimmer" />
                    </motion.div>
                  </div>
                </div>

                {/* Meaning */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {line.meaning}
                </p>

                {/* Key Insight */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-medium text-accent flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent/70 flex-shrink-0 mt-0.5" />
                    <span>{line.keyInsight}</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    );
  }
);
