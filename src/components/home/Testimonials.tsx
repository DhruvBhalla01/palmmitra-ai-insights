import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';

import avatarPriya from '@/assets/avatar-priya.jpg';
import avatarRohit from '@/assets/avatar-rohit.jpg';
import avatarAnanya from '@/assets/avatar-ananya.jpg';
import avatarVikram from '@/assets/avatar-vikram.jpg';
import avatarMeera from '@/assets/avatar-meera.jpg';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    text: 'Felt extremely accurate! The career prediction matched exactly what I was experiencing. The AI picked up details that genuinely amazed me.',
    avatar: avatarPriya,
  },
  {
    name: 'Rohit Patel',
    location: 'Bangalore',
    rating: 5,
    text: "I was confused about my next move. PalmMitra gave me the clarity and confidence to pursue my startup idea. Best ₹99 I've spent.",
    avatar: avatarRohit,
  },
  {
    name: 'Ananya Reddy',
    location: 'Mumbai',
    rating: 4,
    text: 'Was skeptical at first, but the detailed analysis won me over. The love & marriage section was surprisingly on-point. Highly recommend.',
    avatar: avatarAnanya,
  },
  {
    name: 'Vikram Singh',
    location: 'Jaipur',
    rating: 5,
    text: 'The spiritual remedies section was incredibly helpful. I feel more aligned with my life purpose after following the suggestions.',
    avatar: avatarVikram,
  },
  {
    name: 'Meera Iyer',
    location: 'Chennai',
    rating: 5,
    text: 'My reading predicted a significant relationship shift this year — and it happened. Scary accurate. Already bought the monthly plan.',
    avatar: avatarMeera,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t, animate = false }: { t: typeof testimonials[0]; animate?: boolean }) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 24 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-premium rounded-2xl p-6 border border-accent/15 flex flex-col gap-4 h-full"
    >
      <Quote className="w-8 h-8 text-accent/20 flex-shrink-0" />
      <p className="text-foreground/85 text-sm leading-relaxed flex-1">
        "{t.text}"
      </p>
      <div className="flex items-center gap-3 pt-2 border-t border-accent/10">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-accent/25"
        />
        <div>
          <p className="font-semibold text-foreground text-sm">{t.name}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={t.rating} />
            <span className="text-xs text-muted-foreground">{t.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrentIndex((prev) => {
      if (dir === 1) return (prev + 1) % testimonials.length;
      return prev === 0 ? testimonials.length - 1 : prev - 1;
    });
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 260 : -260, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 260 : -260, opacity: 0 }),
  };

  return (
    <section id="testimonials" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-14">
          <p className="sanskrit-accent mb-3">ॐ Jana Vani</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            What Our <span className="text-gradient-gold">Users</span> Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of people who discovered their destiny through their palms
          </p>
        </AnimatedSection>

        {/* ── Desktop: 3-column grid ─────────────────────── */}
        <div className="hidden lg:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.slice(0, 3).map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
        </div>

        {/* Bottom 2 on desktop */}
        <div className="hidden lg:grid grid-cols-2 gap-6 max-w-[672px] mx-auto mt-6">
          {testimonials.slice(3).map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.36 + i * 0.12 }}
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
        </div>

        {/* ── Mobile: carousel ──────────────────────────── */}
        <div className="lg:hidden max-w-md mx-auto relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 rounded-full glass-premium border-accent/20 hover:border-accent/40 w-11 h-11"
            onClick={() => navigate(-1)}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 rounded-full glass-premium border-accent/20 hover:border-accent/40 w-11 h-11"
            onClick={() => navigate(1)}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="overflow-hidden px-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <TestimonialCard t={testimonials[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2.5 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8 bg-accent' : 'w-1.5 bg-border'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
