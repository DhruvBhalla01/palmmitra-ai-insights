import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Target, Sparkles, Infinity as InfinityIcon,
  CheckCircle, AlertTriangle, Share2, ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/AnimatedSection';
import { CompatibilityScoreRing } from '@/components/palmmatch/CompatibilityScoreRing';
import { DimensionCard } from '@/components/palmmatch/DimensionCard';
import { PalmMatchPaywall } from '@/components/palmmatch/PalmMatchPaywall';
import { StickyUnlockCTA } from '@/components/report/StickyUnlockCTA';
import { usePalmMatchUnlock } from '@/hooks/usePalmMatchUnlock';
import { PalmMatchReading } from '@/components/palmmatch/types';
import { useToast } from '@/hooks/use-toast';

const DIMENSION_TEASERS = {
  communication: "Your communication styles decoded — where you naturally align and where friction hides.",
  lifeGoals: "Your life timelines compared — when your ambitions converge and when they diverge.",
  romance: "The romantic arc written in your palm lines — your peak connection window revealed.",
  spiritualAlignment: "Your spiritual energies mapped — and the single practice that amplifies your bond.",
};

// Ambient floating particles in content body
const CONTENT_PARTICLES = [
  { left: '3%',  top: '6%',   size: 4, color: 'hsl(42 87% 55%)',  opacity: 0.4,  delay: 0 },
  { left: '97%', top: '12%',  size: 3, color: 'hsl(270 60% 55%)', opacity: 0.28, delay: 1.5 },
  { left: '6%',  top: '32%',  size: 5, color: 'hsl(42 87% 55%)',  opacity: 0.3,  delay: 2.8 },
  { left: '94%', top: '42%',  size: 3, color: 'hsl(245 58% 55%)', opacity: 0.25, delay: 0.8 },
  { left: '4%',  top: '60%',  size: 4, color: 'hsl(42 87% 55%)',  opacity: 0.28, delay: 2 },
  { left: '96%', top: '70%',  size: 3, color: 'hsl(320 70% 60%)', opacity: 0.22, delay: 1.2 },
  { left: '8%',  top: '86%',  size: 5, color: 'hsl(42 87% 55%)',  opacity: 0.3,  delay: 3.5 },
  { left: '92%', top: '91%',  size: 3, color: 'hsl(270 60% 55%)', opacity: 0.25, delay: 0.5 },
];

// Deterministic pseudo-random constellation stars (no re-render jitter)
const CONSTELLATION_STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: (i * 17.3 + i * i * 0.4) % 100,
  y: (i * 13.7 + i * 7.1) % 100,
  r: i % 5 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.7,
  delay: (i * 0.15) % 3,
  duration: 3 + (i % 4),
}));

const CONSTELLATION_LINES: [number, number][] = [[0,7],[7,14],[14,21],[3,11],[11,19],[35,42],[42,49],[21,28]];

export default function PalmMatchReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reading, setReading] = useState<PalmMatchReading | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('palmMatchData');
    if (!raw) { navigate('/palmmatch'); return; }
    const data = JSON.parse(raw);
    setReading(data.reading);
    setEmail(data.email || '');
  }, [navigate]);

  const { isUnlocked, isLoading, isProcessing, initiatePayment } = usePalmMatchUnlock(id, email);

  const handleUnlockClick = () => initiatePayment('palmmatch149');

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: 'My PalmMatch Compatibility Report', text: `See my compatibility reading on PalmMitra!`, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Share your PalmMatch result with them.' });
    }
  };

  // ── Cinematic loading state ──
  if (!reading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mystic relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(42 87% 55%) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="w-14 h-14 rounded-full border-2 border-accent/20 border-t-accent mx-auto mb-5"
          />
          <p className="text-white/60 text-sm font-medium">Loading your reading...</p>
        </motion.div>
      </div>
    );
  }

  const {
    person1Name, person2Name, relationshipType,
    overallScore, compatibilityVerdict, overallNarrative,
    emotionalBond, communication, lifeGoals, romance, spiritualAlignment,
    strengthsAndChallenges, timingGuidance, remediesForPair, finalBlessing,
  } = reading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {!isUnlocked && !isLoading && (
        <StickyUnlockCTA
          userName={`${person1Name} & ${person2Name}`}
          onUnlockClick={handleUnlockClick}
          isUnlocked={isUnlocked}
        />
      )}

      <main className="pt-24 pb-16">

        {/* ══ CINEMATIC HERO ══════════════════════════════════════════════════ */}
        <section className="bg-gradient-mystic px-4 pt-14 pb-28 relative overflow-hidden min-h-[80vh] flex flex-col justify-center">

          {/* Ambient glow blobs */}
          <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, hsl(42 87% 55% / 0.08), transparent)', filter: 'blur(90px)' }} />
          <div className="absolute bottom-0 left-0 w-[620px] h-[620px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, hsl(270 60% 55% / 0.07), transparent)', filter: 'blur(110px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, hsl(245 58% 45% / 0.055), transparent)', filter: 'blur(70px)' }} />

          {/* SVG Constellation starfield */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            {CONSTELLATION_STARS.map(s => (
              <motion.circle
                key={s.id}
                cx={`${s.x}%`}
                cy={`${s.y}%`}
                r={s.r}
                fill="hsl(42 87% 55%)"
                animate={{ opacity: [s.r > 1 ? 0.6 : 0.2, s.r > 1 ? 1 : 0.5, s.r > 1 ? 0.6 : 0.2] }}
                transition={{ repeat: Infinity, duration: s.duration, delay: s.delay, ease: 'easeInOut' }}
              />
            ))}
            {CONSTELLATION_LINES.map(([a, b], i) => (
              <motion.line
                key={i}
                x1={`${CONSTELLATION_STARS[a].x}%`} y1={`${CONSTELLATION_STARS[a].y}%`}
                x2={`${CONSTELLATION_STARS[b].x}%`} y2={`${CONSTELLATION_STARS[b].y}%`}
                stroke="hsl(42 87% 55%)" strokeWidth="0.3"
                animate={{ opacity: [0, 0.14, 0] }}
                transition={{ repeat: Infinity, duration: 6, delay: i * 0.8, ease: 'easeInOut' }}
              />
            ))}
          </svg>

          {/* Sacred geometry watermarks */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            {/* Large OM */}
            <span className="absolute text-[22rem] md:text-[30rem] text-accent/[0.028] font-serif leading-none">ॐ</span>
            {/* Rotating Sri Yantra hexagram */}
            <motion.svg
              className="absolute w-[420px] h-[420px] opacity-[0.038]"
              viewBox="0 0 200 200"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 120, ease: 'linear' }}
            >
              <polygon points="100,10 190,165 10,165" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.5" />
              <polygon points="100,190 10,35 190,35" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="20" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.3" strokeDasharray="3 8" />
            </motion.svg>
            {/* Counter-rotating inner square */}
            <motion.svg
              className="absolute w-[200px] h-[200px] opacity-[0.045]"
              viewBox="0 0 100 100"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 80, ease: 'linear' }}
            >
              <rect x="20" y="20" width="60" height="60" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.8" transform="rotate(45 50 50)" />
              <rect x="20" y="20" width="60" height="60" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.5" />
            </motion.svg>
          </div>

          <div className="relative z-10 max-w-xl mx-auto text-center">
            {/* Live activity pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex justify-center mb-4"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-premium border border-green-500/20"
                style={{ boxShadow: '0 0 20px hsl(142 72% 50% / 0.08)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-[11px] text-foreground/65 font-medium">3 couples reading right now</span>
              </div>
            </motion.div>

            {/* Sanskrit eyebrow — ornate with flanking lines */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '44px' }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="h-px flex-shrink-0"
                style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55% / 0.65))' }}
              />
              <p className="text-sm tracking-[0.22em] text-accent italic font-medium whitespace-nowrap">
                ॐ Yugal Rekha · Compatibility Reading
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '44px' }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="h-px flex-shrink-0"
                style={{ background: 'linear-gradient(270deg, transparent, hsl(42 87% 55% / 0.65))' }}
              />
            </motion.div>

            {/* Names — orchestrated cinematic reveal */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-3">
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-3xl md:text-5xl font-serif font-bold text-gradient-gold"
              >
                {person1Name}
              </motion.span>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex flex-col items-center gap-0.5"
              >
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="text-2xl md:text-3xl text-accent leading-none"
                  style={{ filter: 'drop-shadow(0 0 14px hsl(42 87% 55% / 0.9))' }}
                >
                  ♥
                </motion.span>
                <span className="text-[9px] text-accent/60 tracking-[0.3em] uppercase font-medium">yugal</span>
              </motion.div>

              <motion.span
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-3xl md:text-5xl font-serif font-bold text-gradient-gold"
              >
                {person2Name}
              </motion.span>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-sm text-white/50 mb-10 capitalize"
            >
              {relationshipType} Compatibility ·{' '}
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </motion.p>

            {/* Score Ring — cinematic pedestal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 1.0, ease: [0.34, 1.1, 0.64, 1] }}
              className="flex justify-center mb-10"
            >
              <div className="relative">
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: '-48px',
                    background: 'radial-gradient(circle, hsl(42 87% 55% / 0.14) 0%, transparent 70%)',
                  }}
                />
                <CompatibilityScoreRing
                  score={overallScore}
                  verdict={compatibilityVerdict}
                  size={280}
                />
              </div>
            </motion.div>

            {/* Share CTA */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              onClick={handleShare}
              className="inline-flex items-center gap-2 glass-premium border border-accent/25 rounded-full px-6 py-3 text-sm text-white/80 hover:text-white hover:border-accent/55 transition-all duration-200 mx-auto"
              style={{ boxShadow: '0 0 20px hsl(42 87% 55% / 0.08)' }}
            >
              <Share2 className="w-3.5 h-3.5 text-accent" />
              Share your result
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </section>

        {/* ══ REPORT CONTENT ══════════════════════════════════════════════════ */}
        <div className="relative">
          {/* Ambient floating particles in content area */}
          {CONTENT_PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{ left: p.left, top: p.top, width: p.size, height: p.size, background: p.color }}
              animate={{ y: [0, -24, 0], opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4] }}
              transition={{ repeat: Infinity, duration: 5 + i * 0.7, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}

        <div className="container mx-auto px-4 max-w-3xl relative z-10">

          {/* Overall narrative — editorial quote treatment */}
          <AnimatedSection className="-mt-6 mb-10">
            <div
              className="glass-premium rounded-3xl p-6 md:p-9 border border-accent/15 relative overflow-hidden"
              style={{ boxShadow: '0 20px 60px hsl(245 58% 18% / 0.15), 0 0 0 1px hsl(42 87% 55% / 0.06)' }}
            >
              {/* Large decorative opening quote */}
              <div
                className="absolute top-1 left-5 text-9xl font-serif leading-none pointer-events-none select-none"
                style={{ color: 'hsl(42 87% 55% / 0.07)', lineHeight: 1 }}
              >
                ❝
              </div>
              {/* Subtle background gradient */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(42 87% 55% / 0.04), transparent)' }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, hsl(42 87% 55% / 0.5), transparent)' }} />
                  <p className="text-[10px] font-bold text-accent uppercase tracking-[0.22em]">Your Compatibility Story</p>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, hsl(42 87% 55% / 0.5), transparent)' }} />
                </div>
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed italic pl-4">{overallNarrative}</p>
              </div>
            </div>
          </AnimatedSection>

          {/* 5 Dimensions overview — premium mini-cards */}
          <AnimatedSection delay={0.1} className="mb-8">
            <div className="text-center mb-5">
              <p className="text-[10px] tracking-[0.25em] text-accent uppercase font-medium mb-1">Compatibility Dimensions</p>
              <h2 className="text-xl font-serif font-bold text-foreground">
                5 Layers of <span className="text-gradient-gold">Your Bond</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isUnlocked ? 'Full analysis unlocked' : '1 of 5 unlocked — free preview'}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Emotional', score: emotionalBond.score,       icon: '❤',  unlocked: true,       from: 'hsl(350 80% 60%)', to: 'hsl(42 87% 55%)' },
                { label: 'Comms',     score: communication.score,        icon: '✦',  unlocked: isUnlocked, from: 'hsl(200 85% 55%)', to: 'hsl(170 70% 50%)' },
                { label: 'Goals',     score: lifeGoals.score,            icon: '◈',  unlocked: isUnlocked, from: 'hsl(145 60% 50%)', to: 'hsl(42 87% 55%)' },
                { label: 'Romance',   score: romance.score,              icon: '✿',  unlocked: isUnlocked, from: 'hsl(320 70% 60%)', to: 'hsl(270 60% 65%)' },
                { label: 'Spirit',    score: spiritualAlignment.score,   icon: 'ॐ', unlocked: isUnlocked, from: 'hsl(270 60% 55%)', to: 'hsl(245 58% 45%)' },
              ].map(({ label, score, icon, unlocked, from, to }, idx) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.07 }}
                  className="flex flex-col items-center gap-2 py-3 px-1 rounded-2xl relative overflow-hidden"
                  style={{
                    background: unlocked ? `linear-gradient(180deg, ${from}18, ${to}08)` : 'hsl(var(--background) / 0.5)',
                    border: `1px solid ${unlocked ? from + '35' : 'hsl(var(--accent) / 0.08)'}`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: unlocked ? `linear-gradient(90deg, transparent, ${from}, transparent)` : 'transparent' }}
                  />
                  <span className="text-base font-serif leading-none" style={{ color: unlocked ? from : 'hsl(var(--muted-foreground))' }}>
                    {icon}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium leading-tight text-center">{label}</span>
                  {unlocked ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + idx * 0.08 }}
                      className="text-sm font-bold tabular-nums"
                      style={{ color: from }}
                    >
                      {score}%
                    </motion.span>
                  ) : (
                    <span className="text-sm font-bold text-foreground/15">??%</span>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* ── Emotional Bond — Crown Jewel (always free) ── */}
          <AnimatedSection delay={0.15} className="mb-8">
            <div className="relative rounded-3xl overflow-hidden">
              {/* Top gradient bar — rose-to-gold */}
              <div
                className="h-1.5 w-full"
                style={{ background: 'linear-gradient(90deg, transparent, hsl(350 80% 60% / 0.6), hsl(42 87% 55%), transparent)' }}
              />
              {/* Free preview badge */}
              <div className="absolute top-5 right-5 z-10">
                <span className="text-[10px] bg-accent text-foreground font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Free Preview
                </span>
              </div>

              <div className="glass-premium p-8 md:p-12">
                <div className="flex items-start gap-4 mb-5">
                  {/* Icon with glow backdrop */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="absolute inset-0 rounded-2xl blur-lg opacity-30"
                      style={{ background: 'hsl(350 80% 60%)' }}
                    />
                    <div
                      className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, hsl(350 80% 60% / 0.22), hsl(42 87% 55% / 0.08))',
                        border: '1px solid hsl(350 80% 60% / 0.35)',
                        boxShadow: '0 0 20px hsl(350 80% 60% / 0.18)',
                      }}
                    >
                      <Heart className="w-7 h-7 fill-current" style={{ color: 'hsl(350 80% 60%)' }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-foreground text-lg leading-tight">
                      {emotionalBond.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Emotional Connection</p>
                  </div>
                </div>

                {/* Score bar — thicker with shimmer */}
                <div className="h-4 bg-secondary rounded-full overflow-hidden mb-6 relative">
                  <motion.div
                    className="h-full rounded-full shimmer relative"
                    style={{ background: 'linear-gradient(90deg, hsl(350 80% 60%), hsl(42 87% 55%), hsl(42 90% 68%))' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${emotionalBond.score}%` }}
                    transition={{ duration: 1.3, ease: 'easeOut', delay: 0.6 }}
                  />
                </div>

                {/* Dramatic score centrepiece */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.7, ease: [0.34, 1.2, 0.64, 1] }}
                  className="flex items-end justify-center gap-1 mb-6 relative"
                >
                  {/* Glow halo behind number */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 60%, hsl(350 80% 60% / 0.14), transparent)' }}
                  />
                  <span
                    className="text-8xl md:text-9xl font-serif font-bold tabular-nums leading-none relative"
                    style={{
                      color: 'hsl(350 80% 60%)',
                      textShadow: '0 0 40px hsl(350 80% 60% / 0.55), 0 0 80px hsl(350 80% 60% / 0.2)',
                    }}
                  >
                    {emotionalBond.score}
                  </span>
                  <span
                    className="text-3xl font-serif font-semibold mb-4 relative"
                    style={{ color: 'hsl(350 80% 60% / 0.7)' }}
                  >
                    %
                  </span>
                </motion.div>

                {/* Ornate divider before guidance */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55% / 0.3))' }} />
                  <span className="text-accent/50 text-xs">✦</span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, transparent, hsl(42 87% 55% / 0.3))' }} />
                </div>

                <p className="text-sm md:text-base text-foreground/85 leading-relaxed mb-5">
                  {emotionalBond.text}
                </p>
                <div
                  className="p-5 rounded-2xl border border-accent/25"
                  style={{ background: 'hsl(42 87% 55% / 0.06)' }}
                >
                  <p className="text-sm text-accent font-medium italic leading-relaxed">
                    ✦ {emotionalBond.guidance}
                  </p>
                </div>

                {/* Bottom decorative hearts watermark */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none select-none">
                  <span className="text-4xl text-accent/7 font-serif">❤</span>
                  <span className="text-6xl text-accent/5 font-serif -mt-3">❤</span>
                  <span className="text-4xl text-accent/7 font-serif">❤</span>
                </div>
              </div>

              {/* Bottom gradient bar */}
              <div
                className="h-1.5 w-full"
                style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55%), transparent)' }}
              />
            </div>
          </AnimatedSection>

          {/* ── 4 Locked/Unlocked Dimension Cards ── */}
          <AnimatedSection delay={0.2} className="mb-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <DimensionCard
                dimension={communication}
                icon={MessageCircle}
                dimensionKey="communication"
                isUnlocked={isUnlocked}
                onUnlockClick={handleUnlockClick}
                delay={0.05}
                teaser={DIMENSION_TEASERS.communication}
              />
              <DimensionCard
                dimension={lifeGoals}
                icon={Target}
                dimensionKey="lifeGoals"
                isUnlocked={isUnlocked}
                onUnlockClick={handleUnlockClick}
                delay={0.1}
                teaser={DIMENSION_TEASERS.lifeGoals}
              />
              <DimensionCard
                dimension={romance}
                icon={Sparkles}
                dimensionKey="romance"
                isUnlocked={isUnlocked}
                onUnlockClick={handleUnlockClick}
                delay={0.15}
                teaser={DIMENSION_TEASERS.romance}
              />
              <DimensionCard
                dimension={spiritualAlignment}
                icon={InfinityIcon}
                dimensionKey="spiritualAlignment"
                isUnlocked={isUnlocked}
                onUnlockClick={handleUnlockClick}
                delay={0.2}
                teaser={DIMENSION_TEASERS.spiritualAlignment}
              />
            </div>
          </AnimatedSection>

          {/* ── Paywall (locked) ── */}
          {!isUnlocked && (
            <PalmMatchPaywall
              person1Name={person1Name}
              person2Name={person2Name}
              onUnlockClick={(plan) => initiatePayment(plan)}
              isProcessing={isProcessing}
            />
          )}

          {/* ── Strengths & Challenges (unlocked) ── */}
          {isUnlocked && (
            <AnimatedSection delay={0.1} className="mb-10">
              <div className="glass-premium gradient-border rounded-3xl p-7 md:p-9">
                <h2 className="text-xl font-serif font-bold text-foreground mb-7 text-center">
                  Strengths & <span className="text-gradient-gold">Growth Areas</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Your Shared Strengths
                    </h3>
                    <div className="space-y-3">
                      {strengthsAndChallenges.strengths.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -16 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/15"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground/80 leading-relaxed">{s}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Growth Opportunities
                    </h3>
                    <div className="space-y-3">
                      {strengthsAndChallenges.challenges.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 16 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground/80 leading-relaxed">{c}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-accent/6 border border-accent/18">
                  <p className="text-sm font-semibold text-accent mb-2 text-center text-xs uppercase tracking-widest">
                    Your Growth Path Together
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed italic text-center">
                    "{strengthsAndChallenges.growthPath}"
                  </p>
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── Timing Guidance (unlocked) ── */}
          {isUnlocked && (
            <AnimatedSection delay={0.15} className="mb-10">
              <div className="glass-premium rounded-2xl p-6 md:p-8 border border-accent/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="font-serif font-bold text-foreground text-lg">
                    Timing Guidance for {person1Name} & {person2Name}
                  </h2>
                </div>
                <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                  {timingGuidance}
                </p>
              </div>
            </AnimatedSection>
          )}

          {/* ── Spiritual Remedies (unlocked) ── */}
          {isUnlocked && (
            <AnimatedSection delay={0.2} className="mb-10">
              <div className="glass-premium rounded-2xl p-6 md:p-8 border border-accent/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="font-serif font-bold text-foreground text-lg">
                    Spiritual Remedies for Your Bond
                  </h2>
                </div>
                <div className="space-y-4">
                  {remediesForPair.map((remedy, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-2xl border border-accent/12"
                      style={{ background: 'hsl(42 87% 55% / 0.04)' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0 shadow-[0_0_16px_hsl(42_87%_55%/0.5)]">
                        {i + 1}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed pt-0.5">{remedy}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── Final Blessing (always shown) — grand finale ── */}
          <AnimatedSection delay={0.25} className="mb-10">
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="relative bg-gradient-mystic rounded-3xl overflow-hidden"
            >
              {/* Atmospheric multi-layer glows */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(ellipse 60% 40% at 50% 0%, hsl(42 87% 55% / 0.15), transparent),
                    radial-gradient(ellipse 40% 60% at 20% 100%, hsl(270 60% 55% / 0.1), transparent),
                    radial-gradient(ellipse 40% 60% at 80% 100%, hsl(245 58% 45% / 0.1), transparent)
                  `,
                }}
              />

              {/* Animated OM watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <motion.span
                  animate={{ scale: [1, 1.04, 1], opacity: [0.06, 0.11, 0.06] }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                  className="text-[14rem] md:text-[18rem] text-accent font-serif leading-none"
                >
                  ॐ
                </motion.span>
              </div>

              {/* Rotating mandala watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                <motion.svg
                  className="w-[500px] h-[500px]"
                  viewBox="0 0 200 200"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 90, ease: 'linear' }}
                >
                  {[...Array(8)].map((_, i) => (
                    <g key={i} transform={`rotate(${i * 45} 100 100)`}>
                      <ellipse cx="100" cy="28" rx="12" ry="22" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.4" />
                    </g>
                  ))}
                  <circle cx="100" cy="100" r="88" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.3" strokeDasharray="4 8" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="hsl(42 87% 55%)" strokeWidth="0.25" />
                </motion.svg>
              </div>

              {/* Top border line */}
              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(42 87% 55% / 0.3) 20%, hsl(42 87% 55% / 0.8) 50%, hsl(42 87% 55% / 0.3) 80%, transparent 100%)' }} />

              <div className="relative z-10 p-12 md:p-16 text-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-[11px] tracking-[0.3em] text-accent/80 uppercase font-semibold mb-3"
                >
                  ॐ Ashirvaad · Divine Blessing
                </motion.p>

                {/* Animated divider line */}
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '120px' }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35, duration: 0.7 }}
                  className="h-px mx-auto mb-7"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(42 87% 55% / 0.7), transparent)' }}
                />

                <motion.blockquote
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-xl md:text-2xl lg:text-3xl font-serif italic text-white/90 leading-relaxed mb-7 max-w-2xl mx-auto"
                  style={{ textShadow: '0 2px 24px hsl(42 87% 55% / 0.2)' }}
                >
                  "{finalBlessing}"
                </motion.blockquote>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <p className="text-sm text-white/55 mb-1">— Blessed for</p>
                  <p
                    className="font-serif font-semibold text-lg text-gradient-gold"
                  >
                    {person1Name} & {person2Name}
                  </p>
                  <motion.p
                    className="text-xl text-accent/65 mt-4 font-serif"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  >
                    ॐ शुभ आशीर्वाद
                  </motion.p>
                </motion.div>
              </div>

              {/* Bottom border line */}
              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(42 87% 55% / 0.8) 50%, transparent 100%)' }} />
            </motion.section>
          </AnimatedSection>

          {/* ── Share + Try Another ── */}
          <AnimatedSection delay={0.3}>
            <div className="glass-premium rounded-3xl p-7 md:p-8 border border-accent/20 text-center">
              <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                Share Your{' '}
                <span className="text-gradient-gold">PalmMatch Result</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Let them see what the palms say about your connection
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleShare}
                  className="btn-gold rounded-2xl px-8 py-5 gap-2 text-foreground font-semibold"
                >
                  <Share2 className="w-4 h-4" />
                  Share This Reading
                </Button>
                <Button
                  onClick={() => navigate('/palmmatch')}
                  variant="outline"
                  className="border-accent/30 text-foreground hover:bg-accent/10 rounded-2xl px-8 py-5 gap-2"
                >
                  <Heart className="w-4 h-4 text-accent" />
                  Try Another PalmMatch
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
        </div>{/* end relative ambient particles wrapper */}
      </main>
      <Footer />
    </div>
  );
}
