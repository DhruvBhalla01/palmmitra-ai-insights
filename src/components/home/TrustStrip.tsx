import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Star, Lock, Users, Brain, CheckCircle } from 'lucide-react';

const trustItems = [
  { icon: Users, text: '12,400+ readings delivered' },
  { icon: Star, text: '4.9★ from 2,100+ verified users' },
  { icon: Brain, text: 'AI trained on 1,000+ Shastra texts' },
  { icon: Zap, text: 'Full report in under 2 minutes' },
  { icon: ShieldCheck, text: 'Your palm never shared — ever' },
  { icon: Lock, text: 'Razorpay secured · 256-bit SSL' },
  { icon: CheckCircle, text: 'Free preview · No card needed' },
];

export function TrustStrip() {
  return (
    <section className="py-10 relative overflow-hidden" aria-label="Trust indicators">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/40 via-accent/5 to-secondary/40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Top label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs uppercase tracking-widest text-muted-foreground/50 mb-6 font-medium"
        >
          Why 12,000+ people trust PalmMitra
        </motion.p>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2.5 group cursor-default"
            >
              <div className="w-8 h-8 rounded-xl glass-premium flex items-center justify-center border border-accent/15 group-hover:border-accent/35 transition-all duration-300 flex-shrink-0">
                <item.icon className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              </div>
              <span className="font-medium text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
