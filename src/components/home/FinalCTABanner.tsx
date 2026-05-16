import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

function useCountdown() {
  const endTimeRef = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const key = 'palmMitraOfferEnd';
    const stored = localStorage.getItem(key);
    const now = Date.now();

    if (stored && parseInt(stored) > now) {
      endTimeRef.current = parseInt(stored);
    } else {
      const end = now + 24 * 60 * 60 * 1000;
      localStorage.setItem(key, String(end));
      endTimeRef.current = end;
    }

    const tick = () => {
      if (!endTimeRef.current) return;
      const diff = Math.max(0, endTimeRef.current - Date.now());
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ hours, minutes, seconds });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={display}
        initial={{ opacity: 0.6, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="glass-premium rounded-xl w-14 h-14 flex items-center justify-center border border-accent/25"
      >
        <span className="text-2xl font-serif font-bold text-gradient-gold tabular-nums">
          {display}
        </span>
      </motion.div>
      <span className="text-[10px] uppercase tracking-widest text-white/40 mt-1.5">{label}</span>
    </div>
  );
}

export function FinalCTABanner() {
  const { hours, minutes, seconds } = useCountdown();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden" aria-labelledby="final-cta-heading">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mystic" />

      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(42 87% 55%) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-accent/12 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-primary/25 blur-[100px] rounded-full pointer-events-none" aria-hidden="true" />

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
        {/* Sanskrit accent */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="sanskrit-accent mb-5 text-white/45"
        >
          ॐ Kaal Chakra
        </motion.p>

        {/* Headline */}
        <motion.h2
          id="final-cta-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-white leading-tight mb-5"
        >
          Your Destiny Won't Wait —{' '}
          <span className="text-gradient-gold block sm:inline">Neither Should You</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base md:text-lg text-white/60 mb-8 max-w-xl mx-auto leading-relaxed"
        >
          Join 12,400+ Indians who already know what their palm reveals. Start free — no
          sign-up, no credit card, results in 2 minutes.
        </motion.p>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <p className="text-xs uppercase tracking-widest text-accent/70 mb-4 font-medium">
            ₹50 offer expires in
          </p>
          <div className="flex items-center gap-3" aria-live="polite" aria-label="Countdown timer">
            <CountdownUnit value={hours} label="hrs" />
            <span className="text-accent/60 text-2xl font-bold pb-5">:</span>
            <CountdownUnit value={minutes} label="min" />
            <span className="text-accent/60 text-2xl font-bold pb-5">:</span>
            <CountdownUnit value={seconds} label="sec" />
          </div>
          <p className="text-xs text-white/35 mt-3">Use code <span className="text-accent font-semibold">PALMFRIEND</span> at checkout for ₹50 off</p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Link to="/upload">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button className="btn-gold text-foreground font-semibold text-lg px-12 py-7 rounded-2xl group shadow-gold-lg">
                <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                Scan My Palm — Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Micro-trust */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-5 text-xs text-white/35"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent/60" aria-hidden="true" />
            Results in 2 minutes
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-accent/60" aria-hidden="true" />
            Secure via Razorpay
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-accent/60" aria-hidden="true" />
            100% private · No card needed
          </span>
        </motion.div>
      </div>
    </section>
  );
}
