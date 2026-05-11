import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Target, Sparkles, Infinity, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/AnimatedSection';

const heroPalmImg = '/lovable-uploads/41f937d2-cf0d-4793-a69c-892bf8c421eb.png';

const dimensions = [
  { icon: Heart, label: 'Emotional Bond', score: 88, color: 'bg-pink-500' },
  { icon: MessageCircle, label: 'Communication', score: 74, color: 'bg-blue-500' },
  { icon: Target, label: 'Life Goals', score: 82, color: 'bg-accent' },
  { icon: Sparkles, label: 'Romance', score: 91, color: 'bg-amber-500' },
  { icon: Infinity, label: 'Spiritual Alignment', score: 79, color: 'bg-purple-500' },
];

export function PalmMatchTeaser() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center max-w-6xl mx-auto">

          {/* Left: Copy */}
          <AnimatedSection direction="left">
            {/* New badge */}
            <div className="inline-flex items-center gap-2 glass-premium rounded-full px-4 py-2 mb-6 border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-semibold text-accent">New Feature</span>
            </div>

            <p className="sanskrit-accent mb-3 text-muted-foreground">ॐ Yugal Rekha · Compatibility Reading</p>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-5 leading-tight">
              Introducing{' '}
              <span className="text-gradient-gold">PalmMatch</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Upload two palms. Discover your compatibility, emotional bond, and destiny
              alignment — powered by ancient Hast Rekha Shastra and modern AI.
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-accent" />
                Works for couples, friends, siblings, business partners
              </span>
            </div>

            <Link to="/palmmatch">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button className="btn-gold text-foreground font-semibold text-lg px-10 py-7 rounded-2xl group shadow-gold-lg">
                  <Heart className="w-5 h-5 mr-2" />
                  Try PalmMatch — Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </Link>

            <p className="text-xs text-muted-foreground mt-4">
              Free preview included · No sign-up needed · Results in 3 minutes
            </p>
          </AnimatedSection>

          {/* Right: Mockup card */}
          <AnimatedSection direction="right">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="glass-premium rounded-3xl p-6 md:p-8 border border-accent/20 shadow-gold-lg"
            >
              {/* Dual palm visual */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src={heroPalmImg}
                    alt="Palm 1"
                    className="w-20 h-20 object-contain rounded-2xl"
                    style={{ filter: 'drop-shadow(0 0 16px hsl(42 87% 55% / 0.4))' }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">A</div>
                </div>

                {/* Gold connector */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-accent/40 via-accent to-accent/40 rounded-full" />
                  <Heart className="w-5 h-5 text-accent" />
                  <div className="w-12 h-0.5 bg-gradient-to-r from-accent/40 via-accent to-accent/40 rounded-full" />
                </div>

                <div className="relative">
                  <img
                    src={heroPalmImg}
                    alt="Palm 2"
                    className="w-20 h-20 object-contain rounded-2xl scale-x-[-1]"
                    style={{ filter: 'drop-shadow(0 0 16px hsl(42 87% 55% / 0.4))' }}
                  />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">B</div>
                </div>
              </div>

              {/* Overall score */}
              <div className="text-center mb-6">
                <div className="text-4xl font-serif font-bold text-gradient-gold mb-1">87%</div>
                <div className="text-xs text-muted-foreground">Overall Compatibility</div>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent">
                  Soulmate Connection
                </div>
              </div>

              {/* Dimension bars */}
              <div className="space-y-3">
                {dimensions.map(({ icon: Icon, label, score, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <Icon className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-accent w-8 text-right">{score}%</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground mt-5 italic">
                *Sample report — your results will be personalised to your palms
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
