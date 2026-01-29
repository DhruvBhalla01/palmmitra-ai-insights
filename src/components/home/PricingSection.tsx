import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free Preview',
    price: '₹0',
    description: 'Get a taste of what your palm reveals',
    features: [
      'Basic palm analysis',
      'Life line overview',
      'General personality traits',
    ],
    cta: 'Try Free',
    popular: false,
  },
  {
    name: 'Premium Reading',
    price: '₹199',
    description: 'Complete AI-powered palm reading',
    features: [
      'Full palm line analysis',
      'Career path prediction',
      'Love & marriage insights',
      'Wealth timeline forecast',
      'Lucky years & months',
      'Spiritual remedies',
      'PDF download',
    ],
    cta: 'Get Premium',
    popular: true,
  },
  {
    name: 'Lifetime Guru',
    price: '₹999',
    description: 'Unlimited readings forever',
    features: [
      'Everything in Premium',
      'Unlimited readings',
      'Priority AI processing',
      'Personal consultation',
      'Monthly updates',
      'Exclusive remedies',
    ],
    cta: 'Go Lifetime',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Choose Your <span className="text-gradient-gold">Path</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the reading that resonates with your spiritual journey
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative rounded-3xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-accent/10 to-card border-accent shadow-gold scale-105'
                  : 'bg-card border-border shadow-soft hover:shadow-elevated'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-gradient-gold px-4 py-1 rounded-full text-sm font-semibold text-foreground shadow-gold">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-serif font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.price !== '₹0' && (
                  <span className="text-muted-foreground text-sm ml-1">
                    one-time
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-accent/20' : 'bg-secondary'
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? 'text-accent' : 'text-muted-foreground'}`} />
                    </div>
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/upload">
                <Button
                  className={`w-full font-semibold py-6 rounded-2xl transition-all duration-300 ${
                    plan.popular
                      ? 'btn-gold text-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
