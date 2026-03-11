import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import palmIconGold from '@/assets/palm-icon-gold.png';

interface DestinyRevealLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function DestinyRevealLoader({ isLoading, onComplete }: DestinyRevealLoaderProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (!isLoading) {
      // Generate burst particles when loading completes
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 360 - 180,
        y: Math.random() * 360 - 180,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-lg"
        >
          <div className="relative">
            {/* Expanding mandala rings */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [0.5, 1 + i * 0.3, 0.5], 
                  opacity: [0, 0.5 - i * 0.1, 0],
                  rotate: i % 2 === 0 ? [0, 180] : [0, -180]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: i * 0.4,
                  ease: 'easeInOut'
                }}
              >
                <svg className="w-48 h-48 text-accent" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                  {[...Array(8)].map((_, j) => (
                    <line
                      key={j}
                      x1="50"
                      y1="10"
                      x2="50"
                      y2="20"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      transform={`rotate(${j * 45} 50 50)`}
                    />
                  ))}
                </svg>
              </motion.div>
            ))}

            {/* Center palm */}
            <motion.img
              src={palmIconGold}
              alt="Palm Reading"
              className="relative z-10 w-20 h-20"
              animate={{ 
                scale: [1, 1.1, 1],
                filter: [
                  'drop-shadow(0 0 20px hsl(42 87% 55% / 0.4))',
                  'drop-shadow(0 0 40px hsl(42 87% 55% / 0.8))',
                  'drop-shadow(0 0 20px hsl(42 87% 55% / 0.4))'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Loading text */}
            <motion.div
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <p className="text-xl font-serif font-bold text-foreground mb-1">
                Reading Your Destiny...
              </p>
              <p className="text-sm text-muted-foreground">
                ॐ Bhavishya Darshan
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Completion burst */}
      {!isLoading && particles.length > 0 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full bg-accent"
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ 
                x: particle.x, 
                y: particle.y, 
                scale: 0, 
                opacity: 0 
              }}
              transition={{ 
                duration: 1, 
                delay: particle.delay,
                ease: 'easeOut'
              }}
            />
          ))}
          
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-8xl"
          >
            ✨
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}