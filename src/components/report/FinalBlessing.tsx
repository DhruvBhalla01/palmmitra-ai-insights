import { motion } from 'framer-motion';

interface FinalBlessingProps {
  message: string;
  name: string;
}

export function FinalBlessing({ message, name }: FinalBlessingProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="relative rounded-3xl overflow-hidden">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative p-8 md:p-12 text-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-5xl md:text-6xl block mb-6"
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
            className="mt-6 text-accent font-medium"
          >
            — Your PalmMitra Reading for {name}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
