import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Star, Lock, Users, Brain } from 'lucide-react';

const trustItems = [
  { icon: ShieldCheck, text: 'Your palm never shared — ever' },
  { icon: Brain, text: 'AI trained on 1,000+ palmistry texts' },
  { icon: Zap, text: 'Full report in under 2 minutes' },
  { icon: Lock, text: 'Razorpay secured · 256-bit SSL' },
  { icon: Users, text: '12,400+ readings delivered' },
  { icon: Star, text: '4.9★ from 2,100+ verified users' },
];

export function TrustStrip() {
  return (
    <section className="py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 via-accent/5 to-secondary/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
              whileHover={{ scale: 1.04, y: -2 }}
              className="flex items-center gap-2.5 group cursor-default"
            >
              <div className="w-9 h-9 rounded-xl glass-premium flex items-center justify-center border border-accent/10 group-hover:border-accent/30 transition-colors duration-300">
                <item.icon className="w-4 h-4 text-accent" />
              </div>
              <span className="font-medium text-sm text-foreground">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
