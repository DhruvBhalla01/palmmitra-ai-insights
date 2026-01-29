import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-mystic opacity-5" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-accent/30"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">
                AI Powered Palm Reading
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
              Discover Your{' '}
              <span className="text-gradient-gold">Destiny</span>{' '}
              Through AI Palm Reading
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              PalmMitra blends ancient Indian palmistry with modern AI to reveal 
              insights about your life, career, love, and future.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/upload">
                <Button className="btn-gold text-foreground font-semibold text-lg px-8 py-6 rounded-2xl group">
                  Upload Your Palm
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="font-semibold text-lg px-8 py-6 rounded-2xl border-2 border-primary/20 hover:border-accent hover:bg-accent/10 transition-all"
              >
                Try Free Preview
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Holographic Palm */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative flex items-center justify-center"
          >
            {/* Glow effect */}
            <div className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full bg-accent/20 blur-3xl animate-glow-pulse" />
            
            {/* Palm illustration container */}
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-accent/30"
              />
              
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border border-accent/20"
              />

              {/* Palm visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotateY: [0, 10, 0, -10, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: 'easeInOut' 
                  }}
                  className="text-[120px] md:text-[180px] palm-glow select-none"
                >
                  🖐️
                </motion.div>
              </div>

              {/* Floating symbols */}
              {['✨', '🔮', '⭐', '🌙'].map((symbol, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    top: `${20 + i * 20}%`,
                    left: i % 2 === 0 ? '0%' : '85%',
                  }}
                  animate={{ 
                    y: [0, -15, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 3 + i * 0.5, 
                    repeat: Infinity, 
                    delay: i * 0.5 
                  }}
                >
                  {symbol}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
