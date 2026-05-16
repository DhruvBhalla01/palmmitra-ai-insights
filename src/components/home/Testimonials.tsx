import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle, TrendingUp } from 'lucide-react';
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
    occupation: 'Marketing Manager',
    rating: 5,
    highlight: 'Career prediction was exact',
    text: 'The career prediction matched my situation so precisely it gave me chills. The AI picked up that I was at a crossroads — I was debating whether to leave my job. The report said age 28–30 was my career pivot window. That was this year.',
    avatar: avatarPriya,
    verified: true,
    plan: 'Detailed Report',
    date: 'Dec 2024',
  },
  {
    name: 'Rohit Patel',
    location: 'Bangalore',
    occupation: 'Software Engineer',
    rating: 5,
    highlight: 'Best ₹99 I\'ve spent',
    text: "I was confused about my startup idea. PalmMitra's report gave me the clarity and confidence to actually pursue it. The wealth section said my financial peak window starts in 2025 — I'm going all in. Best ₹99 I've ever spent.",
    avatar: avatarRohit,
    verified: true,
    plan: 'Monthly Plan',
    date: 'Nov 2024',
  },
  {
    name: 'Ananya Reddy',
    location: 'Mumbai',
    occupation: 'Doctor',
    rating: 4,
    highlight: 'Love section was surprisingly accurate',
    text: 'I was skeptical — I\'m a doctor, I believe in science. But the detailed analysis won me over. The love & marriage section was surprisingly on-point about my emotional patterns. I recommended it to three colleagues.',
    avatar: avatarAnanya,
    verified: true,
    plan: 'Detailed Report',
    date: 'Jan 2025',
  },
  {
    name: 'Vikram Singh',
    location: 'Jaipur',
    occupation: 'Business Owner',
    rating: 5,
    highlight: 'Spiritual remedies changed my mindset',
    text: 'The spiritual remedies section was incredibly helpful. Following the practices for 30 days shifted my mindset in ways I can\'t fully explain. I feel more aligned with my purpose. Got the monthly plan for my whole family.',
    avatar: avatarVikram,
    verified: true,
    plan: 'Monthly Plan',
    date: 'Oct 2024',
  },
  {
    name: 'Meera Iyer',
    location: 'Chennai',
    occupation: 'HR Professional',
    rating: 5,
    highlight: 'Relationship prediction came true',
    text: 'My reading predicted a significant relationship shift this year — and it happened exactly as described. The detail level is like nothing I\'ve seen in any app. I\'ve shared PalmMitra with everyone in my friend group.',
    avatar: avatarMeera,
    verified: true,
    plan: 'Monthly Plan',
    date: 'Feb 2025',
  },
];

const aggregateStats = [
  { value: '4.9', label: 'Average Rating', icon: Star },
  { value: '2,100+', label: 'Verified Reviews', icon: CheckCircle },
  { value: '98%', label: 'Satisfaction Rate', icon: TrendingUp },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t, animate = false }: { t: typeof testimonials[0]; animate?: boolean }) {
  return (
    <motion.article
      initial={animate ? { opacity: 0, y: 24 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-premium rounded-2xl p-6 border border-accent/15 flex flex-col gap-4 h-full"
    >
      <div className="flex items-start justify-between gap-2">
        <Quote className="w-7 h-7 text-accent/25 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex items-center gap-1.5">
          <StarRating rating={t.rating} />
        </div>
      </div>

      {/* Highlight badge */}
      <div className="inline-flex">
        <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/15">
          "{t.highlight}"
        </span>
      </div>

      <p className="text-foreground/85 text-sm leading-relaxed flex-1">
        {t.text}
      </p>

      <div className="flex items-start gap-3 pt-3 border-t border-accent/10">
        <img
          src={t.avatar}
          alt={t.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover border-2 border-accent/25 flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-semibold text-foreground text-sm">{t.name}</p>
            {t.verified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-500 font-semibold">
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                Verified
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t.occupation} · {t.location}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-accent/80 bg-accent/8 px-1.5 py-0.5 rounded-full font-medium">{t.plan}</span>
            <span className="text-[10px] text-muted-foreground/50">{t.date}</span>
          </div>
        </div>
      </div>
    </motion.article>
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
    <section id="testimonials" className="py-24 md:py-32 relative" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <p className="sanskrit-accent mb-3">ॐ Jana Vani</p>
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Real People. <span className="text-gradient-gold">Real Revelations.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join 12,400+ people who discovered what their palm has been trying to tell them
          </p>
        </AnimatedSection>

        {/* Aggregate stats */}
        <AnimatedSection delay={0.1} className="flex flex-wrap justify-center gap-6 mb-14">
          {aggregateStats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 glass-premium rounded-2xl px-5 py-3 border border-accent/15">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
              </div>
              <div>
                <p className="font-serif font-bold text-lg text-gradient-gold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </AnimatedSection>

        {/* Desktop: 3-column grid */}
        <div className="hidden lg:grid grid-cols-3 gap-5 max-w-5xl mx-auto">
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
        <div className="hidden lg:grid grid-cols-2 gap-5 max-w-[672px] mx-auto mt-5">
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

        {/* Mobile: carousel */}
        <div className="lg:hidden max-w-md mx-auto relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 rounded-full glass-premium border-accent/20 hover:border-accent/40 w-10 h-10"
            onClick={() => navigate(-1)}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 rounded-full glass-premium border-accent/20 hover:border-accent/40 w-10 h-10"
            onClick={() => navigate(1)}
            aria-label="Next testimonial"
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

          <div className="flex justify-center gap-2.5 mt-6" role="tablist" aria-label="Testimonials">
            {testimonials.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === currentIndex}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-8 bg-accent' : 'w-1.5 bg-border'
                }`}
                aria-label={`Testimonial from ${testimonials[i].name}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom trust statement */}
        <AnimatedSection delay={0.4} className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            All reviews from verified purchases · Collected via in-app feedback
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
