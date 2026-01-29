import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PremiumBackground } from '@/components/PremiumBackground';
import { AnimatedSection } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Shield, Heart, Users, Star } from 'lucide-react';
import mysticalPalm from '@/assets/mystical-palm.png';

const values = [
  {
    icon: Brain,
    title: 'AI-Powered Precision',
    description: 'Our advanced AI analyzes palm features with scientific accuracy, trained on thousands of palm readings.',
  },
  {
    icon: Shield,
    title: '100% Privacy First',
    description: 'Your palm images are processed securely and never stored permanently. Your data stays yours.',
  },
  {
    icon: Heart,
    title: 'Rooted in Tradition',
    description: 'We honor the ancient Indian science of Hasta Samudrika Shastra while embracing modern technology.',
  },
];

const stats = [
  { value: '50,000+', label: 'Readings Completed' },
  { value: '4.9★', label: 'User Rating' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'AI Availability' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background relative">
      <PremiumBackground showMandala intensity="light" />
      <Navbar />
      
      <main className="relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <AnimatedSection className="text-center max-w-4xl mx-auto mb-20">
            <p className="sanskrit-accent mb-4">ॐ Parichay</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6">
              About <span className="text-gradient-gold">PalmMitra</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Where ancient Indian palmistry wisdom meets cutting-edge artificial intelligence 
              to reveal the secrets written in your hands.
            </p>
          </AnimatedSection>

          {/* Mission Section */}
          <AnimatedSection delay={0.2} className="mb-24">
            <div className="glass-premium rounded-3xl p-8 md:p-12 border border-accent/20 max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                    Our <span className="text-gradient-gold">Mission</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    PalmMitra was born from a simple belief: the ancient science of palmistry, 
                    practiced for millennia in India, deserves to be accessible to everyone 
                    in our modern digital age.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We've combined the wisdom of <strong className="text-foreground">Hasta Samudrika Shastra</strong> 
                    {' '}with state-of-the-art AI to create personalized readings that offer genuine 
                    insights into your personality, potential, and path forward.
                  </p>
                </div>
                <div className="flex justify-center">
                  <motion.img
                    src={mysticalPalm}
                    alt="Mystical Palm"
                    className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-full"
                    animate={{ 
                      y: [0, -10, 0],
                      scale: [1, 1.03, 1],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      filter: 'drop-shadow(0 0 40px hsl(42 87% 55% / 0.4))'
                    }}
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Values Section */}
          <AnimatedSection delay={0.3} className="mb-24">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center mb-12">
              What Sets Us <span className="text-gradient-gold">Apart</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-premium rounded-2xl p-8 border border-accent/20 text-center group hover:border-accent/40 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                    <value.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>

          {/* Stats Section */}
          <AnimatedSection delay={0.4} className="mb-24">
            <div className="glass-premium rounded-3xl p-8 md:p-12 border border-accent/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Team Section */}
          <AnimatedSection delay={0.5} className="mb-24 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Users className="w-6 h-6 text-accent" />
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                Built With <span className="text-gradient-gold">Love</span> in India
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              PalmMitra is crafted by a passionate team of AI researchers, palmistry enthusiasts, 
              and spiritual seekers. We're on a mission to make the profound insights of palmistry 
              accessible to everyone, anywhere in the world.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-accent" />
              <span>Made with ❤️ in India</span>
            </div>
          </AnimatedSection>

          {/* CTA Section */}
          <AnimatedSection delay={0.6} className="text-center">
            <div className="glass-premium rounded-3xl p-10 md:p-16 border border-accent/20 max-w-3xl mx-auto">
              <Sparkles className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                Ready to Discover Your Destiny?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Upload a clear photo of your palm and let our AI reveal the secrets 
                hidden in your hand.
              </p>
              <Link to="/upload">
                <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl shadow-gold-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Your Palm Reading
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}
