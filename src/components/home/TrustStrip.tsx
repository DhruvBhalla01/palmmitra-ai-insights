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
    <section className="py-8 bg-secondary/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium text-foreground">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
