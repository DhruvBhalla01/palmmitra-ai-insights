import { motion } from 'framer-motion';
import { Zap, Heart, Lightbulb, Trophy, Sparkles } from 'lucide-react';
import type { PersonalityTrait } from './types';

interface PersonalityTraitsProps {
  traits: PersonalityTrait[];
}

const iconMap: Record<string, typeof Zap> = {
  drive: Zap,
  loyalty: Heart,
  practical: Lightbulb,
  success: Trophy,
  spiritual: Sparkles,
};

const colorMap: Record<string, { text: string; bg: string }> = {
  drive: { text: 'text-orange-500', bg: 'bg-orange-500/10' },
  loyalty: { text: 'text-pink-500', bg: 'bg-pink-500/10' },
  practical: { text: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { text: 'text-amber-500', bg: 'bg-amber-500/10' },
  spiritual: { text: 'text-purple-500', bg: 'bg-purple-500/10' },
};

export function PersonalityTraits({ traits }: PersonalityTraitsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
        <span className="text-3xl">🧠</span>
        Personality Traits From Your Palm
      </h2>

      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="space-y-4">
          {traits.map((trait, index) => {
            const Icon = iconMap[trait.icon] || Sparkles;
            const colors = colorMap[trait.icon] || colorMap.spiritual;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {trait.trait}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {trait.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
