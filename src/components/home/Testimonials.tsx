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
    text: 'It felt extremely accurate! The career prediction matched what I was experiencing. The AI picked up details that amazed me.',
    avatar: avatarPriya,
  },
  {
    name: 'Rohit Patel',
    location: 'Bangalore',
    rating: 5,
    text: 'Career clarity instantly. I was confused about my next move, and PalmMitra gave me the confidence to pursue my startup idea.',
    avatar: avatarRohit,
  },
  {
    name: 'Ananya Reddy',
    location: 'Mumbai',
    rating: 5,
    text: 'Premium UI and trustworthy. I was skeptical at first, but the detailed analysis won me over. Highly recommend!',
    avatar: avatarAnanya,
  },
  {
    name: 'Vikram Singh',
    location: 'Jaipur',
    rating: 5,
    text: 'The spiritual remedies section was incredibly helpful. I feel more aligned with my life purpose now.',
    avatar: avatarVikram,
  },
  {
    name: 'Meera Iyer',
    location: 'Chennai',
    rating: 5,
    text: 'Accurate marriage predictions! My reading predicted a significant relationship this year, and it happened!',
    avatar: avatarMeera,
  },
];

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
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
  };

  return (
    <section id="testimonials" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <p className="sanskrit-accent mb-3">ॐ Jana Vani</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            What Our <span className="text-gradient-gold">Users</span> Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who have discovered their destiny
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto relative">
          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 rounded-full glass-premium border-accent/20 hover:border-accent/50 hover:bg-accent/10 w-12 h-12"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 rounded-full glass-premium border-accent/20 hover:border-accent/50 hover:bg-accent/10 w-12 h-12"
            onClick={() => navigate(1)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Testimonial card */}
          <div className="overflow-hidden px-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="glass-premium rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
              >
                {/* Background quote icon */}
                <Quote className="absolute top-6 left-6 w-16 h-16 text-accent/10" />
                
                {/* Avatar with real photo */}
                <motion.div 
                  className="relative inline-block mb-6"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-accent/30 shadow-gold relative">
                    <img 
                      src={testimonials[currentIndex].avatar} 
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full blur-xl bg-accent/20 -z-10" />
                </motion.div>

                {/* Stars */}
                <div className="flex justify-center gap-1.5 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      <Star className="w-6 h-6 fill-accent text-accent" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl text-foreground mb-8 font-medium leading-relaxed max-w-xl mx-auto">
                  "{testimonials[currentIndex].text}"
                </p>

                {/* Name & Location */}
                <div>
                  <p className="font-serif font-bold text-foreground text-lg">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {testimonials[currentIndex].location}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-10 bg-gradient-gold shadow-gold' 
                    : 'w-2 bg-border hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
