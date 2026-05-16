import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Star } from 'lucide-react';

export function MobileCTABar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          role="complementary"
          aria-label="Start palm reading"
        >
          {/* Premium border top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="glass-premium border-t border-accent/15 px-4 py-3 safe-area-bottom bg-background/95 backdrop-blur-xl">
            <Link to="/upload" className="block" aria-label="Scan my palm for free">
              <Button className="btn-gold w-full text-foreground font-semibold py-5 rounded-2xl flex items-center justify-center gap-2 text-base">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                Scan My Palm — Free
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-accent" aria-hidden="true" />
                100% Private
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-accent fill-accent" aria-hidden="true" />
                4.9 Rating
              </span>
              <span aria-hidden="true">·</span>
              <span>Free Preview</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
