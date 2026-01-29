import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Hologram glow behind palm */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[100px] animate-glow-pulse pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

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
              className="inline-flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                AI Powered Palm Reading
              </span>
            </motion.div>

            {/* Sanskrit accent */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="sanskrit-accent mb-4"
            >
              ॐ Bhavishya Darshan
            </motion.p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
              Discover Your{' '}
              <span className="text-gradient-gold text-shadow-luxury">Destiny</span>{' '}
              Through AI Palm Reading
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              PalmMitra blends ancient Indian palmistry with modern AI to reveal 
              insights about your life, career, love, and future.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/upload">
                <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl group shadow-gold-lg">
                  Upload Your Palm
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="btn-secondary-premium font-semibold text-lg px-8 py-7 rounded-2xl"
              >
                Try Free Preview
              </Button>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                50,000+ Readings
              </span>
              <span className="hidden sm:inline text-accent/50">•</span>
              <span>Rated 4.9★</span>
              <span className="hidden sm:inline text-accent/50">•</span>
              <span>100% Secure</span>
            </motion.div>
          </motion.div>

          {/* Right Content - Premium Holographic Palm */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative flex items-center justify-center"
          >
            {/* Multiple glow layers */}
            <div className="absolute w-80 h-80 md:w-[450px] md:h-[450px] rounded-full bg-accent/20 blur-3xl animate-glow-pulse" />
            <div className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-accent/10 blur-2xl animate-glow-pulse-gold" />
            
            {/* Palm illustration container */}
            <div className="relative w-80 h-80 md:w-[450px] md:h-[450px]">
              {/* Outer rotating ring with dots */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="95" fill="none" stroke="hsl(var(--accent) / 0.2)" strokeWidth="0.5" strokeDasharray="4 8" />
                  {[...Array(12)].map((_, i) => (
                    <circle
                      key={i}
                      cx={100 + 95 * Math.cos((i * 30 * Math.PI) / 180)}
                      cy={100 + 95 * Math.sin((i * 30 * Math.PI) / 180)}
                      r="2"
                      fill="hsl(var(--accent) / 0.4)"
                    />
                  ))}
                </svg>
              </motion.div>
              
              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8"
              >
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--accent) / 0.15)" strokeWidth="1" />
                </svg>
              </motion.div>

              {/* Inner decorative ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-16"
              >
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth="0.5" strokeDasharray="2 6" />
                </svg>
              </motion.div>

              {/* Palm visual with hologram effect */}
              <div className="absolute inset-0 flex items-center justify-center hologram">
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotateY: [0, 5, 0, -5, 0],
                    rotateX: [0, 3, 0, -3, 0],
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: 'easeInOut' 
                  }}
                  className="text-[140px] md:text-[200px] select-none relative"
                  style={{
                    filter: 'drop-shadow(0 0 30px hsl(42 87% 55% / 0.5)) drop-shadow(0 0 60px hsl(42 87% 55% / 0.3))'
                  }}
                >
                  🖐️
                  
                  {/* Holographic scan line */}
                  <motion.div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                </motion.div>
              </div>

              {/* Floating symbols with premium styling */}
              {[
                { symbol: '✨', x: '5%', y: '20%', delay: 0 },
                { symbol: '🔮', x: '90%', y: '30%', delay: 0.5 },
                { symbol: '⭐', x: '0%', y: '70%', delay: 1 },
                { symbol: '🌙', x: '95%', y: '75%', delay: 1.5 },
                { symbol: 'ॐ', x: '50%', y: '5%', delay: 0.8 },
              ].map(({ symbol, x, y, delay }, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl md:text-3xl"
                  style={{ left: x, top: y }}
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0.4, 1, 0.4],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ 
                    duration: 4 + i * 0.5, 
                    repeat: Infinity, 
                    delay
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