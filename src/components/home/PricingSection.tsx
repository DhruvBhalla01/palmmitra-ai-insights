import { motion } from 'framer-motion';
import { Check, Sparkles, Crown } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free Preview',
    price: '₹0',
    description: 'Get a taste of what your palm reveals',
    features: [
      'Palm summary overview',
      'Life line analysis',
      'First personality trait',
      'One spiritual remedy',
    ],
    cta: 'Try Free',
    popular: false,
  },
  {
    name: 'Detailed Report',
    price: '₹99',
    description: 'Complete AI-powered palm reading',
    features: [
      'All 5 major palm lines',
      'Complete mounts analysis',
      'Career & wealth insights',
      'Love & marriage destiny',
      'Lucky periods timeline',
      'All spiritual remedies',
      'PDF download',
    ],
    cta: 'Get Full Report',
    popular: true,
  },
  {
    name: 'Unlimited Plan',
    price: '₹999',
    description: 'Unlimited readings forever',
    features: [
      'Everything in Detailed',
      'Unlimited palm readings',
      'Priority AI processing',
      'All future updates',
      'Family readings included',
      'Best value forever',
    ],
    cta: 'Go Unlimited',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 md:py-32 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="sanskrit-accent mb-3">ॐ Sampatti Yoga</p>
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
              className="relative"
            >
              <motion.div
                whileHover={{ y: -8, scale: plan.popular ? 1.02 : 1.03 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-3xl p-8 h-full transition-all duration-300 ${
                  plan.popular
                    ? 'glass-premium border-2 border-accent/40 shadow-gold-lg scale-105'
                    : 'card-premium'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-5 left-1/2 -translate-x-1/2"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-1.5 bg-gradient-gold px-5 py-2 rounded-full text-sm font-bold text-foreground shadow-gold">
                      <Crown className="w-4 h-4" />
                      Most Popular
                    </div>
                  </motion.div>
                )}

                {/* Shimmer for popular */}
                {plan.popular && <div className="absolute inset-0 rounded-3xl shimmer pointer-events-none" />}

                {/* Plan name */}
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <span className={`text-5xl font-serif font-bold ${plan.popular ? 'text-gradient-gold' : 'text-foreground'}`}>
                    {plan.price}
                  </span>
                  {plan.price !== '₹0' && (
                    <span className="text-muted-foreground text-sm ml-2">
                      one-time
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.li 
                      key={feature} 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        plan.popular ? 'bg-accent/20' : 'bg-secondary'
                      }`}>
                        <Check className={`w-3.5 h-3.5 ${plan.popular ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="text-foreground text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to="/upload">
                  <Button
                    className={`w-full font-semibold py-6 rounded-2xl transition-all duration-300 ${
                      plan.popular
                        ? 'btn-gold text-foreground'
                        : 'btn-secondary-premium'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}