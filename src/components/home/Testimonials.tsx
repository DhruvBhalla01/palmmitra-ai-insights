import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    text: 'It felt extremely accurate! The career prediction matched what I was experiencing. The AI picked up details that amazed me.',
    avatar: '👩',
  },
  {
    name: 'Rohit Patel',
    location: 'Bangalore',
    rating: 5,
    text: 'Career clarity instantly. I was confused about my next move, and PalmMitra gave me the confidence to pursue my startup idea.',
    avatar: '👨',
  },
  {
    name: 'Ananya Reddy',
    location: 'Mumbai',
    rating: 5,
    text: 'Premium UI and trustworthy. I was skeptical at first, but the detailed analysis won me over. Highly recommend!',
    avatar: '👩',
  },
  {
    name: 'Vikram Singh',
    location: 'Jaipur',
    rating: 5,
    text: 'The spiritual remedies section was incredibly helpful. I feel more aligned with my life purpose now.',
    avatar: '👨',
  },
  {
    name: 'Meera Iyer',
    location: 'Chennai',
    rating: 5,
    text: 'Accurate marriage predictions! My reading predicted a significant relationship this year, and it happened!',
    avatar: '👩',
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
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 rounded-full border-border hover:bg-accent/10 hover:border-accent"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 rounded-full border-border hover:bg-accent/10 hover:border-accent"
            onClick={() => navigate(1)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Testimonial card */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-soft text-center"
              >
                {/* Avatar */}
                <div className="text-6xl mb-6">{testimonials[currentIndex].avatar}</div>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl text-foreground mb-6 font-medium leading-relaxed">
                  "{testimonials[currentIndex].text}"
                </p>

                {/* Name & Location */}
                <div>
                  <p className="font-serif font-bold text-foreground">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {testimonials[currentIndex].location}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-accent' 
                    : 'bg-border hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
