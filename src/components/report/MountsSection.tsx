import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Crown, Shield, Palette, MessageCircle, ChevronDown, Layers } from 'lucide-react';
import type { Mount } from './types';

interface MountsSectionProps {
  mounts: {
    venus: Mount;
    jupiter: Mount;
    saturn: Mount;
    apollo: Mount;
    mercury: Mount;
  };
}

const mountConfig = [
  { key: 'venus', name: 'Venus', subtitle: 'Love & Warmth', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-500', borderColor: 'border-pink-500/20' },
  { key: 'jupiter', name: 'Jupiter', subtitle: 'Leadership', icon: Crown, color: 'text-amber-500', bgColor: 'bg-amber-500', borderColor: 'border-amber-500/20' },
  { key: 'saturn', name: 'Saturn', subtitle: 'Discipline', icon: Shield, color: 'text-slate-500', bgColor: 'bg-slate-500', borderColor: 'border-slate-500/20' },
  { key: 'apollo', name: 'Apollo', subtitle: 'Creativity', icon: Palette, color: 'text-orange-500', bgColor: 'bg-orange-500', borderColor: 'border-orange-500/20' },
  { key: 'mercury', name: 'Mercury', subtitle: 'Communication', icon: MessageCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-500', borderColor: 'border-emerald-500/20' },
] as const;

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  'High': { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  'Medium': { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
  'Low': { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/30' },
};

export const MountsSection = forwardRef<HTMLElement, MountsSectionProps>(
  function MountsSection({ mounts }, ref) {
    const [expandedMount, setExpandedMount] = useState<string | null>(null);

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
          <Layers className="w-8 h-8 text-accent" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Palm Mounts & <span className="text-gradient-gold text-shadow-luxury">Personality Forces</span>
          </h2>
        </div>
        <p className="sanskrit-accent mb-8 ml-11">ॐ Parvat Shakti</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mountConfig.map(({ key, name, subtitle, icon: Icon, color, bgColor, borderColor }, index) => {
            const mount = mounts[key];
            const isExpanded = expandedMount === key;
            const levelStyle = levelColors[mount.level] || levelColors.Medium;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                layout
                onClick={() => setExpandedMount(isExpanded ? null : key)}
                className={`glass-premium gradient-border rounded-2xl border ${borderColor} hover:border-accent/30 transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                <div className="p-5 flex items-center gap-4">
                  <motion.div
                    className={`w-12 h-12 rounded-2xl ${bgColor}/10 flex items-center justify-center`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className={`w-6 h-6 ${color}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-foreground">{name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${levelStyle.bg} ${levelStyle.text} border ${levelStyle.border}`}>
                        {mount.level}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mount.meaning}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-4"
        >
          Tap any mount to reveal its meaning
        </motion.p>
      </motion.section>
    );
  }
);
