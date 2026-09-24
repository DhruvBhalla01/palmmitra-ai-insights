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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallViewport = window.matchMedia('(max-width: 767px)').matches;
    const baseCount = intensity === 'light' ? 12 : intensity === 'medium' ? 20 : 30;
    const particleCount = reducedMotion ? 0 : isSmallViewport ? 0 : baseCount;
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
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
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.id % 2 === 0 ? 'animate-particle-drift' : 'animate-particle-drift-alt'}`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, hsl(42 87% 55% / 0.6), hsl(42 87% 55% / 0.2))`,
              ['--particle-duration' as string]: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>

      {/* Mandala watermark */}
      {showMandala && (
        <div className="absolute inset-0 hidden md:flex items-center justify-center">
          <img src="/mandala.svg" alt="" width={800} height={800} decoding="async" className="w-[800px] h-[800px] opacity-[0.03]" />
        </div>
      )}

    </div>
  );
}
