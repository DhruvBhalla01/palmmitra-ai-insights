import { motion } from 'framer-motion';
import { Upload, Scan, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: Upload,
    title: 'Upload Palm Photo',
    description: 'Snap a clear photo of your dominant hand — no filters, no editing needed. Works on any smartphone.',
    color: 'bg-accent/10',
    iconColor: 'text-accent',
    borderColor: 'border-accent/20',
    badge: null,
  },
  {
    icon: Scan,
    title: 'AI Reads Your Lines',
    description: 'AI identifies your Life, Heart, Fate, Marriage & Success lines with precision trained on ancient Shastra texts.',
    color: 'bg-primary/10',
    iconColor: 'text-primary',
    borderColor: 'border-primary/20',
    badge: null,
  },
  {
    icon: FileText,
    title: 'Get Your Full Report',
    description: 'Receive a 2,000+ word personalised report covering career, love, wealth & your spiritual path.',
    color: 'bg-accent/10',
    iconColor: 'text-accent',
    borderColor: 'border-accent/20',
    badge: '~2 min',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="sanskrit-accent mb-3">ॐ Margadarshan</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            From Palm Photo to Destiny{' '}
            <span className="text-gradient-gold">in 3 Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock your destiny in under 2 minutes. Works on any smartphone.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-24 left-[20%] right-[20%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0" />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`relative card-premium p-8 border ${step.borderColor} hover:border-accent/40`}
              >
                {/* Step number with premium styling */}
                <motion.div 
                  className="absolute -top-5 -right-5 w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center font-bold text-foreground shadow-gold text-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {index + 1}
                </motion.div>

                {/* Icon with glow effect */}
                <motion.div 
                  className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center mb-6 relative`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                  <div className={`absolute inset-0 rounded-3xl ${step.color} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                </motion.div>

                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    {step.title}
                  </h3>
                  {step.badge && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/20">
                      {step.badge}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Post-steps CTA */}
        <AnimatedSection delay={0.4} className="text-center mt-14">
          <Link to="/upload">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl group shadow-gold-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Scan My Palm — Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">No account needed · Free preview included</p>
        </AnimatedSection>
      </div>
    </section>
  );
}