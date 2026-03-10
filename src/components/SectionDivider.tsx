import { motion } from 'framer-motion';

interface SectionDividerProps {
  variant?: 'wave' | 'mandala' | 'gradient' | 'ornate';
}

export function SectionDivider({ variant = 'mandala' }: SectionDividerProps) {
  if (variant === 'wave') {
    return (
      <div className="relative h-20 overflow-hidden">
        <motion.svg
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--gold) / 0)" />
              <stop offset="50%" stopColor="hsl(var(--gold) / 0.2)" />
              <stop offset="100%" stopColor="hsl(var(--gold) / 0)" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,40 1440,40 L1440,80 L0,80 Z"
            fill="url(#waveGradient)"
          />
          <path
            d="M0,50 C360,20 720,80 1080,50 C1260,35 1380,50 1440,50"
            fill="none"
            stroke="hsl(var(--gold) / 0.3)"
            strokeWidth="1"
          />
        </motion.svg>
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="h-16 flex items-center justify-center"
      >
        <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </motion.div>
    );
  }

  if (variant === 'ornate') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-8 flex items-center justify-center gap-4"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/40" />
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-accent/70 text-xs"
          >
            ✦
          </motion.span>
          <span className="text-accent/60 text-lg">◆</span>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="text-accent/70 text-xs"
          >
            ✦
          </motion.span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/40" />
      </motion.div>
    );
  }

  // Default: mandala
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-8 flex items-center justify-center"
    >
      <div className="flex items-center gap-4 w-full max-w-lg">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/40" />
        
        {/* Mini mandala */}
        <motion.svg 
          className="w-8 h-8 text-accent/50"
          viewBox="0 0 32 32"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.5" />
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1="16"
              y1="2"
              x2="16"
              y2="6"
              stroke="currentColor"
              strokeWidth="0.3"
              transform={`rotate(${i * 45} 16 16)`}
            />
          ))}
        </motion.svg>
        
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/40" />
      </div>
    </motion.div>
  );
}