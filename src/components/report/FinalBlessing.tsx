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
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="mb-12 relative bg-gradient-mystic noise-overlay rounded-3xl overflow-hidden"
      >
        {/* OM watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[8rem] text-accent/10 font-serif leading-none">ॐ</span>
        </div>

        {/* Top gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="relative z-10 p-10 md:p-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="sanskrit-accent mb-6"
          >
            ॐ Ashirvaad · Divine Blessing
          </motion.p>

          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl md:text-2xl font-serif italic text-foreground/90 leading-relaxed max-w-2xl mx-auto mb-6"
          >
            "{message}"
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-gradient-gold font-semibold">— Blessed for {name}</p>
            <p className="sanskrit-accent mt-2">ॐ शुभ आशीर्वाद</p>
          </motion.div>
        </div>

        {/* Bottom gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </motion.section>
    );
  }
);
