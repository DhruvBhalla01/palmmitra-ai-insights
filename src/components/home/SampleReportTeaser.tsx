import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const sampleInsights = [
  { title: 'Life Line Analysis', preview: 'Strong vitality indicated, with a notable branch around age 35...' },
  { title: 'Heart Line Meaning', preview: 'Deep emotional nature, romantic inclinations suggest...' },
  { title: 'Fate Line Direction', preview: 'Career success predicted after age 28, with significant...' },
  { title: 'Mount of Jupiter', preview: 'Leadership qualities present, ambition runs strong in...' },
];

export function SampleReportTeaser() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Sample <span className="text-gradient-gold">Reading</span> Preview
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what insights await you in your personalized palm reading report
          </p>
        </AnimatedSection>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto relative"
        >
          {/* Report preview card */}
          <div className="bg-card rounded-3xl border border-border shadow-elevated overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-indigo p-6 text-center">
              <div className="text-6xl mb-2">🖐️</div>
              <h3 className="text-xl font-serif font-bold text-primary-foreground">
                Your Personal Palm Reading
              </h3>
            </div>

            {/* Content - Blurred */}
            <div className="p-6 space-y-4 relative">
              {sampleInsights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-secondary/50 rounded-xl"
                >
                  <h4 className="font-serif font-bold text-foreground mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-muted-foreground text-sm blur-sm select-none">
                    {insight.preview}
                  </p>
                </motion.div>
              ))}

              {/* Blur overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent flex items-end justify-center pb-8">
                <Link to="/upload">
                  <Button className="btn-gold text-foreground font-semibold text-lg px-8 py-6 rounded-2xl flex items-center gap-3 shadow-gold">
                    <Lock className="w-5 h-5" />
                    Unlock My Full Reading
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
