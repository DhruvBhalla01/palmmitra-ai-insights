import { motion } from 'framer-motion';
import { Briefcase, Heart, TrendingUp, Calendar, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import palmIconGold from '@/assets/palm-icon-gold.png';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Briefcase,
    eyebrow: 'Career & Wealth',
    title: 'Know your next breakthrough year before it arrives',
    description: 'Your Fate & Sun lines pinpoint professional turning points, the industries built for you, and the exact years when career leaps or pivots are written in your palm.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    badge: 'Most sought after',
  },
  {
    icon: Heart,
    eyebrow: 'Love & Marriage',
    title: 'See when deep love forms — and who it\'s for',
    description: 'Your Heart & Marriage lines reveal the age window for your most significant relationships, compatibility patterns, and the emotional depth you need in a partner.',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    badge: null,
  },
  {
    icon: TrendingUp,
    eyebrow: 'Money & Prosperity',
    title: 'Discover your richest years — and what triggers them',
    description: 'The Mount of Venus and Sun line pinpoint your financial growth windows, prosperity triggers, and the specific actions that accelerate wealth on your unique path.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    badge: null,
  },
  {
    icon: Calendar,
    eyebrow: '5-Year Timeline',
    title: 'The 3 years that will change your life — mapped out',
    description: 'A personalised Lucky Periods Timeline reveals your highest-potential windows for major decisions — career moves, relationships, investments, and spiritual shifts.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    badge: null,
  },
  {
    icon: Sparkles,
    eyebrow: 'Spiritual Guidance',
    title: 'Daily practices that align you with your destiny',
    description: 'Five targeted spiritual remedies chosen specifically for your palm patterns — removing obstacles and amplifying the positive energies already present in your hands.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20',
    badge: null,
  },
];

const reportStats = [
  { value: '2,000+', label: 'Words per report' },
  { value: '15', label: 'Palm markers read' },
  { value: '5', label: 'Life dimensions' },
  { value: '~2 min', label: 'To generate' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 relative" aria-labelledby="features-heading">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - Features list */}
          <div>
            <AnimatedSection>
              <p className="sanskrit-accent mb-3">ॐ Gyan Shakti</p>
              <h2 id="features-heading" className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
                Five Truths Written{' '}
                <span className="text-gradient-gold text-shadow-luxury">In Your Palm</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Not birth date predictions. Not generic forecasts. Insights decoded from the lines, mounts, and patterns unique to YOUR hand — like a fingerprint of your future.
              </p>
            </AnimatedSection>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ x: 6 }}
                  className={`flex gap-4 group p-5 rounded-2xl glass-premium border ${feature.borderColor} hover:border-opacity-60 cursor-default transition-all duration-300`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${feature.bgColor} flex items-center justify-center transition-all duration-300 mt-0.5`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${feature.color}`}>
                        {feature.eyebrow}
                      </span>
                      {feature.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-foreground mb-1 text-base leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatedSection delay={0.5} className="mt-10">
              <Link to="/upload">
                <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl shadow-gold-lg group">
                  Get My Full Reading — ₹99
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3">Free preview included · Instant results · No card needed to start</p>
            </AnimatedSection>
          </div>

          {/* Right - Premium stat card */}
          <AnimatedSection direction="right" className="relative hidden lg:block lg:sticky top-28">
            <div className="relative">
              {/* Decorative glows */}
              <motion.div
                className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl"
                animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-primary/12 blur-3xl"
                animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1.5 }}
              />

              {/* Main card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative card-premium p-8 border border-accent/25 overflow-hidden"
              >
                <div className="absolute inset-0 shimmer" />

                {/* Header */}
                <div className="text-center mb-6 relative z-10">
                  <motion.img
                    src={palmIconGold}
                    alt="AI Palm Reading Analysis"
                    className="w-20 h-20 object-contain mx-auto mb-3"
                    animate={{
                      filter: [
                        'drop-shadow(0 0 20px rgba(255,193,7,0.3))',
                        'drop-shadow(0 0 50px rgba(255,193,7,0.7))',
                        'drop-shadow(0 0 20px rgba(255,193,7,0.3))',
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <p className="text-sm font-medium text-muted-foreground">PalmMitra AI Report</p>
                  <p className="text-xs text-muted-foreground/60">Powered by Hasta Samudrika Shastra</p>
                </div>

                {/* Animated analysis lines */}
                <div className="aspect-video rounded-2xl bg-gradient-mystic relative overflow-hidden mb-6">
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <svg className="w-full h-full" viewBox="0 0 200 100" fill="none">
                      <motion.path
                        d="M20 70 Q60 30 100 60 Q140 90 180 40"
                        stroke="hsl(var(--gold) / 0.6)"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                      />
                      <motion.path
                        d="M20 50 Q70 20 120 45 Q160 65 180 30"
                        stroke="hsl(var(--gold) / 0.35)"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatType: 'loop', delay: 0.5 }}
                      />
                      <motion.path
                        d="M30 80 Q80 55 130 70 Q165 80 185 60"
                        stroke="hsl(var(--gold) / 0.25)"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: 'loop', delay: 1 }}
                      />
                    </svg>
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.p
                      className="text-white/70 text-sm font-medium"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      AI Analysing Your Lines...
                    </motion.p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {reportStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="bg-accent/5 rounded-xl p-4 text-center border border-accent/10"
                    >
                      <div className="text-xl font-serif font-bold text-gradient-gold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Included in report */}
                <div className="mt-5 pt-5 border-t border-border/40 relative z-10">
                  <p className="text-xs font-semibold text-foreground mb-3">Your report includes:</p>
                  <div className="space-y-1.5">
                    {['All 5 major palm lines', 'Mounts & personality analysis', 'Career & wealth turning points', 'Love & marriage timeline', '5-year Lucky Periods map', 'Personalised spiritual remedies'].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{item}</span>
                      </div>
                    ))}
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
