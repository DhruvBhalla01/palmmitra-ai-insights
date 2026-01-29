import { motion } from 'framer-motion';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Brain, Shield, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import mandalaOrnament from '@/assets/mandala-ornament.png';

const highlights = [
  {
    icon: Brain,
    title: 'AI-Powered',
    description: 'Advanced neural networks trained on traditional palmistry',
  },
  {
    icon: Shield,
    title: '100% Private',
    description: 'Your data is encrypted and never shared',
  },
  {
    icon: Heart,
    title: 'Ancient Wisdom',
    description: 'Based on Hasta Samudrika Shastra principles',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <AnimatedSection>
              <p className="sanskrit-accent mb-3">ॐ Parichay</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
                About <span className="text-gradient-gold">PalmMitra</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                PalmMitra bridges the gap between ancient Indian palmistry wisdom and cutting-edge 
                artificial intelligence. We've digitized the sacred art of <strong className="text-foreground">Hasta Samudrika Shastra</strong> 
                {' '}to make personalized palm readings accessible to everyone.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our AI has been trained on thousands of palm readings and traditional texts, allowing it 
                to identify patterns in your palm lines, mounts, and features that reveal insights about 
                your personality, potential, and path forward.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass-premium rounded-2xl p-4 text-center border border-accent/20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Link to="/about">
                <Button variant="outline" className="btn-secondary-premium rounded-2xl px-6 py-5">
                  Learn More About Us
                </Button>
              </Link>
            </AnimatedSection>
          </div>

          {/* Right Content - Visual with Mandala */}
          <AnimatedSection direction="right" className="relative hidden lg:block">
            <div className="relative">
              {/* Glows */}
              <motion.div 
                className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-accent/15 blur-3xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />

              {/* Stats Card with Mandala */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-premium rounded-3xl p-8 border border-accent/20 relative overflow-hidden"
              >
                {/* Mandala Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <motion.img 
                    src={mandalaOrnament} 
                    alt="" 
                    className="w-96 h-96 object-contain"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  />
                </div>

                <div className="text-center mb-8 relative z-10">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      filter: ['drop-shadow(0 0 20px rgba(255,193,7,0.3))', 'drop-shadow(0 0 40px rgba(255,193,7,0.5))', 'drop-shadow(0 0 20px rgba(255,193,7,0.3))']
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-8xl mb-4 inline-block"
                  >
                    🖐️
                  </motion.div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                    Trusted by Thousands
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Join our growing community
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  {[
                    { value: '50,000+', label: 'Readings' },
                    { value: '4.9★', label: 'Rating' },
                    { value: '98%', label: 'Satisfaction' },
                    { value: '< 30s', label: 'Analysis Time' },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="bg-accent/5 rounded-xl p-4 text-center border border-accent/10"
                    >
                      <div className="text-xl font-serif font-bold text-gradient-gold">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
