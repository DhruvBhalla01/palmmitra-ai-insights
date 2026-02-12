import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface FinalBlessingProps {
  message: string;
  name: string;
}

export const FinalBlessing = forwardRef<HTMLElement, FinalBlessingProps>(
  function FinalBlessing({ message, name }, ref) {
    return (
      <motion.section
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="relative rounded-3xl overflow-hidden glass-premium border border-accent/30">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/10" />
          <div className="absolute inset-0 shimmer pointer-events-none" />
          
          <div className="relative p-10 md:p-14 text-center">
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-6xl md:text-7xl block mb-6"
              style={{ filter: 'drop-shadow(0 0 20px hsl(42 87% 55% / 0.5))' }}
            >
              🙏
            </motion.span>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl md:text-2xl font-serif text-foreground leading-relaxed max-w-2xl mx-auto"
            >
              "{message}"
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-8"
            >
              <p className="text-gradient-gold font-semibold text-lg">
                — Your PalmMitra Reading for {name}
              </p>
              <p className="sanskrit-accent mt-2">ॐ शुभ आशीर्वाद</p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    );
  }
);
