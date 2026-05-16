import { motion } from 'framer-motion';
import { Camera, Cpu, FileText, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: Camera,
    number: '01',
    title: 'Photograph Your Palm',
    description: 'Snap a clear photo of your dominant hand — no filters, no editing. Works on any smartphone camera.',
    color: 'bg-accent/10',
    iconColor: 'text-accent',
    borderColor: 'border-accent/20',
    badge: '< 30 sec',
    detail: 'Right hand if right-handed',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'AI Reads 15 Markers',
    description: 'Our AI identifies your Life, Heart, Fate, Head, Marriage & Sun lines — plus all 7 mounts — with precision trained on ancient Shastra texts.',
    color: 'bg-primary/10',
    iconColor: 'text-primary',
    borderColor: 'border-primary/20',
    badge: '~90 sec',
    detail: 'Computer vision analysis',
  },
  {
    icon: FileText,
    number: '03',
    title: 'Get Your Destiny Report',
    description: 'A 2,000+ word personalised report lands instantly — covering career, love, wealth, life phases, and your spiritual path.',
    color: 'bg-accent/10',
    iconColor: 'text-accent',
    borderColor: 'border-accent/20',
    badge: 'Instant',
    detail: 'Free preview included',
  },
];

const guarantees = [
  'No account needed to start',
  'Free preview — no card required',
  'Full report permanently saved at your link',
  'Works on any device or browser',
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative scroll-mt-20" aria-labelledby="hiw-heading">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="sanskrit-accent mb-3">ॐ Margadarshan</p>
          <h2 id="hiw-heading" className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            From Photo to Destiny{' '}
            <span className="text-gradient-gold">in 3 Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most detailed AI palm reading in India — under 2 minutes start to finish.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-28 left-[22%] right-[22%] h-px" aria-hidden="true">
            <div className="w-full h-full bg-gradient-to-r from-accent/0 via-accent/25 to-accent/0" />
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
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className={`relative card-premium p-8 border ${step.borderColor} hover:border-accent/35 h-full`}
              >
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-5xl font-serif font-bold text-foreground/6 leading-none">
                    {step.number}
                  </span>
                  {step.badge && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/12 text-accent border border-accent/20">
                      {step.badge}
                    </span>
                  )}
                </div>

                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-5 relative`}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.25 }}
                >
                  <step.icon className={`w-8 h-8 ${step.iconColor}`} aria-hidden="true" />
                  <div className={`absolute inset-0 rounded-2xl ${step.color} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                </motion.div>

                <h3 className="text-xl font-serif font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                  {step.description}
                </p>
                <p className="text-xs text-accent font-medium">{step.detail}</p>

                {/* Connecting arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center" aria-hidden="true">
                    <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-accent" />
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Guarantee chips */}
        <AnimatedSection delay={0.35} className="mt-12">
          <div className="flex flex-wrap justify-center gap-3">
            {guarantees.map((g) => (
              <div key={g} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted/50 border border-border/40 text-sm text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" aria-hidden="true" />
                {g}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Post-steps CTA */}
        <AnimatedSection delay={0.5} className="text-center mt-10">
          <Link to="/upload">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl group shadow-gold-lg">
                <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                Scan My Palm — Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Button>
            </motion.div>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">No account needed · Free preview included · Full report ₹99</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
