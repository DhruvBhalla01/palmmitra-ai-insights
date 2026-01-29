import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface PremiumBackgroundProps {
  showMandala?: boolean;
  intensity?: 'light' | 'medium' | 'full';
}

export function PremiumBackground({ showMandala = true, intensity = 'medium' }: PremiumBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = intensity === 'light' ? 20 : intensity === 'medium' ? 35 : 50;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
      });
    }
    
    setParticles(newParticles);
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Multi-layer radial gradients */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 0%, hsl(40 33% 95% / 0.8), transparent 70%),
            radial-gradient(ellipse 80% 40% at 0% 30%, hsl(42 87% 55% / 0.06), transparent 50%),
            radial-gradient(ellipse 80% 40% at 100% 30%, hsl(42 87% 55% / 0.06), transparent 50%),
            radial-gradient(ellipse 60% 50% at 50% 100%, hsl(245 58% 25% / 0.08), transparent 60%),
            radial-gradient(circle at 20% 80%, hsl(245 58% 25% / 0.04), transparent 40%),
            radial-gradient(circle at 80% 20%, hsl(245 58% 25% / 0.04), transparent 40%)
          `
        }}
      />

      {/* Floating spiritual particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, hsl(42 87% 55% / 0.6), hsl(42 87% 55% / 0.2))`,
            }}
            animate={{
              y: [-20, -40, -20],
              x: [0, particle.id % 2 === 0 ? 10 : -10, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Mandala watermark */}
      {showMandala && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg
            className="w-[800px] h-[800px] opacity-[0.03]"
            viewBox="0 0 200 200"
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          >
            {/* Outer ring */}
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-accent" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            
            {/* Petals */}
            {[...Array(12)].map((_, i) => (
              <g key={i} transform={`rotate(${i * 30} 100 100)`}>
                <ellipse cx="100" cy="30" rx="15" ry="25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-accent" />
                <ellipse cx="100" cy="40" rx="8" ry="15" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-primary" />
              </g>
            ))}
            
            {/* Inner patterns */}
            {[...Array(8)].map((_, i) => (
              <g key={`inner-${i}`} transform={`rotate(${i * 45} 100 100)`}>
                <path
                  d="M100 60 L110 80 L100 100 L90 80 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  className="text-accent"
                />
              </g>
            ))}
            
            {/* Center */}
            <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
            <circle cx="100" cy="100" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-primary" />
            <circle cx="100" cy="100" r="3" fill="currentColor" className="text-accent" opacity="0.5" />
          </motion.svg>
        </div>
      )}

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}