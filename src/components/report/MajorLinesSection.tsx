import { motion } from 'framer-motion';
import { Flame, Heart, Brain, Star, Sun } from 'lucide-react';
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
  { key: 'lifeLine', name: 'Life Line', subtitle: 'Energy & Vitality', icon: Flame, color: 'text-green-500', bgColor: 'bg-green-500' },
  { key: 'heartLine', name: 'Heart Line', subtitle: 'Love & Emotions', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-500' },
  { key: 'headLine', name: 'Head Line', subtitle: 'Intelligence & Focus', icon: Brain, color: 'text-blue-500', bgColor: 'bg-blue-500' },
  { key: 'fateLine', name: 'Fate Line', subtitle: 'Career & Destiny', icon: Star, color: 'text-purple-500', bgColor: 'bg-purple-500' },
  { key: 'sunLine', name: 'Sun Line', subtitle: 'Recognition & Success', icon: Sun, color: 'text-amber-500', bgColor: 'bg-amber-500' },
] as const;

const strengthToPercent: Record<string, number> = {
  'Very Strong': 95,
  'Strong': 80,
  'Moderate': 60,
  'Developing': 40,
  'Faint': 20,
};

export function MajorLinesSection({ lines }: MajorLinesSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        Major Palm Lines Breakdown
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lineConfig.map(({ key, name, subtitle, icon: Icon, color, bgColor }, index) => {
          const line = lines[key];
          const strengthPercent = strengthToPercent[line.strength] || 50;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass rounded-2xl p-6 border border-transparent hover:border-accent/30 transition-all duration-300 group cursor-default"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${bgColor}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-foreground">{name}</h3>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              </div>

              {/* Strength Meter */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-muted-foreground">Strength</span>
                  <span className={`text-xs font-semibold ${color}`}>{line.strength}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${strengthPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                    className={`h-full ${bgColor} rounded-full`}
                  />
                </div>
              </div>

              {/* Meaning */}
              <p className="text-sm text-muted-foreground mb-3">
                {line.meaning}
              </p>

              {/* Key Insight */}
              <div className="pt-3 border-t border-border/50">
                <p className="text-sm font-medium text-accent flex items-start gap-2">
                  <span className="text-accent/70">💡</span>
                  {line.keyInsight}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
