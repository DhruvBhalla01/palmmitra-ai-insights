import { motion } from 'framer-motion';
import { Briefcase, Heart, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import palmIconGold from '@/assets/palm-icon-gold.png';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Briefcase,
    title: 'Career Path Prediction',
    description: 'Discover your ideal career path and professional strengths based on your palm lines.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Heart,
    title: 'Love & Marriage Insights',
    description: 'Understand your romantic compatibility and timing for significant relationships.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Wealth & Growth Timeline',
    description: 'Learn about your financial potential and periods of prosperity.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Calendar,
    title: 'Lucky Years Forecast',
    description: 'Identify the most auspicious years and months for major life decisions.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Sparkles,
    title: 'Spiritual Remedies',
    description: 'Receive personalized remedies and practices to enhance positive energies.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Features list */}
          <div>
            <AnimatedSection>
              <p className="sanskrit-accent mb-3">ॐ Gyan Shakti</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
                Unlock Deep <span className="text-gradient-gold">Insights</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Our AI-powered analysis reveals comprehensive insights about every aspect of your life.
              </p>
            </AnimatedSection>

            <div className="space-y-5">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 8, scale: 1.02 }}
                  className="flex gap-4 group p-4 rounded-2xl glass-premium cursor-default"
                >
                  <motion.div 
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center transition-all duration-300`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </motion.div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground mb-1 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatedSection delay={0.5} className="mt-10">
              <Link to="/upload">
                <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl shadow-gold-lg">
                  Unlock Full Report @ ₹99
                </Button>
              </Link>
            </AnimatedSection>
          </div>

          {/* Right - Illustration */}
          <AnimatedSection direction="right" className="relative hidden lg:block">
            <div className="relative">
              {/* Decorative glows */}
              <motion.div 
                className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/15 blur-3xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />
              
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative card-premium p-8 border border-accent/20 overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer" />
                
                <div className="aspect-square rounded-3xl bg-gradient-mystic flex items-center justify-center relative overflow-hidden">
                  {/* Animated lines on palm */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                      <motion.path
                        d="M40 140 Q80 100 120 130 Q160 160 180 120"
                        stroke="hsl(var(--gold) / 0.5)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.path
                        d="M30 100 Q100 60 180 100"
                        stroke="hsl(var(--gold) / 0.4)"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                      />
                    </svg>
                  </motion.div>
                  
                  <div className="text-center text-primary-foreground p-8 relative z-10">
                    <motion.img 
                      src={palmIconGold}
                      alt="Palm Reading"
                      className="w-20 h-20 object-contain"
                      animate={{ 
                        filter: ['drop-shadow(0 0 20px rgba(255,193,7,0.3))', 'drop-shadow(0 0 40px rgba(255,193,7,0.6))', 'drop-shadow(0 0 20px rgba(255,193,7,0.3))']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="h-2 bg-white/20 rounded-full"
                          style={{ width: `${75 - i * 15}%`, margin: '0 auto' }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <motion.p 
                      className="text-white/80 mt-4 text-sm font-medium"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      AI Analysis in Progress...
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
