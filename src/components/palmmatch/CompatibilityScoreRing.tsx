import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface CompatibilityScoreRingProps {
  score: number;
  verdict: string;
  size?: number;
}

export function CompatibilityScoreRing({ score, verdict, size = 180 }: CompatibilityScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1400;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(eased * score));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { frame = requestAnimationFrame(tick); }, 400);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [score]);

  const cx = size / 2;
  const cy = size / 2;
  const scoreR = size / 2 - 16;
  const circumference = 2 * Math.PI * scoreR;
  const offset = circumference - (circumference * score) / 100;

  const config = score >= 85
    ? { stroke: '#4ade80', glow: 'rgba(74,222,128,0.4)', badgeCls: 'text-green-400 border-green-400/30' }
    : score >= 70
    ? { stroke: 'hsl(42,87%,55%)', glow: 'rgba(218,165,32,0.4)', badgeCls: 'text-amber-400 border-amber-400/30' }
    : { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.35)', badgeCls: 'text-amber-500 border-amber-500/30' };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ filter: `drop-shadow(0 0 18px ${config.glow})` }}
        >
          {/* Outer dashed decorative ring */}
          <circle
            cx={cx} cy={cy}
            r={scoreR + 10}
            fill="none"
            stroke="hsl(var(--accent) / 0.15)"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
          {/* Background track */}
          <circle
            cx={cx} cy={cy}
            r={scoreR}
            fill="none"
            stroke="hsl(var(--accent) / 0.1)"
            strokeWidth="14"
          />
          {/* Animated score arc */}
          <motion.circle
            cx={cx} cy={cy}
            r={scoreR}
            fill="none"
            stroke={config.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          {/* Inner thin ring */}
          <circle
            cx={cx} cy={cy}
            r={scoreR - 16}
            fill="none"
            stroke="hsl(var(--accent) / 0.08)"
            strokeWidth="1"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-5xl font-serif font-bold leading-none"
            style={{ color: config.stroke }}
          >
            {displayScore}
          </motion.span>
          <span className="text-[11px] text-muted-foreground font-medium tracking-wide">% match</span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex items-center gap-1 mt-1"
          >
            <Heart className="w-3 h-3 fill-current" style={{ color: config.stroke }} />
            <Heart className="w-3 h-3 fill-current" style={{ color: config.stroke }} />
          </motion.div>
        </div>
      </div>

      {/* Verdict badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className={`text-sm font-semibold glass-premium px-5 py-2 rounded-full border ${config.badgeCls}`}
      >
        ✦ {verdict} ✦
      </motion.div>
    </div>
  );
}
