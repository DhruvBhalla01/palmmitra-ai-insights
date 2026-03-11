import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield } from 'lucide-react';

export function MobileCTABar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div className="glass-premium border-t border-accent/20 px-4 py-3 safe-area-bottom">
            <Link to="/upload" className="block">
              <Button className="btn-gold w-full text-foreground font-semibold py-5 rounded-2xl flex items-center justify-center gap-2 text-base">
                <Sparkles className="w-5 h-5" />
                Scan My Palm — Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-500" />
                100% Private
              </span>
              <span>•</span>
              <span>Instant Results</span>
              <span>•</span>
              <span>Free Preview</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
