import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import type { LifePhase } from './types';

interface LifePhaseSectionProps {
  phases: {
    growth: LifePhase;
    challenge: LifePhase;
    opportunity: LifePhase;
  };
}

const phaseConfig = [
  { 
    key: 'growth', 
    title: 'Growth Period', 
    icon: TrendingUp, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  { 
    key: 'challenge', 
    title: 'Challenge Period', 
    icon: AlertTriangle, 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  { 
    key: 'opportunity', 
    title: 'Opportunity Period', 
    icon: Sparkles, 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
] as const;

export const LifePhaseSection = forwardRef<HTMLElement, LifePhaseSectionProps>(
  function LifePhaseSection({ phases }, ref) {
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
          <span className="text-3xl">⏳</span>
          Your Next Destiny Phase
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {phaseConfig.map(({ key, title, icon: Icon, color, bgColor, borderColor }, index) => {
            const phase = phases[key];

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className={`glass rounded-2xl p-6 border ${borderColor} transition-all duration-300`}
              >
                <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                
                <h3 className="font-serif font-bold text-foreground mb-2">{title}</h3>
                
                <div className={`inline-flex px-3 py-1 rounded-full ${bgColor} mb-3`}>
                  <span className={`text-sm font-semibold ${color}`}>{phase.period}</span>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {phase.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    );
  }
);
