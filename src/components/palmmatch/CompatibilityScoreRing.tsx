import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface CompatibilityScoreRingProps {
  score: number;
  verdict: string;
  size?: number;
}

export function CompatibilityScoreRing({ score, verdict, size = 280 }: CompatibilityScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [sparklesVisible, setSparklesVisible] = useState(false);
  const [burstFired, setBurstFired] = useState(false);

  useEffect(() => {
    setDisplayScore(0);
    setSparklesVisible(false);
    setBurstFired(false);
    let frame: number;
    const duration = 1600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(eased * score));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setSparklesVisible(true);
          setBurstFired(true);
        }, 200);
      }
    };
    const timer = setTimeout(() => { frame = requestAnimationFrame(tick); }, 400);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [score]);

  const cx = size / 2;
  const cy = size / 2;
  const scoreR = size / 2 - 24;
  const circumference = 2 * Math.PI * scoreR;
  const offset = circumference - (circumference * score) / 100;

  const config =
    score >= 85
      ? { stroke: '#4ade80', strokeFrom: '#4ade80', strokeTo: '#86efac', glow: 'rgba(74,222,128,0.5)', badgeCls: 'text-green-400 border-green-400/30', trackOpacity: 0.1 }
      : score >= 70
      ? { stroke: 'hsl(42,87%,58%)', strokeFrom: 'hsl(42,87%,55%)', strokeTo: 'hsl(42,90%,76%)', glow: 'rgba(218,165,32,0.55)', badgeCls: 'text-amber-400 border-amber-400/30', trackOpacity: 0.1 }
      : { stroke: '#f59e0b', strokeFrom: '#f59e0b', strokeTo: '#fcd34d', glow: 'rgba(245,158,11,0.45)', badgeCls: 'text-amber-500 border-amber-500/30', trackOpacity: 0.08 };

  const spikeCount = score >= 85 ? 12 : 8;
  const spikeInnerR = scoreR - 3;
  const spikeOuterR = scoreR + 10;

  // Star orbit ring — 12 dots at 30° intervals
  const starRingR = scoreR + 34;
  const starDots = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      return {
        x: cx + starRingR * Math.cos(angle),
        y: cy + starRingR * Math.sin(angle),
        large: i % 3 === 0,
      };
    }), [cx, cy, starRingR]);

  // Golden spikes for score >= 75
  const spikes = useMemo(() =>
    Array.from({ length: spikeCount }, (_, i) => {
      const angle = (i * (360 / spikeCount) - 90) * (Math.PI / 180);
      const leftAngle = angle - 0.14;
      const rightAngle = angle + 0.14;
      return {
        d: `M ${cx + spikeInnerR * Math.cos(leftAngle)} ${cy + spikeInnerR * Math.sin(leftAngle)} L ${cx + spikeOuterR * Math.cos(angle)} ${cy + spikeOuterR * Math.sin(angle)} L ${cx + spikeInnerR * Math.cos(rightAngle)} ${cy + spikeInnerR * Math.sin(rightAngle)} Z`,
        delay: i * 0.07,
      };
    }), [cx, cy, spikeCount, spikeInnerR, spikeOuterR]);

  // Particle burst — 16 radial dots
  const burstParticles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => {
      const baseAngle = (i * 22.5) * (Math.PI / 180);
      const jitter = (((i * 7 + 3) % 10) - 5) * 0.05;
      const angle = baseAngle + jitter;
      const dist = 55 + ((i * 13) % 30);
      return {
        targetX: cx + dist * Math.cos(angle),
        targetY: cy + dist * Math.sin(angle),
        r: 1.5 + ((i * 3) % 3) * 0.75,
        delay: ((i * 7) % 10) * 0.03,
      };
    }), [cx, cy]);

  // 6 sparkle dot positions on inner ring
  const sparkleR = scoreR + 16;
  const sparklePositions = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60 - 90) * (Math.PI / 180);
      return { x: cx + sparkleR * Math.cos(angle), y: cy + sparkleR * Math.sin(angle) };
    }), [cx, cy, sparkleR]);

  const gradientId = `score-grad-${score}`;
  const burstGradId = `burst-grad-${score}`;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Cinematic backdrop wrapper */}
      <div
        className="relative"
        style={{ filter: `drop-shadow(0 0 80px ${config.glow}) drop-shadow(0 0 40px ${config.glow})` }}
      >
        {/* Deep-space radial backdrop */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '-40px',
            background: `radial-gradient(ellipse 80% 80% at 50% 50%, hsl(245 58% 12% / 0.85), transparent)`,
          }}
        />

        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={config.strokeFrom} />
                <stop offset="60%" stopColor={config.strokeTo} />
                <stop offset="100%" stopColor={config.strokeFrom} />
              </linearGradient>
              <radialGradient id={burstGradId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={config.strokeTo} stopOpacity="1" />
                <stop offset="100%" stopColor={config.strokeFrom} stopOpacity="0.3" />
              </radialGradient>
              {/* Center nebula gradient */}
              <radialGradient id={`nebula-${score}`} cx="50%" cy="35%" r="65%">
                <stop offset="0%" stopColor={config.strokeFrom} stopOpacity="0.18" />
                <stop offset="40%" stopColor="hsl(245 58% 45%)" stopOpacity="0.08" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Outermost star orbit guide circle */}
            <circle
              cx={cx} cy={cy}
              r={starRingR}
              fill="none"
              stroke={`hsl(var(--accent) / 0.10)`}
              strokeWidth="0.5"
              strokeDasharray="1 18.8"
            />

            {/* Outermost subtle ring — slow-rotating dashed */}
            <motion.circle
              cx={cx} cy={cy}
              r={scoreR + 20}
              fill="none"
              stroke={`hsl(var(--accent) / 0.18)`}
              strokeWidth="0.75"
              strokeDasharray="6 22"
              animate={{ rotate: 360 }}
              // @ts-expect-error framer-motion SVG rotation
              style={{ originX: `${cx}px`, originY: `${cy}px` }}
              transition={{ repeat: Infinity, duration: 50, ease: 'linear' }}
            />

            {/* Glow halo ring (replaces old dashed ring) */}
            <motion.circle
              cx={cx} cy={cy}
              r={scoreR + 12}
              fill="none"
              stroke={config.stroke}
              strokeWidth="2"
              strokeOpacity={0}
              animate={{ strokeOpacity: [0.04, 0.16, 0.04] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            />

            {/* Background track */}
            <circle
              cx={cx} cy={cy}
              r={scoreR}
              fill="none"
              stroke={`hsl(var(--accent) / ${config.trackOpacity})`}
              strokeWidth="20"
            />

            {/* Center nebula — aurora glow inside the ring */}
            <motion.circle
              cx={cx} cy={cy}
              r={scoreR - 12}
              fill={`url(#nebula-${score})`}
              animate={{ opacity: [0.55, 1, 0.55] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
            />

            {/* Pulsing glow track */}
            <motion.circle
              cx={cx} cy={cy}
              r={scoreR}
              fill="none"
              stroke={config.stroke}
              strokeWidth="20"
              strokeOpacity={0}
              animate={{ strokeOpacity: [0.04, 0.2, 0.04] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            />

            {/* Animated gradient score arc */}
            <motion.circle
              cx={cx} cy={cy}
              r={scoreR}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
              transform={`rotate(-90 ${cx} ${cy})`}
            />

            {/* Counter-rotating inner dashed ring */}
            <motion.circle
              cx={cx} cy={cy}
              r={scoreR - 20}
              fill="none"
              stroke={`hsl(var(--accent) / 0.12)`}
              strokeWidth="1"
              strokeDasharray="3 6"
              animate={{ rotate: -360 }}
              // @ts-expect-error framer-motion SVG rotation
              style={{ originX: `${cx}px`, originY: `${cy}px` }}
              transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
            />

            {/* Innermost ring */}
            <circle
              cx={cx} cy={cy}
              r={scoreR - 28}
              fill="none"
              stroke={`hsl(var(--accent) / 0.04)`}
              strokeWidth="0.5"
            />

            {/* Golden spikes (score >= 75) */}
            <AnimatePresence>
              {sparklesVisible && score >= 75 && spikes.map((spike, i) => (
                <motion.path
                  key={i}
                  d={spike.d}
                  fill={config.strokeTo}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.65, scale: 1 }}
                  // @ts-expect-error framer-motion SVG transform-origin
                  style={{ originX: `${cx}px`, originY: `${cy}px` }}
                  transition={{ duration: 0.45, delay: spike.delay, ease: [0.34, 1.56, 0.64, 1] }}
                />
              ))}
            </AnimatePresence>

            {/* Star orbit dots */}
            <AnimatePresence>
              {sparklesVisible && starDots.map((dot, i) => (
                <motion.circle
                  key={i}
                  cx={dot.x} cy={dot.y}
                  r={dot.large ? 2.5 : 1.5}
                  fill={config.strokeTo}
                  initial={{ opacity: 0, r: 0 }}
                  animate={{
                    opacity: [dot.large ? 0.55 : 0.2, dot.large ? 1 : 0.45, dot.large ? 0.55 : 0.2],
                    r: dot.large ? 2.5 : 1.5,
                  }}
                  transition={{
                    opacity: { repeat: Infinity, duration: 4, delay: i * 0.3, ease: 'easeInOut' },
                    r: { duration: 0.4, delay: i * 0.08, ease: 'backOut' },
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Sparkle reveal dots on inner ring */}
            <AnimatePresence>
              {sparklesVisible && sparklePositions.map((pos, i) => (
                <motion.circle
                  key={i}
                  cx={pos.x} cy={pos.y}
                  r={0}
                  fill={config.strokeTo}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: [0, 5, 3.5], opacity: [0, 1, 0.8] }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: 'backOut' }}
                />
              ))}
            </AnimatePresence>

            {/* Particle burst on score complete */}
            <AnimatePresence>
              {burstFired && burstParticles.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={cx} cy={cy}
                  r={p.r}
                  fill={i % 2 === 0 ? config.strokeFrom : config.strokeTo}
                  initial={{ cx, cy, opacity: 1 }}
                  animate={{ cx: p.targetX, cy: p.targetY, opacity: 0 }}
                  transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <motion.span
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.8, ease: 'backOut' }}
              className="font-serif font-bold leading-none tabular-nums"
              style={{ color: config.strokeFrom, fontSize: size * 0.36, textShadow: `0 0 40px ${config.glow}` }}
            >
              {displayScore}
            </motion.span>
            <span className="text-[11px] text-muted-foreground font-semibold tracking-widest uppercase">% match</span>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.45, ease: 'backOut' }}
              className="flex items-center gap-1 mt-1"
            >
              <Heart className="w-3.5 h-3.5 fill-current" style={{ color: config.strokeFrom }} />
              <Heart className="w-3.5 h-3.5 fill-current" style={{ color: config.strokeTo }} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Verdict badge — springy overshoot + outer glow halo */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.7 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative"
      >
        <div
          className="absolute inset-0 rounded-full blur-md opacity-35"
          style={{ background: config.strokeFrom }}
        />
        <div
          className={`relative text-sm font-semibold glass-premium px-9 py-3 rounded-full border ${config.badgeCls}`}
          style={{ boxShadow: `0 0 30px ${config.glow}, 0 0 60px ${config.glow}40, inset 0 1px 0 rgba(255,255,255,0.12)` }}
        >
          ✦ {verdict} ✦
        </div>
      </motion.div>
    </div>
  );
}
