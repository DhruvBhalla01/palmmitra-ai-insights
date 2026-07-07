import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Users, TrendingUp, Zap, Lock, Shield, Star, Heart, Gem } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '@/config/pricing';
import { useCurrency } from '@/hooks/useCurrency';

export function PricingSection() {
  const { currency, isIndia } = useCurrency();

  const plans = [
    {
      name: 'Free Preview',
      price: isIndia ? '₹0' : '$0',
      period: null,
      description: 'See real AI insights before spending anything',
      features: [
        'Palm summary + confidence score',
        'Life line deep analysis',
        'First personality trait reveal',
        'One targeted spiritual remedy',
      ],
      cta: 'Try Free Now',
      ctaLink: '/upload',
      icon: Sparkles,
      badge: null,
      highlight: false,
      flagship: false,
      ctaNote: 'No credit card · No sign-up',
    },
    {
      name: PRODUCTS.insight.name,
      price: PRODUCTS.insight.prices[currency].display,
      period: 'one-time',
      description: 'Your complete AI destiny report — yours forever',
      features: [
        'All 5 major palm lines decoded',
        'Complete mounts analysis',
        'Career & wealth turning points',
        'Love & marriage timeline',
        'Lucky periods timeline — 5 years',
        'All 5 spiritual remedies',
        'Downloadable premium PDF',
      ],
      cta: 'Get My Insight Report',
      ctaLink: '/upload',
      icon: Sparkles,
      badge: 'Most Popular',
      highlight: true,
      flagship: false,
      ctaNote: 'Satisfaction guaranteed or full refund',
    },
    {
      name: PRODUCTS.palmmatch.name,
      price: PRODUCTS.palmmatch.prices[currency].display,
      period: 'one-time',
      description: 'Compatibility reading for you & your partner — discover your destiny together',
      features: [
        'Side-by-side compatibility score',
        'Love line synergy analysis',
        'Communication & emotional fit',
        'Long-term harmony forecast',
        'Personalised relationship remedies',
        'Beautiful shareable PDF',
      ],
      cta: 'Reveal Our Compatibility',
      ctaLink: '/palmmatch',
      icon: Heart,
      badge: 'Hero Product',
      highlight: false,
      flagship: false,
      hero: true,
      ctaNote: 'Made for couples · Instant unlock',
    },
    {
      name: PRODUCTS.elite.name,
      price: PRODUCTS.elite.prices[currency].display,
      period: 'lifetime',
      description: 'The flagship — lifetime access, unlimited readings, priority AI for the whole family',
      features: [
        'Everything in Insight + PalmMatch',
        'Unlimited palm readings — forever',
        'Read for spouse, kids & parents',
        'Priority AI — faster processing',
        'All future features included',
        'Dedicated email support',
        'Lifetime PDF re-downloads',
      ],
      cta: 'Become Elite',
      ctaLink: '/upload',
      icon: Gem,
      badge: 'Most Premium',
      highlight: false,
      flagship: true,
      ctaNote: 'One payment · Lifetime access',
    },
  ];

  const socialProof = [
    { icon: Users, label: '12,400+ readings done' },
    { icon: TrendingUp, label: '4.9★ · 2,100+ verified reviews' },
    { icon: Zap, label: 'Results in under 2 minutes' },
    { icon: Star, label: '98% satisfaction rate' },
  ];


  return (
    <section id="pricing" className="py-24 md:py-32 relative scroll-mt-20" aria-labelledby="pricing-heading">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-6">
          <p className="sanskrit-accent mb-3">ॐ Sampatti Yoga</p>
          <h2 id="pricing-heading" className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Start Free. <span className="text-gradient-gold">Unlock Everything.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your free preview is waiting — no credit card, no sign-up.
            Full report costs less than a chai and samosa.
          </p>
        </AnimatedSection>

        {/* Urgency strip */}
        <AnimatedSection delay={0.05}>
          <div className="flex items-center justify-center gap-2 text-center mb-6 py-3 px-6 rounded-2xl bg-accent/8 border border-accent/20 max-w-lg mx-auto">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <p className="text-sm font-medium text-foreground">
              <span className="text-accent font-bold">120+ readings</span> completed this week
            </p>
          </div>
        </AnimatedSection>

        {/* Social proof strip */}
        <AnimatedSection delay={0.1} className="flex flex-wrap justify-center gap-5 mb-14">
          {socialProof.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const PlanIcon = plan.icon;
            const isFlagship = plan.flagship;
            const isHero = (plan as { hero?: boolean }).hero;
            return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-3xl p-7 h-full flex flex-col transition-all duration-300 ${
                  isFlagship
                    ? 'glass-premium border-2 border-accent/60 shadow-gold-lg lg:scale-[1.03] ring-1 ring-accent/30'
                    : isHero
                    ? 'glass-premium border-2 border-pink-400/40 shadow-lg'
                    : plan.highlight
                    ? 'glass-premium border-2 border-accent/40 shadow-gold-lg'
                    : 'card-premium'
                }`}
                style={isFlagship ? {
                  background: 'linear-gradient(135deg, hsl(42 87% 55% / 0.10), hsl(260 50% 30% / 0.08))',
                } : isHero ? {
                  background: 'linear-gradient(135deg, hsl(330 70% 55% / 0.08), hsl(260 50% 30% / 0.06))',
                } : undefined}
              >
                {/* Badge */}
                {plan.badge && (
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-gold whitespace-nowrap ${
                      isFlagship
                        ? 'bg-gradient-gold text-foreground'
                        : isHero
                        ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white'
                        : plan.highlight
                        ? 'bg-gradient-gold text-foreground'
                        : 'bg-secondary text-foreground border border-accent/30'
                    }`}>
                      {isFlagship ? <Gem className="w-3.5 h-3.5" aria-hidden="true" /> :
                       isHero ? <Heart className="w-3.5 h-3.5" aria-hidden="true" /> :
                       plan.highlight ? <Crown className="w-3.5 h-3.5" aria-hidden="true" /> :
                       <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />}
                      {plan.badge}
                    </div>
                  </motion.div>
                )}

                {(plan.highlight || isFlagship) && <div className="absolute inset-0 rounded-3xl shimmer pointer-events-none" />}

                <div className="flex-1">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${
                    isFlagship ? 'bg-accent/20' : isHero ? 'bg-pink-500/15' : 'bg-accent/10'
                  }`}>
                    <PlanIcon className={`w-5 h-5 ${isHero ? 'text-pink-400' : 'text-accent'}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-5 min-h-[40px]">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-4xl font-serif font-bold ${
                        isFlagship || plan.highlight ? 'text-gradient-gold' : isHero ? 'text-pink-300' : 'text-foreground'
                      }`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground text-xs">{plan.period}</span>
                      )}
                    </div>
                    {plan.period === 'lifetime' && (
                      <p className="text-xs text-accent/80 mt-1 font-medium">
                        One payment · Yours forever.
                      </p>
                    )}
                    {plan.period === 'one-time' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Pay once. Yours forever.
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-7" aria-label={`${plan.name} features`}>
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={feature}
                        className="flex items-start gap-2.5"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.04 }}
                      >
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                          isFlagship || plan.highlight ? 'bg-accent/20' : 'bg-secondary'
                        }`}>
                          <Check className={`w-2.5 h-2.5 ${
                            isFlagship || plan.highlight ? 'text-accent' : 'text-muted-foreground'
                          }`} aria-hidden="true" />
                        </div>
                        <span className="text-foreground text-xs leading-snug">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link to={plan.ctaLink}>
                  <Button className={`w-full font-semibold py-5 rounded-2xl transition-all duration-300 ${
                    isFlagship || plan.highlight
                      ? 'btn-gold text-foreground'
                      : isHero
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:opacity-90'
                      : 'btn-secondary-premium'
                  }`}>
                    {plan.cta}
                  </Button>
                </Link>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  {plan.ctaNote}
                </p>

                {/* Guarantee badge for paid plans */}
                {(plan.highlight || isFlagship || isHero) && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-accent/10">
                    <Shield className="w-3.5 h-3.5 text-accent flex-shrink-0" aria-hidden="true" />
                    <p className="text-[11px] text-muted-foreground">
                      <span className="text-accent font-medium">Money-back guarantee</span> — full refund if unhappy.
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );})}
        </div>

        {/* Bottom trust nudge */}
        <AnimatedSection delay={0.4} className="text-center mt-14">
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" aria-hidden="true" />
              Secure payments via Razorpay
            </span>
            <span className="text-border">·</span>
            <span>UPI, Cards, Wallets accepted</span>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
