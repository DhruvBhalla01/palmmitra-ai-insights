interface SectionDividerProps {
  variant?: 'wave' | 'mandala' | 'gradient' | 'ornate';
}

export function SectionDivider({ variant = 'mandala' }: SectionDividerProps) {
  if (variant === 'wave') {
    return (
      <div className="relative h-20 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full animate-fade-in"
          style={{ animationDuration: '800ms' }}
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
        </svg>
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className="h-16 flex items-center justify-center animate-reveal-scale-x origin-center">
        <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>
    );
  }

  if (variant === 'ornate') {
    return (
      <div className="py-8 flex items-center justify-center gap-4 animate-reveal-fade">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/40" />
        <div className="flex items-center gap-2">
          <span className="text-accent/70 text-xs animate-twinkle">✦</span>
          <span className="text-accent/60 text-lg">◆</span>
          <span
            className="text-accent/70 text-xs animate-twinkle"
            style={{ animationDelay: '0.5s' }}
          >
            ✦
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/40" />
      </div>
    );
  }

  // Default: mandala
  return (
    <div className="py-8 flex items-center justify-center animate-fade-in" style={{ animationDuration: '800ms' }}>
      <div className="flex items-center gap-4 w-full max-w-lg">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-accent/40" />

        {/* Mini mandala */}
        <svg
          className="w-8 h-8 text-accent/50 animate-rotate-slow"
          viewBox="0 0 32 32"
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
        </svg>

        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-accent/40" />
      </div>
    </div>
  );
}
