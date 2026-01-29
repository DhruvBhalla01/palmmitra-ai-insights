import { motion } from 'framer-motion';
import { Lock, Sparkles, Eye } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import mysticalPalm from '@/assets/mystical-palm.png';

const sampleInsights = [
  { title: 'Life Line Analysis', preview: 'Strong vitality indicated, with a notable branch around age 35...' },
  { title: 'Heart Line Meaning', preview: 'Deep emotional nature, romantic inclinations suggest...' },
  { title: 'Fate Line Direction', preview: 'Career success predicted after age 28, with significant...' },
  { title: 'Mount of Jupiter', preview: 'Leadership qualities present, ambition runs strong in...' },
];

export function SampleReportTeaser() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <p className="sanskrit-accent mb-3">ॐ Drishtant</p>
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
          {/* Decorative glows */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/10 blur-3xl rounded-full" />
          
          {/* Report preview card */}
          <motion.div 
            className="relative glass-premium rounded-3xl overflow-hidden"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header with palm image */}
            <div className="bg-gradient-indigo p-8 text-center relative overflow-hidden">
              {/* Animated pattern */}
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                style={{
                  backgroundImage: `radial-gradient(circle at center, hsl(var(--gold) / 0.3) 1px, transparent 1px)`,
                  backgroundSize: '30px 30px',
                }}
              />
              
              <motion.div 
                className="mb-3 relative z-10 flex justify-center"
                animate={{ 
                  filter: ['drop-shadow(0 0 20px rgba(255,193,7,0.4))', 'drop-shadow(0 0 40px rgba(255,193,7,0.7))', 'drop-shadow(0 0 20px rgba(255,193,7,0.4))']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img 
                  src={mysticalPalm} 
                  alt="Palm Reading" 
                  className="w-24 h-24 object-contain rounded-full"
                />
              </motion.div>
              <h3 className="text-2xl font-serif font-bold text-primary-foreground relative z-10">
                Your Personal Palm Reading
              </h3>
              <div className="flex items-center justify-center gap-2 mt-2 text-primary-foreground/70 text-sm">
                <Eye className="w-4 h-4" />
                <span>AI-Powered • Premium Report</span>
              </div>
            </div>

            {/* Content - Blurred */}
            <div className="p-6 space-y-4 relative">
              {sampleInsights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 glass-premium rounded-2xl group hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-serif font-bold text-foreground mb-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        {insight.title}
                      </h4>
                      <p className="text-muted-foreground text-sm blur-[6px] select-none">
                        {insight.preview}
                      </p>
                    </div>
                    <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </motion.div>
              ))}

              {/* Blur overlay with CTA */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-transparent flex items-end justify-center pb-10">
                <Link to="/upload">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl flex items-center gap-3 shadow-gold-lg">
                      <Lock className="w-5 h-5" />
                      Unlock My Full Reading
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
