import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, HeartHandshake } from 'lucide-react';

interface LoveRelationshipsProps {
  emotionalStyle: string;
  commitmentTendency: string;
  relationshipAdvice: string;
}

export const LoveRelationships = forwardRef<HTMLElement, LoveRelationshipsProps>(
  function LoveRelationships({ emotionalStyle, commitmentTendency, relationshipAdvice }, ref) {
    const items = [
      { icon: Heart, label: 'Emotional Tendencies', value: emotionalStyle, color: 'text-pink-500', bg: 'bg-pink-500/10' },
      { icon: Users, label: 'Relationship Patterns', value: commitmentTendency, color: 'text-rose-500', bg: 'bg-rose-500/10' },
      { icon: HeartHandshake, label: 'Relationship Guidance', value: relationshipAdvice, color: 'text-red-500', bg: 'bg-red-500/10' },
    ];

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
          <span className="text-3xl">❤️</span>
          Love & Relationship Reading
        </h2>

        <div className="glass rounded-2xl p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {items.map(({ icon: Icon, label, value, color, bg }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
                className="p-5 rounded-xl bg-background/50"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6 p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 text-center"
          >
            <p className="text-sm text-muted-foreground italic">
              ✨ "Love flows best when it grows naturally. Trust the timing of your heart."
            </p>
          </motion.div>
        </div>
      </motion.section>
    );
  }
);
