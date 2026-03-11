import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import palmIconGold from '@/assets/palm-icon-gold.png';

interface DestinyRevealLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

const mysticalMessages = [
  { text: 'Reading your palm lines...', sub: 'Tracing the map of your destiny' },
  { text: 'Decoding your fate line...', sub: 'Uncovering career & purpose' },
  { text: 'Analyzing heart connections...', sub: 'Love & relationship patterns' },
  { text: 'Predicting future cycles...', sub: 'Life phases & turning points' },
  { text: 'Channeling spiritual wisdom...', sub: 'Personalized guidance for you' },
  { text: 'Preparing your destiny report...', sub: 'Almost ready...' },
];

export function DestinyRevealLoader({ isLoading, onComplete }: DestinyRevealLoaderProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through mystical messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % mysticalMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
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
          <div className="relative flex flex-col items-center">
            {/* Expanding mandala rings */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute flex items-center justify-center"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
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

            {/* Loading text with cycling messages */}
            <div className="mt-24 text-center min-h-[80px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-xl font-serif font-bold text-foreground mb-1">
                    {mysticalMessages[messageIndex].text}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {mysticalMessages[messageIndex].sub}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mt-6">
              {mysticalMessages.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i <= messageIndex ? 'bg-accent' : 'bg-accent/20'
                  }`}
                  animate={i === messageIndex ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              ))}
            </div>
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
