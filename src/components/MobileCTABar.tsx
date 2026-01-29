import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function MobileCTABar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (approximately 500px)
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
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          {/* Glass background */}
          <div className="glass-premium border-t border-accent/20 px-4 py-3 safe-area-bottom">
            <Link to="/upload" className="block">
              <Button className="btn-gold w-full text-foreground font-semibold py-5 rounded-2xl flex items-center justify-center gap-2 text-base">
                <Sparkles className="w-5 h-5" />
                Get Your Palm Reading
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            
            {/* Trust indicator */}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                100% Private
              </span>
              <span>•</span>
              <span>AI Powered</span>
              <span>•</span>
              <span>₹99 only</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}