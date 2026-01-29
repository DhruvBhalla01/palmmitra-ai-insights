import { motion } from 'framer-motion';
import { Shield, Flag, Bot, Star } from 'lucide-react';

const trustItems = [
  { icon: Shield, text: '100% Private Upload' },
  { icon: Flag, text: 'Made for India' },
  { icon: Bot, text: 'AI + Expert Verified' },
  { icon: Star, text: 'Rated 4.9 by Users' },
];

export function TrustStrip() {
  return (
    <section className="py-10 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 via-accent/5 to-secondary/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      {/* Decorative borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-3 group cursor-default"
            >
              <motion.div 
                className="w-12 h-12 rounded-2xl glass-premium flex items-center justify-center group-hover:border-accent/40 transition-all duration-300"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <item.icon className="w-5 h-5 text-accent" />
              </motion.div>
              <span className="font-medium text-foreground">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}