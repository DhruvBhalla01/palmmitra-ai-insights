import { motion } from 'framer-motion';
import { Briefcase, Heart, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Briefcase,
    title: 'Career Path Prediction',
    description: 'Discover your ideal career path and professional strengths based on your palm lines.',
  },
  {
    icon: Heart,
    title: 'Love & Marriage Insights',
    description: 'Understand your romantic compatibility and timing for significant relationships.',
  },
  {
    icon: TrendingUp,
    title: 'Wealth & Growth Timeline',
    description: 'Learn about your financial potential and periods of prosperity.',
  },
  {
    icon: Calendar,
    title: 'Lucky Years Forecast',
    description: 'Identify the most auspicious years and months for major life decisions.',
  },
  {
    icon: Sparkles,
    title: 'Spiritual Remedies',
    description: 'Receive personalized remedies and practices to enhance positive energies.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Features list */}
          <div>
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
                Unlock Deep <span className="text-gradient-gold">Insights</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Our AI-powered analysis reveals comprehensive insights about every aspect of your life.
              </p>
            </AnimatedSection>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatedSection delay={0.5} className="mt-10">
              <Link to="/upload">
                <Button className="btn-gold text-foreground font-semibold text-lg px-8 py-6 rounded-2xl">
                  Unlock Full Report @ ₹199
                </Button>
              </Link>
            </AnimatedSection>
          </div>

          {/* Right - Illustration */}
          <AnimatedSection direction="right" className="relative hidden lg:block">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
              
              {/* Main card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative bg-card rounded-3xl p-8 border border-border shadow-elevated"
              >
                <div className="aspect-square rounded-2xl bg-gradient-mystic flex items-center justify-center">
                  <div className="text-center text-primary-foreground p-8">
                    <div className="text-8xl mb-4">🖐️</div>
                    <div className="space-y-2">
                      <div className="h-2 bg-white/20 rounded-full w-3/4 mx-auto" />
                      <div className="h-2 bg-white/20 rounded-full w-1/2 mx-auto" />
                      <div className="h-2 bg-white/20 rounded-full w-2/3 mx-auto" />
                    </div>
                    <p className="text-white/80 mt-4 text-sm">
                      AI Analysis in Progress...
                    </p>
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
