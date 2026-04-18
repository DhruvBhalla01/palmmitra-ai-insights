import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Users, TrendingUp, Zap, Lock } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free Preview',
    price: '₹0',
    period: null,
    description: 'See real insights before you spend a rupee',
    features: [
      'Palm summary + overview',
      'Life line deep analysis',
      'First personality trait reveal',
      'One targeted spiritual remedy',
    ],
    cta: 'Try Free Now',
    popular: false,
    badge: null,
    highlight: false,
  },
  {
    name: 'Detailed Report',
    price: '₹99',
    period: 'one-time',
    description: 'Your complete AI destiny report — once, forever',
    features: [
      'All 5 major palm lines decoded',
      'Complete mounts analysis',
      'Career & wealth turning points',
      'Love & marriage compatibility',
      'Lucky periods timeline (5 years)',
      'All 5 spiritual remedies',
      'Downloadable premium PDF',
    ],
    cta: 'Get My Full Report',
    popular: true,
    badge: 'Most Popular',
    highlight: true,
  },
  {
    name: 'Monthly Plan',
    price: '₹299',
    period: '/month',
    description: 'Unlimited readings for you & your family',
    features: [
      'Everything in Detailed Report',
      'Unlimited palm readings',
      'Read for spouse, kids & parents',
      'Priority AI — faster processing',
      'All future features included',
      'Cancel any time',
    ],
    cta: 'Start Monthly Plan',
    popular: false,
    badge: '10× Better Value',
    highlight: false,
  },
];

const socialProof = [
  { icon: Users, label: '12,400+ readings done' },
  { icon: TrendingUp, label: '4.9★ average rating' },
  { icon: Zap, label: 'Results in under 2 minutes' },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 md:py-32 relative scroll-mt-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-6">
          <p className="sanskrit-accent mb-3">ॐ Sampatti Yoga</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Choose Your <span className="text-gradient-gold">Path</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Over 12,000 people have already discovered what their palm holds.
            Your reading takes less than 2 minutes.
          </p>
        </AnimatedSection>

        {/* Urgency strip */}
        <AnimatedSection delay={0.05}>
          <div className="text-center mb-8 py-3 px-6 rounded-2xl bg-accent/8 border border-accent/20 max-w-lg mx-auto">
            <p className="text-sm font-medium text-foreground">
              <span className="text-accent font-bold">120+ readings</span> completed this week ·
              Use code <span className="text-accent font-bold">PALMFRIEND</span> for ₹50 off
            </p>
          </div>
        </AnimatedSection>

        {/* Social proof strip */}
        <AnimatedSection delay={0.1} className="flex flex-wrap justify-center gap-6 mb-14">
          {socialProof.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-accent" />
              <span>{label}</span>
            </div>
          ))}
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                whileHover={{ y: -8, scale: plan.highlight ? 1.02 : 1.03 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-3xl p-8 h-full flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? 'glass-premium border-2 border-accent/40 shadow-gold-lg lg:scale-105'
                    : 'card-premium'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <motion.div
                    className="absolute -top-5 left-1/2 -translate-x-1/2"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold shadow-gold ${
                      plan.highlight ? 'bg-gradient-gold text-foreground' : 'bg-secondary text-foreground border border-accent/30'
                    }`}>
                      {plan.highlight ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-accent" />}
                      {plan.badge}
                    </div>
                  </motion.div>
                )}

                {plan.highlight && <div className="absolute inset-0 rounded-3xl shimmer pointer-events-none" />}

                <div className="flex-1">
                  <h3 className="text-xl font-serif font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <span className={`text-5xl font-serif font-bold ${plan.highlight ? 'text-gradient-gold' : 'text-foreground'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                    )}
                    {plan.period === '/month' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Less than one coffee a week.
                      </p>
                    )}
                    {plan.period === 'one-time' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay once. Your report lives forever.
                      </p>
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
                          plan.highlight ? 'bg-accent/20' : 'bg-secondary'
                        }`}>
                          <Check className={`w-3.5 h-3.5 ${plan.highlight ? 'text-accent' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-foreground text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link to="/upload">
                  <Button className={`w-full font-semibold py-6 rounded-2xl transition-all duration-300 ${
                    plan.highlight ? 'btn-gold text-foreground' : 'btn-secondary-premium'
                  }`}>
                    {plan.cta}
                  </Button>
                </Link>

                {!plan.period && (
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    No credit card needed
                  </p>
                )}
                {plan.period === 'one-time' && (
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Not satisfied? Email us — we'll sort it.
                  </p>
                )}
                {plan.period === '/month' && (
                  <div className="text-center mt-3 space-y-0.5">
                    <p className="text-xs text-muted-foreground">No contracts. Cancel anytime.</p>
                    <p className="text-xs text-accent font-medium">Lock in this price before it rises</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust nudge */}
        <AnimatedSection delay={0.4} className="text-center mt-12">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            Secure payments via Razorpay · UPI, Cards, Wallets accepted ·{' '}
            <span className="text-accent">Use code PALMFRIEND for ₹50 off</span>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
