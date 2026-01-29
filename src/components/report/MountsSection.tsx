import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Crown, Shield, Palette, MessageCircle, ChevronDown } from 'lucide-react';
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
  { key: 'venus', name: 'Venus', subtitle: 'Love & Warmth', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-500' },
  { key: 'jupiter', name: 'Jupiter', subtitle: 'Leadership', icon: Crown, color: 'text-amber-500', bgColor: 'bg-amber-500' },
  { key: 'saturn', name: 'Saturn', subtitle: 'Discipline', icon: Shield, color: 'text-slate-500', bgColor: 'bg-slate-500' },
  { key: 'apollo', name: 'Apollo', subtitle: 'Creativity', icon: Palette, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  { key: 'mercury', name: 'Mercury', subtitle: 'Communication', icon: MessageCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
] as const;

const levelColors: Record<string, string> = {
  'High': 'bg-green-500 text-white',
  'Medium': 'bg-amber-500 text-white',
  'Low': 'bg-slate-400 text-white',
};

export function MountsSection({ mounts }: MountsSectionProps) {
  const [expandedMount, setExpandedMount] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 flex items-center gap-3">
        <span className="text-3xl">⭐</span>
        Palm Mounts & Personality Forces
      </h2>

      <div className="flex flex-wrap gap-4">
        {mountConfig.map(({ key, name, subtitle, icon: Icon, color, bgColor }, index) => {
          const mount = mounts[key];
          const isExpanded = expandedMount === key;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              layout
              onClick={() => setExpandedMount(isExpanded ? null : key)}
              className={`glass rounded-2xl border border-transparent hover:border-accent/30 transition-all duration-300 cursor-pointer ${
                isExpanded ? 'w-full md:w-auto md:min-w-80' : ''
              }`}
            >
              <div className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bgColor}/10 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-foreground">{name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelColors[mount.level]}`}>
                      {mount.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
                    <div className="px-4 pb-4 pt-0">
                      <div className="h-px bg-border mb-3" />
                      <p className="text-sm text-muted-foreground">
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
    </motion.section>
  );
}
