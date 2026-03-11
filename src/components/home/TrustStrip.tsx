import { motion } from 'framer-motion';
import { Shield, Zap, Bot, Star, Lock, Users } from 'lucide-react';

const trustItems = [
  { icon: Shield, text: '100% Private & Safe' },
  { icon: Bot, text: 'AI-Trained Analysis' },
  { icon: Zap, text: 'Instant Results' },
  { icon: Lock, text: 'Secure Payments' },
  { icon: Users, text: '50,000+ Users' },
  { icon: Star, text: 'Rated 4.9★' },
];

export function TrustStrip() {
  return (
    <section className="py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 via-accent/5 to-secondary/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2.5 group cursor-default"
            >
              <motion.div 
                className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center group-hover:border-accent/40 transition-all duration-300"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <item.icon className="w-4 h-4 text-accent" />
              </motion.div>
              <span className="font-medium text-sm text-foreground">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
